import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { supabase, getSession } from "../../../config/Supabase";
import PDFViewer from "../../../components/PDFViewer";
import { getUserRole } from "../../../service/authService";

const CompletedRegularCheckupReport = () => {
  const [generalHealthList, setGeneralHealthList] = useState([]);
  const [specialistList, setSpecialistList] = useState([]);
  const [activeTab, setActiveTab] = useState("Khám tổng quát");
  const [loading, setLoading] = useState({
    general: false,
    specialist: false,
    download: {}, // Object to track download loading state for each record
    bulkDownload: false, // Loading state for bulk report download
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);
  const { campaign_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const tabs = [
    "Khám tổng quát",
    "Khám sinh dục",
    "Khám tâm lý",
    "Khám tâm thần",
    "Khám xâm lấn",
  ];

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

  const fetchGeneralList = async () => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      const res = await axiosClient.get(
        `/health-record/campaign/${campaign_id}`
      );
      console.log("GENERAL LIST: ", res.data.data);
      setGeneralHealthList(res.data.data);
    } catch (error) {
      console.error("Error fetching general list:", error);
      enqueueSnackbar("Không thể tải danh sách khám tổng quát!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  const fetchSpecialist = async () => {
    setLoading((prev) => ({ ...prev, specialist: true }));
    try {
      const res = await axiosClient.get(
        `/campaign/${campaign_id}/specialist-exam/record`
      );
      console.log("SPECIALIST: ", res.data.data);
      setSpecialistList(res.data.data);
    } catch (error) {
      console.error("Error fetching specialist:", error);
      enqueueSnackbar("Không thể tải danh sách khám chuyên khoa!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, specialist: false }));
    }
  };

  // Handle individual record download
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

  // Handle bulk report download
  const handleBulkReportDownload = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để tải báo cáo!", {
        variant: "error",
      });
      navigate("/login");
      return;
    }

    setLoading((prev) => ({ ...prev, bulkDownload: true }));
    try {
      const response = await axiosClient.get(
        `/campaign/${campaign_id}/download-health-record-result`,
        {
          responseType: "blob",
        }
      );

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
        error.response?.data?.message || "Không thể tải báo cáo Excel!",
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({ ...prev, bulkDownload: false }));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchGeneralList(), fetchSpecialist()]);
      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    };
    fetchAllData();
  }, [isAuthenticated, campaign_id]);

  const getStatusBadge = (status) => {
    return status === "DONE" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Hoàn thành
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Không khám
      </span>
    );
  };

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
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/${getUserRole()}/student-overview/${item.student_id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    aria-label={`Xem thông tin chi tiết của học sinh ${item.student_name}`}
                  >
                    {item.student_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.class_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                {type === "general" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() =>
                          handleRecordDownload(item.record_url, item.register_id)
                        }
                        disabled={
                          !item.record_url ||
                          loading.download[item.register_id] ||
                          loading.general
                        }
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          !item.record_url || loading.download[item.register_id]
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700"
                        } ${loading.general ? "opacity-50 cursor-not-allowed" : ""}`}
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
                        disabled={!item.record_url || loading.general}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          !item.record_url || loading.general
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

  const getTabData = (tabName) => {
    if (tabName === "Khám tổng quát") {
      return { records: generalHealthList, type: "general" };
    }
    const specialistData = specialistList.find(
      (item) => item.name === tabName
    ) || {
      records: [],
    };
    return { records: specialistData.records, type: "specialist" };
  };

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
            {loading.bulkDownload ? "Đang tải..." : "Tải xuống báo cáo"}
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
            Tổng số: {getTabData(activeTab).records.length} học sinh
          </p>
        </div>
        {renderHealthTable(
          getTabData(activeTab).records,
          getTabData(activeTab).type
        )}
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

export default CompletedRegularCheckupReport;