import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { supabase, getSession } from "../../../config/Supabase";
import { ArrowLeft, Check, Upload, Download, FileText } from "lucide-react";
import PDFViewer from "../../../components/PDFViewer";

const RegularCheckupReport = () => {
  const [generalHealthList, setGeneralHealthList] = useState([]);
  const [specialistList, setSpecialistList] = useState([]);
  const [tabs, setTabs] = useState(["Khám tổng quát"]);
  const [activeTab, setActiveTab] = useState("Khám tổng quát");
  const [loading, setLoading] = useState({
    general: false,
    specialist: false,
    tabs: false,
    upload: false,
    download: {}, // Object to track download loading state for each record
    templateDownload: false, // Loading state for template download
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false); // New state for PDF modal
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null); // New state for selected PDF URL
  const { checkup_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await getSession();
      if (error || !data.session) {
        enqueueSnackbar("Vui lòng đăng nhập để tiếp tục!", {
          variant: "error",
        });
        navigate("/login");
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [navigate, enqueueSnackbar]);

  // Fetch tabs for specialist exams
  const fetchTabs = async () => {
    setLoading((prev) => ({ ...prev, tabs: true }));
    try {
      const response = await axiosClient.get(
        `/campaign/${checkup_id}/specialist-exam/record`
      );
      const specialistTabs = response.data.data.map((el) => el.name);
      setTabs(["Khám tổng quát", ...specialistTabs]);
    } catch (error) {
      console.error("Error fetching tabs:", error);
      enqueueSnackbar("Không thể tải danh sách tab chuyên khoa!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, tabs: false }));
    }
  };

  // Fetch general health records
  const fetchGeneralList = async () => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      const res = await axiosClient.get(
        `/health-record/campaign/${checkup_id}`
      );
      console.log("General List: ", res.data.data);
      setGeneralHealthList(res.data.data);
    } catch (error) {
      console.error("Error fetching general health data:", error);
      enqueueSnackbar("Không thể tải danh sách khám tổng quát!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  // Fetch specialist exam records
  const fetchSpecialistList = async () => {
    setLoading((prev) => ({ ...prev, specialist: true }));
    try {
      const res = await axiosClient.get(
        `/campaign/${checkup_id}/specialist-exam/record`
      );
      console.log("Specialist List: ", res.data.data);
      setSpecialistList(res.data.data);
    } catch (error) {
      console.error("Error fetching specialist data:", error);
      enqueueSnackbar("Không thể tải danh sách khám chuyên khoa!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, specialist: false }));
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để tải file lên!", {
        variant: "error",
      });
      navigate("/login");
      return;
    }

    const file = event.target.files[0];
    if (!file) {
      enqueueSnackbar("Vui lòng chọn một file Excel!", { variant: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading((prev) => ({ ...prev, upload: true }));
    try {
      const response = await axiosClient.post(
        `/campaign/${checkup_id}/upload-health-record-result`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      enqueueSnackbar(response.data.message || "Tải file thành công!", {
        variant: "success",
      });
      await fetchGeneralList(); // Refresh general health list
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Lỗi khi tải file lên!",
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  // Handle template file download
  const handleFileDownload = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để tải file!", { variant: "error" });
      navigate("/login");
      return;
    }

    setLoading((prev) => ({ ...prev, templateDownload: true }));
    try {
      const response = await axiosClient.get(
        `/campaign/${checkup_id}/import-health-record-form`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `health-records-${checkup_id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Tải file thành công!", { variant: "success" });
    } catch (error) {
      console.error("Error downloading file:", error);
      enqueueSnackbar(error.response?.data?.message || "Không thể tải file!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, templateDownload: false }));
    }
  };

  // Handle PDF download for a specific record
  const handleRecordDownload = async (recordUrl, registerId) => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để tải file!", { variant: "error" });
      navigate("/login");
      return;
    }

    if (!recordUrl) {
      enqueueSnackbar("Không có file kết quả cho hồ sơ này!", {
        variant: "warning",
      });
      return;
    }

    setLoading((prev) => ({
      ...prev,
      download: { ...prev.download, [registerId]: true },
    }));
    try {
      const response = await fetch(recordUrl);
      if (!response.ok) throw new Error("Không thể tải file PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `record-${registerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Tải file PDF thành công!", { variant: "success" });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      enqueueSnackbar("Không thể tải file PDF!", { variant: "error" });
    } finally {
      setLoading((prev) => ({
        ...prev,
        download: { ...prev.download, [registerId]: false },
      }));
    }
  };

  // Handle PDF preview
  const handleViewPDF = (recordUrl) => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để xem file!", { variant: "error" });
      navigate("/login");
      return;
    }

    if (!recordUrl) {
      enqueueSnackbar("Không có file kết quả để xem!", { variant: "warning" });
      return;
    }

    setSelectedPDFUrl(recordUrl);
    setShowPDFModal(true);
  };

  // Fetch all data concurrently
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchTabs(),
          fetchGeneralList(),
          fetchSpecialistList(),
        ]);
      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    };
    fetchAllData();
  }, [isAuthenticated]);

  // Handle status update for general or specialist exams
  const handleStatusUpdate = async (
    speId,
    registerId,
    currentStatus,
    type = "general"
  ) => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để cập nhật trạng thái!", {
        variant: "error",
      });
      navigate("/login");
      return;
    }

    if (currentStatus === "DONE") return;

    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === "general") {
        await axiosClient.patch(`/health-record/${registerId}/done`);
        setGeneralHealthList((prev) =>
          prev.map((item) =>
            item.register_id === registerId ? { ...item, status: "DONE" } : item
          )
        );
      } else {
        await axiosClient.patch(
          `/checkup-register/${registerId}/specialist-exam/${speId}/done`
        );
        setSpecialistList((prev) =>
          prev.map((specialist) => ({
            ...specialist,
            records: specialist.records.map((item) =>
              item.register_id === registerId && item.spe_exam_id === speId
                ? { ...item, status: "DONE" }
                : item
            ),
          }))
        );
      }
      enqueueSnackbar("Cập nhật trạng thái thành công!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật trạng thái!",
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Render status badge
  const getStatusBadge = (status) => {
    return status === "WAITING" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Chờ khám
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Hoàn thành
      </span>
    );
  };

  // Render table for health records
  const renderHealthTable = (records, type) => (
    <div className="overflow-x-auto">
      {loading[type] ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hoàn thành
              </th>
              {type === "general" && (
                <>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tải kết quả
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
                  {item.student_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.class_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        item.spe_exam_id,
                        item.register_id,
                        item.status,
                        type
                      )
                    }
                    disabled={item.status === "DONE" || loading[type]}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      item.status === "DONE"
                        ? "bg-green-100 text-green-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                    } ${loading[type] ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={
                      item.status === "DONE"
                        ? "Đã hoàn thành"
                        : "Đánh dấu hoàn thành"
                    }
                    aria-label={
                      item.status === "DONE"
                        ? "Đã hoàn thành"
                        : "Đánh dấu hoàn thành"
                    }
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </td>
                {type === "general" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() =>
                          handleRecordDownload(
                            item.record_url,
                            item.register_id
                          )
                        }
                        disabled={
                          !item.record_url ||
                          loading.download[item.register_id] ||
                          loading[type]
                        }
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          !item.record_url || loading.download[item.register_id]
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700"
                        } ${
                          loading[type] ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={
                          loading.download[item.register_id]
                            ? "Đang tải..."
                            : item.record_url
                            ? "Tải kết quả PDF"
                            : "Không có file kết quả"
                        }
                        aria-label={
                          loading.download[item.register_id]
                            ? "Đang tải..."
                            : item.record_url
                            ? "Tải kết quả PDF"
                            : "Không có file kết quả"
                        }
                      >
                        {loading.download[item.register_id] ? (
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
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewPDF(item.record_url)}
                        disabled={!item.record_url || loading[type]}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          !item.record_url || loading[type]
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                        }`}
                        title={
                          item.record_url
                            ? "Xem chi tiết PDF"
                            : "Không có file kết quả"
                        }
                        aria-label={
                          item.record_url
                            ? "Xem chi tiết PDF"
                            : "Không có file kết quả"
                        }
                      >
                        <FileText className="h-4 w-4" />
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

  // Memoized tab data
  const tabData = useMemo(() => {
    if (activeTab === "Khám tổng quát") {
      return { records: generalHealthList, type: "general" };
    }
    const specialistData = specialistList.find(
      (item) => item.name === activeTab
    ) || {
      records: [],
    };
    return { records: specialistData.records || [], type: "specialist" };
  }, [activeTab, generalHealthList, specialistList]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-500">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/nurse/regular-checkup")}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Quay lại danh sách kiểm tra định kỳ"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </button>
        <div className="flex space-x-4">
          <label
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              loading.upload
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
            }`}
          >
            {loading.upload ? (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-gray-600"
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
              <Upload className="h-4 w-4 mr-2" />
            )}
            {loading.upload ? "Đang tải lên..." : "Tải lên kết quả"}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading.upload}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
          <button
            onClick={handleFileDownload}
            disabled={loading.templateDownload}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              loading.templateDownload
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            aria-label="Tải xuống mẫu kết quả"
          >
            {loading.templateDownload ? (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-gray-600"
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
            {loading.templateDownload ? "Đang tải..." : "Tải xuống mẫu"}
          </button>
        </div>
      </div>

      {/* Tab Header */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{activeTab}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {tabData.records.length} học sinh
          </p>
        </div>
        {renderHealthTable(tabData.records, tabData.type)}
      </div>

      {/* PDF Preview Modal */}
      {showPDFModal && selectedPDFUrl && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 w-full max-w-5xl h-[85vh] mx-4">
            <div className="h-full flex flex-col">
              <div className="flex-1 p-1">
                <PDFViewer record_url={selectedPDFUrl} />
              </div>
              <div className="border-t border-gray-300 p-3 bg-gray-50">
                <button
                  onClick={() => {
                    setShowPDFModal(false);
                    setSelectedPDFUrl(null);
                  }}
                  className="px-6 py-2 bg-white border border-gray-400 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegularCheckupReport;
