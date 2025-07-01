import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getSession } from "../../../config/Supabase";
import { ChildContext } from "../../../layouts/ParentLayout";
import { Download, FileText, ChevronDown } from "lucide-react";
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

  const handleRecordDownload = async (recordUrl, healthRecordId) => {
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
      download: { ...prev.download, [healthRecordId]: true },
    }));
    try {
      const response = await fetch(recordUrl);
      if (!response.ok) throw new Error("Không thể tải file PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `record-${healthRecordId}.pdf`);
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
        download: { ...prev.download, [healthRecordId]: false },
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

  const toggleRow = (healthRecordId) => {
    setExpandedRow((prev) => (prev === healthRecordId ? null : healthRecordId));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "WAITING":
        return (
          <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium">
            Chờ khám
          </span>
        );
      case "DONE":
        return (
          <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
            Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium">
            Không xác định
          </span>
        );
    }
  };

  const renderSpecialistExams = (specialistExams) => {
    if (!specialistExams || specialistExams.length === 0) {
      return (
        <div className="text-gray-500 text-sm">Không có chuyên khoa</div>
      );
    }

    return (
      <div className="space-y-2">
        {specialistExams.map((exam) => (
          <div key={exam.spe_exam_id} className="flex items-center justify-between p-2 bg-white border border-gray-200">
            <span className="text-gray-900 font-medium">{exam.specialist_name}</span>
            {getStatusBadge(exam.record_status)}
          </div>
        ))}
      </div>
    );
  };

  const renderHealthTable = () => (
    <div className="border border-gray-300">
      {loading.fetch ? (
        <div className="text-center py-12 border-b border-gray-300">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 border-b border-gray-300">
          <p className="text-gray-600">
            Không có dữ liệu lịch sử kiểm tra sức khỏe
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                Mã hồ sơ
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                Tên học sinh
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                Chiến dịch
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                Chuyên khoa
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                Tải kết quả
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Xem chi tiết
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <>
                <tr key={item.health_record_id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300 font-mono">
                    #{item.health_record_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300 font-medium">
                    {item.student_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                    {item.campaign_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                    <button
                      onClick={() => toggleRow(item.health_record_id)}
                      className="inline-flex items-center justify-center w-7 h-7 border border-gray-400 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-500 transition-colors"
                      title="Xem chuyên khoa"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedRow === item.health_record_id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-300">
                    {getStatusBadge(item.record_status)}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-300">
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
                      className={`inline-flex items-center justify-center w-7 h-7 border transition-colors ${
                        !item.record_url ||
                        loading.download[item.health_record_id]
                          ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-green-400 bg-white text-green-600 hover:bg-green-50 hover:border-green-500"
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
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewPDF(item.record_url)}
                      disabled={!item.record_url || loading.fetch}
                      className={`inline-flex items-center justify-center w-7 h-7 border transition-colors ${
                        !item.record_url || loading.fetch
                          ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-blue-400 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-500"
                      }`}
                      title={
                        item.record_url
                          ? "Xem chi tiết PDF"
                          : "Không có file kết quả"
                      }
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                {expandedRow === item.health_record_id && (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 bg-gray-50 border-b border-gray-300">
                      <div className="text-sm">
                        {renderSpecialistExams(item.specialist_exam_records)}
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
        <p className="text-gray-500">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white border border-gray-300">
        {renderHealthTable()}
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
    </div>
  );
};

export default CheckupHistoryInfo;