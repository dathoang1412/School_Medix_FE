import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getSession } from "../../../config/Supabase";
import { ChildContext } from "../../../layouts/ParentLayout";
import { Download, FileText, ChevronDown, X } from "lucide-react";
import PDFViewer from "../../../components/PDFViewer";

const CheckupHistoryInfo = () => {
  const { selectedChild } = useContext(ChildContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    download: {},
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

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

  useEffect(() => {
    if (!isAuthenticated || !selectedChild?.id) return;

    const fetchHistory = async () => {
      setLoading((prev) => ({ ...prev, fetch: true }));
      try {
        const res = await axiosClient.get(
          `/student/${selectedChild.id}/full-record`
        );
        setList(res.data.data);
      } catch (error) {
        enqueueSnackbar("Không thể tải lịch sử kiểm tra sức khỏe!", {
          variant: "error",
        });
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };

    fetchHistory();
  }, [isAuthenticated, selectedChild?.id, enqueueSnackbar]);

  const handleRecordDownload = async (recordUrl, id, type = "general") => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để tải file!", { variant: "error" });
      navigate("/login");
      return;
    }

    if (!recordUrl) {
      enqueueSnackbar("Không có file kết quả cho bản ghi này!", {
        variant: "warning",
      });
      return;
    }

    const downloadId = type === "general" ? id : `${id}_${type}`;
    setLoading((prev) => ({
      ...prev,
      download: { ...prev.download, [downloadId]: true },
    }));
    try {
      const response = await fetch(recordUrl);
      if (!response.ok) throw new Error("Không thể tải file PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `record-${downloadId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Tải file PDF thành công!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Không thể tải file PDF!", { variant: "error" });
    } finally {
      setLoading((prev) => ({
        ...prev,
        download: { ...prev.download, [downloadId]: false },
      }));
    }
  };

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "WAITING":
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-medium rounded-full">
            Chờ khám
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

  const renderSpecialistExams = (specialistExams, healthRecordId) => {
    if (!specialistExams || specialistExams.length === 0) {
      return (
        <div className="text-gray-500 text-sm italic">Không có chuyên khoa</div>
      );
    }

    return (
      <div className="space-y-2">
        {specialistExams.map((exam) => (
          <div
            key={exam.spe_exam_id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-gray-800 font-medium text-sm">{exam.specialist_name}</span>
              {getStatusBadge(exam.record_status)}
            </div>
            <div className="flex space-x-2">
              {exam.record_url?.length > 0 && (
                <button
                  onClick={() => handleViewPDF(exam.record_url[0])}
                  className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                  title="Xem PDF chuyên khoa"
                >
                  <FileText className="h-4 w-4" />
                </button>
              )}
              {exam.record_url?.length > 0 && (
                <button
                  onClick={() => handleRecordDownload(exam.record_url[0], healthRecordId, exam.spe_exam_id)}
                  disabled={loading.download[`${healthRecordId}_${exam.spe_exam_id}`]}
                  className={`inline-flex items-center justify-center w-8 h-8 border rounded-md transition-colors ${
                    loading.download[`${healthRecordId}_${exam.spe_exam_id}`]
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-green-300 bg-white text-green-600 hover:bg-green-50 hover:border-green-400"
                  }`}
                  title={loading.download[`${healthRecordId}_${exam.spe_exam_id}`] ? "Đang tải..." : "Tải PDF chuyên khoa"}
                >
                  {loading.download[`${healthRecordId}_${exam.spe_exam_id}`] ? (
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
              )}
            </div>
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
            <h3 className="text-lg font-semibold text-gray-800">Chi tiết hồ sơ sức khỏe</h3>
            <button
              onClick={closeFullDetailsModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors"
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
                Chiến dịch: {selectedRecord.campaign_name} | Mã hồ sơ: #{selectedRecord.health_record_id}
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
                  Khám tổng quát
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Thông số cơ bản</h5>
                    {[
                      { label: "Chiều cao", value: selectedRecord.height || "_ _ _ " },
                      { label: "Cân nặng", value: selectedRecord.weight || "_ _ _ " },
                      { label: "Huyết áp", value: selectedRecord.blood_pressure || "_ _ _ " },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start">
                        <label className="w-1/3 text-sm font-medium text-gray-600">{label}</label>
                        <p className="flex-1 text-sm text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Thị lực</h5>
                    {[
                      { label: "Mắt trái", value: selectedRecord.left_eye || "_ _ _ " },
                      { label: "Mắt phải", value: selectedRecord.right_eye || "_ _ _ " },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start">
                        <label className="w-1/3 text-sm font-medium text-gray-600">{label}</label>
                        <p className="flex-1 text-sm text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <h5 className="text-sm font-medium text-gray-700">Khám các bộ phận</h5>
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
                        <label className="w-1/3 text-sm font-medium text-gray-600">{label}</label>
                        <p className="flex-1 text-sm text-gray-800">{value || "_ _ _ "}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600">Chẩn đoán cuối cùng</label>
                  <p className="text-sm text-gray-800">{selectedRecord.final_diagnosis || "Chưa có chẩn đoán"}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
                  Khám chuyên khoa
                </h4>
                {renderSpecialistExams(selectedRecord.specialist_exam_records, selectedRecord.health_record_id)}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={closeFullDetailsModal}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
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
          <p className="text-gray-600 text-sm">Không có dữ liệu lịch sử kiểm tra sức khỏe</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm font-semibold">
              <th className="px-4 py-3 text-left border-r border-gray-200">Mã hồ sơ</th>
              <th className="px-4 py-3 text-left border-r border-gray-200">Tên học sinh</th>
              <th className="px-4 py-3 text-left border-r border-gray-200">Chiến dịch</th>
              <th className="px-4 py-3 text-left border-r border-gray-200">Chuyên khoa</th>
              <th className="px-4 py-3 text-left border-r border-gray-200">Trạng thái</th>
              <th className="px-4 py-3 text-center border-r border-gray-200">Tải kết quả</th>
              <th className="px-4 py-3 text-center">Xem chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <>
                <tr key={item.health_record_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 font-mono">
                    #{item.health_record_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium">
                    {item.student_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200">
                    {item.campaign_name}
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <button
                      onClick={() => toggleRow(item.health_record_id)}
                      className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                      title="Xem chuyên khoa"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedRow === item.health_record_id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    {getStatusBadge(item.record_status)}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <button
                      onClick={() =>
                        handleRecordDownload(
                          item.record_url,
                          item.health_record_id
                        )
                      }
                      disabled={
                        !item.record_url ||
                        loading.download[item.health_record_id] ||
                        loading.fetch
                      }
                      className={`inline-flex items-center justify-center w-8 h-8 border rounded-md transition-colors ${
                        !item.record_url ||
                        loading.download[item.health_record_id]
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-green-300 bg-white text-green-600 hover:bg-green-50 hover:border-green-400"
                      } ${loading.fetch ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={
                        loading.download[item.health_record_id]
                          ? "Đang tải..."
                          : item.record_url
                          ? "Tải kết quả PDF"
                          : "Không có file kết quả"
                      }
                    >
                      {loading.download[item.health_record_id] ? (
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
                      className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                      title="Xem chi tiết"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                {expandedRow === item.health_record_id && (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                      <div className="text-sm">
                        {renderSpecialistExams(item.specialist_exam_records, item.health_record_id)}
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

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lịch sử kiểm tra sức khỏe</h2>
          <p className="text-sm text-gray-600 mt-1">
            Xem lịch sử kiểm tra sức khỏe của {selectedChild?.name || "học sinh"}
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
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
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