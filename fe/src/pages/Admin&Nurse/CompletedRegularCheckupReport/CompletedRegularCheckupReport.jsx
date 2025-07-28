import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { ArrowLeft, Download, FileText, X, FileDown } from "lucide-react";
import PDFViewer from "../../../components/PDFViewer";
import { debounce } from "lodash";
import { getUserRole } from "../../../service/authService";

const CompletedRegularCheckupReport = () => {
  const [generalHealthList, setGeneralHealthList] = useState([]);
  const [specialistList, setSpecialistList] = useState([]);
  const [mainTabs, setMainTabs] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState("Khám tổng quát");
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [loading, setLoading] = useState({
    general: false,
    specialist: false,
    tabs: false,
    bulkDownload: false,
  });
  const [downloading, setDownloading] = useState(new Set());
  const [error, setError] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { campaign_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchTabs = async () => {
    setLoading((prev) => ({ ...prev, tabs: true }));
    try {
      console.log(`Fetching tabs for campaign_id: ${campaign_id}`);
      const response = await axiosClient.get(
        `/campaign/${campaign_id}/specialist-exam/record`
      );
      console.log("TABS RESPONSE:", response.data);
      const specialistTabs = response.data.data.map((el) => el.name);
      setMainTabs(
        specialistTabs.length
          ? ["Khám tổng quát", "Chuyên khoa"]
          : ["Khám tổng quát"]
      );
      setActiveSubTab(specialistTabs[0] || null);
    } catch (error) {
      console.error("Error fetching tabs:", error.response || error);
      enqueueSnackbar("Không thể tải danh sách tab chuyên khoa!", {
        variant: "error",
      });
      setError("Không thể tải danh sách tab chuyên khoa!");
    } finally {
      setLoading((prev) => ({ ...prev, tabs: false }));
    }
  };

  const fetchGeneralList = async () => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      console.log(`Fetching general list for campaign_id: ${campaign_id}`);
      const res = await axiosClient.get(
        `/health-record/campaign/${campaign_id}`
      );
      console.log("GENERAL LIST RESPONSE:", res.data);
      setGeneralHealthList(res.data.data || []);
      if (!res.data.data?.length) {
        enqueueSnackbar("Không có dữ liệu khám tổng quát!", {
          variant: "info",
        });
      }
    } catch (error) {
      console.error("Error fetching general list:", error.response || error);
      enqueueSnackbar(
        `Không thể tải danh sách khám tổng quát: ${error.message}`,
        {
          variant: "error",
        }
      );
      setError(`Không thể tải danh sách khám tổng quát: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  const fetchSpecialistList = async () => {
    setLoading((prev) => ({ ...prev, specialist: true }));
    try {
      console.log(`Fetching specialist list for campaign_id: ${campaign_id}`);
      const res = await axiosClient.get(
        `/campaign/${campaign_id}/specialist-exam/record`
      );
      console.log("SPECIALIST RESPONSE:", res.data);
      setSpecialistList(res.data.data || []);
      if (!res.data.data?.length) {
        enqueueSnackbar("Không có dữ liệu khám chuyên khoa!", {
          variant: "info",
        });
      }
    } catch (error) {
      console.error("Error fetching specialist:", error.response || error);
      enqueueSnackbar(
        `Không thể tải danh sách khám chuyên khoa: ${error.message}`,
        {
          variant: "error",
        }
      );
      setError(`Không thể tải danh sách khám chuyên khoa: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, specialist: false }));
    }
  };

  const handleRecordDownload = debounce(
    async (recordUrl, registerId, type = "general") => {
      if (!recordUrl) {
        enqueueSnackbar("Không có file kết quả cho hồ sơ này!", {
          variant: "warning",
        });
        return;
      }

      const downloadId =
        type === "general" ? registerId : `${registerId}_${type}`;
      setDownloading((prev) => new Set(prev).add(downloadId));
      try {
        console.log("Downloading record URL:", recordUrl);
        const response = await fetch(recordUrl);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `record-${downloadId}.${recordUrl.split(".").pop()}`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        enqueueSnackbar("Tải file thành công!", { variant: "success" });
      } catch (error) {
        console.error("Error downloading file:", error);
        enqueueSnackbar(`Không thể tải file: ${error.message}`, {
          variant: "error",
        });
      } finally {
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(downloadId);
          return next;
        });
      }
    },
    300
  );

  const handleFinalReportDownload = debounce(async (studentId, registerId) => {
    setDownloading((prev) => new Set(prev).add(`finalReport_${registerId}`));
    try {
      console.log(
        `Downloading final report for campaign_id: ${campaign_id}, student_id: ${studentId}`
      );
      const response = await axiosClient.get(
        `/campaign/${campaign_id}/student/${studentId}/download-final-report`,
        { responseType: "blob" }
      );

      const contentType = response.headers["content-type"];
      if (contentType.includes("application/json")) {
        const text = await new Response(response.data).text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || "Lỗi tải báo cáo cuối cùng");
      }

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `final-report-${campaign_id}-${studentId}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Tải báo cáo cuối cùng thành công!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error downloading final report:", error);
      enqueueSnackbar(`Không thể tải báo cáo cuối cùng: ${error.message}`, {
        variant: "error",
      });
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(`finalReport_${registerId}`);
        return next;
      });
    }
  }, 300);

  const handleViewDetails = async (record) => {
    setDownloading((prev) =>
      new Set(prev).add(`details_${record.register_id}`)
    );
    try {
      console.log(
        `Fetching full record for campaign_id: ${campaign_id}, student_id: ${record.id}`
      );
      const response = await axiosClient.get(
        `/full-record/campaign/${campaign_id}/student/${record.id}`
      );
      console.log("FULL RECORD RESPONSE:", response.data);
      const fullRecord = response.data.data[0];
      if (!fullRecord) {
        throw new Error("Không tìm thấy hồ sơ chi tiết!");
      }
      setSelectedRecord(fullRecord);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching full record:", error.response || error);
      enqueueSnackbar(
        error.response?.data?.message ||
          `Không thể tải chi tiết hồ sơ: ${error.message}`,
        { variant: "error" }
      );
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(`details_${record.register_id}`);
        return next;
      });
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRecord(null);
  };

  const handleBulkReportDownload = debounce(async () => {
    setLoading((prev) => ({ ...prev, bulkDownload: true }));
    try {
      console.log(`Fetching bulk report for campaign_id: ${campaign_id}`);
      const response = await axiosClient.get(
        `/campaign/${campaign_id}/download-health-record-result`,
        { responseType: "blob" }
      );
      const contentType = response.headers["content-type"];
      if (contentType.includes("application/json")) {
        const errorData = JSON.parse(await response.data.text());
        throw new Error(errorData.message || "Lỗi tải báo cáo Excel");
      }
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `health-records-${campaign_id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      enqueueSnackbar("Tải báo cáo Excel thành công!", { variant: "success" });
    } catch (error) {
      console.error("Error downloading bulk report:", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          `Không thể tải báo cáo Excel: ${error.message}`,
        { variant: "error" }
      );
      setError(`Không thể tải báo cáo Excel: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, bulkDownload: false }));
    }
  }, 300);

  const getStatusBadge = (status) => {
    switch (status) {
      case "WAITING":
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 text-gray-600 border border-amber-200 text-xs font-medium rounded-full">
            Không khám
          </span>
        );
      case "DONE":
        return (
          <span className="px-2.5 py-0.5 bg-green-50 text-green-600 border border-green-200 text-xs font-medium rounded-full">
            Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-full">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium rounded-full">
            Không xác định
          </span>
        );
    }
  };

  const handleViewPDF = (url, id) => {
    setSelectedPDFUrl(url);
    setShowPDFModal(true);
  };

  const renderSpecialistExams = (specialistExams, registerId) => {
    if (!specialistExams || specialistExams.length === 0) {
      return (
        <div className="text-gray-500 text-sm italic">Không có chuyên khoa</div>
      );
    }

    return (
      <div className="space-y-4">
        {specialistExams.map((exam) => (
          <div
            key={exam.spe_exam_id}
            className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-gray-800 font-medium text-sm">
                  {exam.specialist_name}
                </span>
                {getStatusBadge(exam.record_status || exam.status)}
              </div>
              <div className="flex space-x-2">
                {exam.record_url?.length > 0 &&
                  exam.record_url[0].endsWith(".pdf") && (
                    <>
                      <button
                        onClick={() =>
                          handleViewPDF(exam.record_url[0], exam.spe_exam_id)
                        }
                        className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                        title="Xem PDF chuyên khoa"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleRecordDownload(
                            exam.record_url[0],
                            registerId,
                            exam.spe_exam_id
                          )
                        }
                        disabled={downloading.has(
                          `${registerId}_${exam.spe_exam_id}`
                        )}
                        className={`inline-flex items-center justify-center w-8 h-8 border rounded-md transition-colors ${
                          downloading.has(`${registerId}_${exam.spe_exam_id}`)
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-green-300 bg-white text-green-600 hover:bg-green-50 hover:border-green-400"
                        }`}
                        title={
                          downloading.has(`${registerId}_${exam.spe_exam_id}`)
                            ? "Đang tải..."
                            : "Tải PDF chuyên khoa"
                        }
                      >
                        {downloading.has(
                          `${registerId}_${exam.spe_exam_id}`
                        ) ? (
                          <svg
                            className="animate-spin h-4 w-4 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}
              </div>
            </div>
            {exam.record_url?.length > 0 && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exam.record_url.map((url, index) => (
                  <div key={index} className="relative">
                    {url.endsWith(".jpg") ||
                    url.endsWith(".png") ||
                    url.endsWith(".jpeg") ? (
                      <img
                        src={url}
                        alt={`Hình ảnh chuyên khoa ${exam.specialist_name} ${
                          index + 1
                        }`}
                        className="w-full max-w-xs rounded-md border border-gray-200 object-contain"
                        onError={(e) => {
                          e.target.alt = "Không thể tải hình ảnh";
                          e.target.className =
                            "w-full max-w-xs rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 text-sm";
                          e.target.src = "";
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 text-sm">
                        File không phải hình ảnh:{" "}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Xem file
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedRecord) return null;
    return (
      <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết hồ sơ sức khỏe
            </h3>
            <button
              onClick={closeDetailsModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {downloading.has(`details_${selectedRecord.health_record_id}`) ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-gray-600">Đang tải chi tiết...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800">
                    Học sinh: {selectedRecord.student_name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Chiến dịch: {selectedRecord.campaign_name} | Mã hồ sơ: #
                    {selectedRecord.health_record_id}
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
                      Khám tổng quát
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-gray-700">
                          Thông số cơ bản
                        </h5>
                        {[
                          {
                            label: "Chiều cao",
                            value: selectedRecord.height || "_ _ _",
                          },
                          {
                            label: "Cân nặng",
                            value: selectedRecord.weight || "_ _ _",
                          },
                          {
                            label: "Huyết áp",
                            value: selectedRecord.blood_pressure || "_ _ _",
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-start">
                            <label className="w-1/3 text-sm font-medium text-gray-600">
                              {label}
                            </label>
                            <p className="flex-1 text-sm text-gray-800">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-gray-700">
                          Thị lực
                        </h5>
                        {[
                          {
                            label: "Mắt trái",
                            value: selectedRecord.left_eye || "_ _ _",
                          },
                          {
                            label: "Mắt phải",
                            value: selectedRecord.right_eye || "_ _ _",
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-start">
                            <label className="w-1/3 text-sm font-medium text-gray-600">
                              {label}
                            </label>
                            <p className="flex-1 text-sm text-gray-800">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      <h5 className="text-sm font-medium text-gray-700">
                        Khám các bộ phận
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { label: "Tai", value: selectedRecord.ear },
                          { label: "Mũi", value: selectedRecord.nose },
                          { label: "Họng", value: selectedRecord.throat },
                          { label: "Răng", value: selectedRecord.teeth },
                          { label: "Lợi", value: selectedRecord.gums },
                          { label: "Da", value: selectedRecord.skin_condition },
                          { label: "Tim", value: selectedRecord.heart },
                          { label: "Phổi", value: selectedRecord.lungs },
                          { label: "Cột sống", value: selectedRecord.spine },
                          { label: "Tư thế", value: selectedRecord.posture },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-start">
                            <label className="w-1/3 text-sm font-medium text-gray-600">
                              {label}
                            </label>
                            <p className="flex-1 text-sm text-gray-800">
                              {value || "_ _ _"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600">
                        Chẩn đoán cuối cùng
                      </label>
                      <p className="text-sm text-gray-800">
                        {selectedRecord.final_diagnosis || "Chưa có chẩn đoán"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
                      Khám chuyên khoa
                    </h4>
                    {renderSpecialistExams(
                      selectedRecord.specialist_exam_records,
                      selectedRecord.health_record_id
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={closeDetailsModal}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    console.log("useEffect triggered with campaign_id:", campaign_id);
    if (!campaign_id) {
      setError("Không tìm thấy campaign_id!");
      setLoading((prev) => ({
        ...prev,
        general: false,
        specialist: false,
        tabs: false,
      }));
      enqueueSnackbar("Không tìm thấy campaign_id!", { variant: "error" });
      return;
    }

    const fetchAllData = async () => {
      setLoading((prev) => ({
        ...prev,
        general: true,
        specialist: true,
        tabs: true,
      }));
      setError(null);
      try {
        await Promise.all([
          fetchTabs(),
          fetchGeneralList(),
          fetchSpecialistList(),
        ]);
      } catch (error) {
        console.error("Error fetching all data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        enqueueSnackbar("Lỗi khi tải dữ liệu!", { variant: "error" });
      }
    };
    fetchAllData();
  }, [campaign_id]);

  const renderHealthTable = (records, type) => (
    <div className="overflow-x-auto">
      {loading[type] || loading.tabs ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đăng ký
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên học sinh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lớp
              </th>
              {type === "specialist" && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kết quả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chẩn đoán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              {type === "general" && (
                <>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tải báo cáo cuối
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xem chi tiết
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((item) => (
              <tr key={item.register_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{item.register_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Link
                    to={`/nurse/student-overview/${item.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {item.student_name || "N/A"}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.class_name}
                </td>
                {type === "specialist" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.result || "Chưa cập nhật"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.diagnosis || "Chưa cập nhật"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.diagnosis_paper_urls?.length > 0 ? (
                        <div className="flex space-x-2">
                          {item.diagnosis_paper_urls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Hình {index + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        "Chưa có hình"
                      )}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                {type === "general" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() =>
                          handleFinalReportDownload(
                            item.id,
                            item.register_id,
                            campaign_id
                          )
                        }
                        disabled={
                          downloading.has(`finalReport_${item.register_id}`) ||
                          loading.general
                        }
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          downloading.has(`finalReport_${item.register_id}`)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700"
                        } ${
                          loading.general ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={
                          downloading.has(`finalReport_${item.register_id}`)
                            ? "Đang tải..."
                            : "Tải báo cáo cuối cùng"
                        }
                        aria-label={
                          downloading.has(`finalReport_${item.register_id}`)
                            ? "Đang tải..."
                            : "Tải báo cáo cuối cùng"
                        }
                      >
                        {downloading.has(`finalReport_${item.register_id}`) ? (
                          <svg
                            className="animate-spin h-4 w-4 text-gray-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <FileDown className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetails(item)}
                        disabled={
                          loading.general ||
                          downloading.has(`details_${item.register_id}`)
                        }
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          loading.general ||
                          downloading.has(`details_${item.register_id}`)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                        }`}
                        title={
                          downloading.has(`details_${item.register_id}`)
                            ? "Đang tải chi tiết..."
                            : "Xem chi tiết"
                        }
                        aria-label={
                          downloading.has(`details_${item.register_id}`)
                            ? "Đang tải chi tiết..."
                            : "Xem chi tiết"
                        }
                      >
                        {downloading.has(`details_${item.register_id}`) ? (
                          <svg
                            className="animate-spin h-4 w-4 text-gray-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const tabData = useMemo(() => {
    if (activeMainTab === "Khám tổng quát") {
      return { records: generalHealthList, type: "general" };
    }
    const specialistData = specialistList.find(
      (item) => item.name === activeSubTab
    ) || {
      records: [],
    };
    return { records: specialistData.records || [], type: "specialist" };
  }, [activeMainTab, activeSubTab, generalHealthList, specialistList]);

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/${getUserRole()}/regular-checkup`)}
          className="cursor-pointer flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Quay lại danh sách kiểm tra định kỳ"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </button>
        <div className="flex space-x-4">
          <button
            onClick={handleBulkReportDownload}
            disabled={loading.bulkDownload}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              loading.bulkDownload
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700"
            }`}
            aria-label="Tải xuống báo cáo"
          >
            {loading.bulkDownload ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {loading.bulkDownload ? "Đang tải..." : "Tải xuống báo cáo"}
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Main Tabs">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`${
                activeMainTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              aria-current={activeMainTab === tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeMainTab === "Chuyên khoa" && (
        <div className="border-b border-gray-200 mb-4">
          {specialistList.length > 0 ? (
            <nav
              className="-mb-px flex space-x-4 overflow-x-auto"
              aria-label="Sub Tabs"
            >
              {specialistList.map((specialist) => (
                <button
                  key={specialist.name}
                  onClick={() => setActiveSubTab(specialist.name)}
                  className={`${
                    activeSubTab === specialist.name
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm transition-colors`}
                  aria-current={
                    activeSubTab === specialist.name ? "page" : undefined
                  }
                >
                  {specialist.name}
                </button>
              ))}
            </nav>
          ) : (
            <p className="text-gray-500 text-sm">Không có chuyên khoa nào.</p>
          )}
        </div>
      )}

      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeMainTab === "Khám tổng quát"
              ? "Khám tổng quát"
              : activeSubTab || "Chuyên khoa"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {tabData.records.length} học sinh
          </p>
        </div>
        {renderHealthTable(tabData.records, tabData.type)}
      </div>

      {showPDFModal && selectedPDFUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Xem kết quả PDF
              </h3>
              <button
                onClick={() => {
                  setShowPDFModal(false);
                  setSelectedPDFUrl(null);
                }}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <PDFViewer record_url={selectedPDFUrl} />
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowPDFModal(false);
                  setSelectedPDFUrl(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {renderDetailsModal()}
    </div>
  );
};

export default CompletedRegularCheckupReport;