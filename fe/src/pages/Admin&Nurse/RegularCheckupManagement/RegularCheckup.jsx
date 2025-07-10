import React, { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  XCircle,
  FileText,
  Activity,
  Users,
  Loader2,
  Send,
  Pencil,
} from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { getUserRole } from "../../../service/authService";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  getStatusColor,
  getCardBorderColor,
  getStatusText,
  formatDate,
} from "../../../utils/campaignUtils";

const RegularCheckup = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
  const [userRole, setUserRole] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const res = await axiosClient.get("/checkup-campaign");
      const campaigns = res.data.data || [];
      console.log("Checkup campaigns:", campaigns);
      setCampaignList(campaigns);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách chiến dịch khám sức khỏe");
      console.error("Error fetching campaigns:", err);
      enqueueSnackbar("Không thể tải danh sách chiến dịch", { variant: "error" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    const role = getUserRole();
    setUserRole(role);
  }, [fetchCampaigns]);

  const toggleExpanded = useCallback((id, e) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleAddNewCampaign = () => {
    navigate("/admin/checkup-campaign-creation");
  };

  const handleCampaignAction = async (campaignId, action) => {
    if (userRole !== "admin") return;
    setLoadingActions((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const endpoint =
        action === "send-register"
          ? `/checkup/${campaignId}/send-register`
          : `/checkup-campaign/${campaignId}/${action}`;
      const response = await (action === "send-register"
        ? axiosClient.post(endpoint)
        : axiosClient.patch(endpoint));
      await fetchCampaigns();
      enqueueSnackbar(response?.data.message || "Thành công!", { variant: "info" });
    } catch (error) {
      console.error(`Error performing ${action} on campaign ${campaignId}:`, error);
      enqueueSnackbar(error.response?.data?.message || "Có lỗi xảy ra!", { variant: "error" });
    } finally {
      setLoadingActions((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleRefresh = () => {
    fetchCampaigns();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DRAFTED":
        return <FileText className="w-4 h-4" />;
      case "COMPLETED":
      case "DONE":
        return <CheckCircle className="w-4 h-4" />;
      case "ONGOING":
        return <Activity className="w-4 h-4" />;
      case "PREPARING":
        return <Clock className="w-4 h-4" />;
      case "UPCOMING":
        return <AlertCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionButtons = (status, campaignId) => {
    const buttons = [];

    if (userRole === "admin") {
      if (status === "DRAFTED") {
        buttons.push(
          <button
            key="send-register"
            onClick={() => handleCampaignAction(campaignId, "send-register")}
            disabled={loadingActions[campaignId]}
            className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              loadingActions[campaignId] ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loadingActions[campaignId] ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi đơn</span>
              </>
            )}
          </button>,
          <button
            key="edit"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/edit`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Pencil className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </button>,
          <button
            key="cancel"
            onClick={() => handleCampaignAction(campaignId, "cancel")}
            disabled={loadingActions[campaignId]}
            className={`px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              loadingActions[campaignId] ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Hủy chiến dịch</span>
          </button>
        );
      } else if (status === "PREPARING") {
        buttons.push(
          <button
            key="close"
            onClick={() => handleCampaignAction(campaignId, "close")}
            disabled={loadingActions[campaignId]}
            className={`px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              loadingActions[campaignId] ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Đóng đơn đăng ký</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>,
          <button
            key="cancel"
            onClick={() => handleCampaignAction(campaignId, "cancel")}
            disabled={loadingActions[campaignId]}
            className={`px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              loadingActions[campaignId] ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Hủy chiến dịch</span>
          </button>
        );
      } else if (status === "UPCOMING") {
        buttons.push(
          <button
            key="start"
            onClick={() => handleCampaignAction(campaignId, "start")}
            disabled={loadingActions[campaignId]}
            className={`px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              loadingActions[campaignId] ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Khởi động chiến dịch</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>,
          <button
            key="cancel"
            onClick={() => handleCampaignAction(campaignId, "cancel")}
            disabled={loadingActions[campaignId]}
            className={`px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              loadingActions[campaignId] ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Hủy chiến dịch</span>
          </button>
        );
      } else if (status === "ONGOING") {
        buttons.push(
          <button
            key="finish"
            onClick={() => handleCampaignAction(campaignId, "finish")}
            disabled={loadingActions[campaignId]}
            className={`px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              loadingActions[campaignId] ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Hoàn thành chiến dịch</span>
          </button>,
          // <button
          //   key="edit-report"
          //   onClick={() => navigate(`/admin/regular-checkup-report/${campaignId}`)}
          //   className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          // >
          //   <Pencil className="w-4 h-4" />
          //   <span>Chỉnh sửa báo cáo</span>
          // </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      } else if (["DONE", "COMPLETED"].includes(status)) {
        buttons.push(
          <button
            key="view-report"
            onClick={() => navigate(`/admin/regular-checkup-report/${campaignId}`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Xem báo cáo</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      } else if (status === "CANCELLED") {
        buttons.push(
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      }
    } else if (userRole === "nurse") {
      if (["PREPARING", "UPCOMING", "ONGOING"].includes(status)) {
        buttons.push(
          <button
            key="view-register-list"
            onClick={() => navigate(`/nurse/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      }
      if (status === "ONGOING") {
        buttons.push(
          <button
            key="edit-report"
            onClick={() => navigate(`/nurse/regular-checkup-report/${campaignId}`)}
            className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Pencil className="w-4 h-4" />
            <span>Chỉnh sửa báo cáo</span>
          </button>
        );
      }
      if (["DONE", "COMPLETED"].includes(status)) {
        buttons.push(
          <button
            key="view-report"
            onClick={() => navigate(`/nurse/regular-checkup-report/${campaignId}`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Xem báo cáo</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/nurse/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      }
      if (status === "CANCELLED") {
        buttons.push(
          <button
            key="view-register-list"
            onClick={() => navigate(`/nurse/checkup-campaign/${campaignId}/register-list`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium numbered-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      }
    }

    // Always include "View Details" button
    buttons.unshift(
      <button
        key="view-details"
        onClick={() => navigate(`/${userRole}/checkup-campaign/${campaignId}`)}
        className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200 flex itemsfirefox-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>Xem chi tiết</span>
      </button>
    );

    return buttons;
  };

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-slate-900" />
          <p className="text-slate-600">Đang tải danh sách chiến dịch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4 border border-slate-200">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <XCircle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          </div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">
                Quản lý Chiến dịch Khám sức khỏe
              </h1>
              <p className="text-slate-600 text-base">
                {userRole === "admin"
                  ? "Quản lý và giám sát các chiến dịch khám sức khỏe"
                  : "Theo dõi và cập nhật báo cáo chiến dịch khám sức khỏe"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === "admin" && (
                <button
                  onClick={handleAddNewCampaign}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tạo chiến dịch mới</span>
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 ${
                  isRefreshing ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isRefreshing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          {[
            {
              status: "DRAFTED",
              label: "Đang chỉnh sửa",
              count: campaignList.filter((c) => c.status === "DRAFTED").length,
            },
            {
              status: "PREPARING",
              label: "Chuẩn bị",
              count: campaignList.filter((c) => c.status === "PREPARING").length,
            },
            {
              status: "UPCOMING",
              label: "Sắp triển khai",
              count: campaignList.filter((c) => c.status === "UPCOMING").length,
            },
            {
              status: "ONGOING",
              label: "Đang thực hiện",
              count: campaignList.filter((c) => c.status === "ONGOING").length,
            },
            {
              status: "DONE",
              label: "Hoàn thành",
              count: campaignList.filter((c) => c.status === "DONE").length,
            },
            {
              status: "CANCELLED",
              label: "Đã hủy",
              count: campaignList.filter((c) => c.status === "CANCELLED").length,
            },
          ].map(({ status, label, count }) => (
            <div
              key={status}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
                  <p className="text-2xl font-semibold text-slate-900">{count}</p>
                </div>
                <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {campaignList.map((campaign) => (
            <div
              key={campaign.id}
              className={`bg-white rounded-lg border border-slate-200 border-l-4 ${getCardBorderColor(
                campaign.status
              )} shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                onClick={(e) => toggleExpanded(campaign.id, e)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {getStatusIcon(campaign.status)}
                      <span>{getStatusText(campaign.status)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 max-w-2xl">
                      {campaign.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-500 font-medium">Chi tiết</span>
                    {expandedItems[campaign.id] ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedItems[campaign.id] && (
                <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
                  <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            Thời gian bắt đầu
                          </p>
                          <p className="text-base text-slate-900">
                            {formatDate(campaign.start_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            Thời gian kết thúc
                          </p>
                          <p className="text-base text-slate-900">
                            {formatDate(campaign.end_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            Địa điểm thực hiện
                          </p>
                          <p className="text-base text-slate-900">
                            {campaign.location || "Chưa xác định"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-violet-100 rounded-lg">
                          <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            Số khám chuyên khoa
                          </p>
                          <p className="text-base text-slate-900">
                            {campaign.specialist_exams?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-3">
                    {getActionButtons(campaign.status, campaign.id)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {campaignList.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Chưa có chiến dịch nào
            </h3>
            <p className="text-slate-500 mb-8">
              {userRole === "admin"
                ? "Hệ thống sẽ hiển thị danh sách khi có chiến dịch mới được tạo"
                : "Hiện tại chưa có chiến dịch nào để theo dõi"}
            </p>
            {userRole === "admin" && (
              <button
                onClick={handleAddNewCampaign}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo chiến dịch đầu tiên</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegularCheckup;