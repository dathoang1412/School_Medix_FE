import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getStudentInfo } from "../../../service/childenService";
import { Download, FileText, ChevronDown, X } from "lucide-react";
import PDFViewer from "../../../components/PDFViewer";
import { getUserRole } from "../../../service/authService";

const CheckupHistoryInfo = () => {
  const { student_id } = useParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    download: {},
  });
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedChild, setSelectedChild] = useState(null);

  // Fetch student info
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const child = await getStudentInfo(student_id);
        setSelectedChild(child);
      } catch (error) {
        enqueueSnackbar("Không thể tải thông tin học sinh!", {
          variant: "error",
        });
      }
    };

    fetchStudentInfo();
  }, [student_id, enqueueSnackbar]);

  // Fetch health history when selectedChild is available
  useEffect(() => {
    if (!selectedChild?.id) return; // Chỉ gọi API khi selectedChild.id tồn tại

    const fetchHistory = async () => {
      setLoading((prev) => ({ ...prev, fetch: true }));
      try {
        const res = await axiosClient.get(
          `/student/${selectedChild.id}/full-record`
        );
        console.log("Checkup history detail: ", res.data.data);
        setList(res.data.data);
      } catch (error) {
        console.error("Error fetching health history:", error);
        enqueueSnackbar(
          `Không thể tải lịch sử kiểm tra sức khỏe: ${
            error.response?.data?.message || error.message
          }`,
          { variant: "error" }
        );
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };

    fetchHistory();
  }, [selectedChild?.id, enqueueSnackbar]);

  const handleRecordDownload = async (studentId, campaignId) => {
    const downloadId = `${studentId}_${campaignId}`;
    setLoading((prev) => ({
      ...prev,
      download: { ...prev.download, [downloadId]: true },
    }));

    try {
      const response = await axiosClient.get(
        `/campaign/${campaignId}/student/${studentId}/download-final-report`,
        {
          responseType: "blob", // QUAN TRỌNG để tải file nhị phân
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `final_report_${studentId}_${campaignId}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Tải file thành công!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        `Không thể tải file: ${error.response?.data?.message || error.message}`,
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        download: { ...prev.download, [downloadId]: false },
      }));
    }
  };

  const handleViewPDF = (recordUrl) => {
    if (!recordUrl) {
      enqueueSnackbar("Không có file kết quả để xem!", { variant: "warning" });
      return;
    }
    setSelectedPDFUrl(recordUrl);
    setShowPDFModal(true);
  };

  const closePDFModal = () => {
    setShowPDFModal(false);
    setSelectedPDFUrl(null);
  };

  const toggleRow = (healthRecordId) => {
    setExpandedRow((prev) => (prev === healthRecordId ? null : healthRecordId));
  };

  const openFullDetailsModal = (record) => {
    setSelectedRecord(record);
    setShowFullDetailsModal(true);
  };

  const closeFullDetailsModal = () => {
    setShowFullDetailsModal(false);
    setSelectedRecord(null);
  };

  const getStatusBadge = (recordStatus, campaignStatus) => {
    if (campaignStatus === "CANCELLED") {
      return (
        <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-full">
          Đã hủy
        </span>
      );
    }
    if (recordStatus === "DONE") {
      return (
        <span className="px-2.5 py-0.5 bg-green-50 text-green-600 border border-green-200 text-xs font-medium rounded-full">
          Hoàn thành
        </span>
      );
    }
    if (campaignStatus === "DONE" || campaignStatus === "COMPLETED") {
      return (
        <span className="px-2.5 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium rounded-full">
          Không khám
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-medium rounded-full">
        Chờ khám
      </span>
    );
  };

  const renderSpecialistExams = (
    specialistExams,
    healthRecordId,
    campaignStatus
  ) => {
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
                {getStatusBadge(exam.record_status, campaignStatus)}
              </div>
              <div className="flex space-x-2">
                {exam.record_url?.length > 0 &&
                  exam.record_url[0].endsWith(".pdf") && (
                    <>
                      <button
                        onClick={() => handleViewPDF(exam.record_url[0])}
                        className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                        title="Xem PDF chuyên khoa"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleRecordDownload(
                            exam.record_url[0],
                            healthRecordId,
                            exam.spe_exam_id
                          )
                        }
                        disabled={
                          loading.download[
                            `${healthRecordId}_${exam.spe_exam_id}`
                          ]
                        }
                        className={`inline-flex items-center justify-center w-8 h-8 border rounded-md transition-colors ${
                          loading.download[
                            `${healthRecordId}_${exam.spe_exam_id}`
                          ]
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-green-300 bg-white text-green-600 hover:bg-green-50 hover:border-green-400"
                        }`}
                        title={
                          loading.download[
                            `${healthRecordId}_${exam.spe_exam_id}`
                          ]
                            ? "Đang tải..."
                            : "Tải PDF chuyên khoa"
                        }
                      >
                        {loading.download[
                          `${healthRecordId}_${exam.spe_exam_id}`
                        ] ? (
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
                    ) : url.endsWith(".pdf") ? null : (
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

  const renderFullDetailsModal = () => {
    if (!selectedRecord) return null;
    return (
      <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết hồ sơ sức khỏe
            </h3>
            <button
              onClick={closeFullDetailsModal}
              className="text-gray-500 cursor-pointer hover:text-gray-700 p-1 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
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
                        <p className="flex-1 text-sm text-gray-800">{value}</p>
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
                        <p className="flex-1 text-sm text-gray-800">{value}</p>
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
                  selectedRecord.health_record_id,
                  selectedRecord.campaign_status
                )}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={closeFullDetailsModal}
              className="px-4 py-2 cursor-pointer bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHealthTable = () => (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {loading.fetch ? (
        <div className="text-center py-12 bg-white">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 bg-white">
          <p className="text-gray-600 text-sm">
            Không có dữ liệu lịch sử kiểm tra sức khỏe
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm font-semibold">
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Mã hồ sơ
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Tên học sinh
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Chiến dịch
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Chuyên khoa
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center border-r border-gray-200">
                Tải kết quả
              </th>
              <th className="px-4 py-3 text-center">Xem chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <>
                <tr
                  key={item.health_record_id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 font-mono">
                    #{item.health_record_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium">
                    {item.student_name}
                  </td>
                  <td onClick={() => {navigate(`/${getUserRole()}/checkup-campaign/${item.campaign_id}`)}}
                  className="px-4 cursor-pointer underline py-3 text-sm text-blue-600 border-r border-gray-200">
                    {item.campaign_name}
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <button
                      onClick={() => toggleRow(item.health_record_id)}
                      className="inline-flex cursor-pointer items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                      title="Xem chuyên khoa"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedRow === item.health_record_id
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    {getStatusBadge(item.record_status, item.campaign_status)}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <button
                      onClick={() =>
                        handleRecordDownload(item.student_id, item.campaign_id)
                      }
                      disabled={
                        loading.download[
                          `${item.student_id}_${item.campaign_id}`
                        ] || loading.fetch
                      }
                      className={`inline-flex cursor-pointer items-center justify-center w-8 h-8 border rounded-md transition-colors ${
                        loading.download[
                          `${item.student_id}_${item.campaign_id}`
                        ]
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-green-300 bg-white text-green-600 hover:bg-green-50 hover:border-green-400"
                      } ${
                        loading.fetch ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title={
                        loading.download[
                          `${item.student_id}_${item.campaign_id}`
                        ]
                          ? "Đang tải..."
                          : "Tải kết quả PDF"
                      }
                    >
                      {loading.download[
                        `${item.student_id}_${item.campaign_id}`
                      ] ? (
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
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openFullDetailsModal(item)}
                      className="inline-flex cursor-pointer items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                      title="Xem chi tiết"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                {expandedRow === item.health_record_id && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-4 bg-gray-50 border-b border-gray-200"
                    >
                      <div className="text-sm">
                        {renderSpecialistExams(
                          item.specialist_exam_records,
                          item.health_record_id,
                          item.campaign_status
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Lịch sử kiểm tra sức khỏe
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Xem lịch sử kiểm tra sức khỏe của{" "}
            {selectedChild?.name || "học sinh"}
          </p>
        </div>
        {renderHealthTable()}
        {showPDFModal && selectedPDFUrl && (
          <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md w-full max-w-5xl h-[90vh] border border-gray-200 shadow-lg">
              <div className="h-full flex flex-col">
                <div className="flex-1 p-2">
                  <PDFViewer record_url={selectedPDFUrl} />
                </div>
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
                  <button
                    onClick={closePDFModal}
                    className="px-4 py-2 cursor-pointer bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {renderFullDetailsModal()}
      </div>
    </div>
  );
};

export default CheckupHistoryInfo;
