import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Stethoscope,
  ArrowLeft,
  Users,
  Send,
  Loader2,
  Pencil,
} from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../../utils/campaignUtils";
import { getUserRole } from "../../../service/authService";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Modal from "react-modal";

// Set app element for react-modal (for accessibility)
Modal.setAppElement("#root");

const RegularCheckupDetails = () => {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [sendModalIsOpen, setSendModalIsOpen] = useState(false);
  const { campaign_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();

  // Modal styles (consistent with RegularCheckup)
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "500px",
      width: "90%",
      borderRadius: "0.5rem",
      border: "none",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      padding: "0",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  };

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/checkup-campaign-detail/${campaign_id}`);
      const campaign = res.data.data;
      console.log("Regular checkup details: ", campaign);
      if (campaign) {
        setDetails({
          id: campaign.campaign_id,
          name: campaign.campaign_name,
          description: campaign.campaign_des,
          location: campaign.campaign_location,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          specialist_exams: campaign.specialist_exams,
          status: campaign.status || "DRAFTED",
        });
      } else {
        setError("Không tìm thấy thông tin chiến dịch khám sức khỏe");
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
      enqueueSnackbar("Có lỗi xảy ra khi tải dữ liệu", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaign_id]);

  const openCancelModal = () => {
    console.log("Opening cancel modal for campaignId:", campaign_id);
    setCancelModalIsOpen(true);
  };

  const closeCancelModal = () => {
    console.log("Closing cancel modal");
    setCancelModalIsOpen(false);
  };

  const openSendModal = () => {
    console.log("Opening send modal for campaignId:", campaign_id);
    setSendModalIsOpen(true);
  };

  const closeSendModal = () => {
    console.log("Closing send modal");
    setSendModalIsOpen(false);
  };

  const handleCampaignAction = async (action) => {
    if (userRole !== "admin") {
      enqueueSnackbar("Chỉ admin mới có thể thực hiện hành động này", { variant: "error" });
      return;
    }
    if (!campaign_id) {
      enqueueSnackbar("Không tìm thấy ID chiến dịch", { variant: "error" });
      return;
    }

    if (action === "cancel" && !cancelModalIsOpen) {
      openCancelModal();
      return;
    }
    if (action === "send-register" && !sendModalIsOpen) {
      openSendModal();
      return;
    }

    setLoadingAction(true);
    try {
      if (action === "send-register") {
        // Call send-register endpoint
        const sendRegisterEndpoint = `/checkup/${campaign_id}/send-register`;
        console.log("Sending request to:", sendRegisterEndpoint);
        const sendRegisterResponse = await axiosClient.post(sendRegisterEndpoint);
        enqueueSnackbar(sendRegisterResponse?.data.message || "Gửi đơn thành công!", { variant: "success" });

        // Update status to PREPARING
        setDetails((prev) => ({ ...prev, status: "PREPARING" }));

        // Call send-mail-register endpoint in the background
        const sendMailEndpoint = `/checkup/${campaign_id}/send-mail-register`;
        console.log("Sending email request to:", sendMailEndpoint);
        axiosClient
          .post(sendMailEndpoint)
          .then((mailResponse) => {
            enqueueSnackbar(mailResponse?.data.message || "Gửi email thông báo thành công!", {
              variant: "success",
            });
          })
          .catch((mailError) => {
            console.error("Error sending emails:", mailError.response?.data);
            enqueueSnackbar(
              mailError.response?.data?.message || "Lỗi khi gửi email thông báo!",
              { variant: "error" }
            );
          });
      } else {
        // Handle other actions (e.g., cancel, close, start, finish)
        const endpoint = `/checkup-campaign/${campaign_id}/${action}`;
        console.log("Sending request to:", endpoint);
        const response = await axiosClient.patch(endpoint, {
          reason: `User requested ${action}`,
        });
        setDetails((prev) => ({
          ...prev,
          status:
            action === "cancel"
              ? "CANCELLED"
              : action === "finish"
              ? "DONE"
              : action === "close"
              ? "UPCOMING"
              : action === "start"
              ? "ONGOING"
              : prev.status,
        }));
        enqueueSnackbar(response?.data.message || "Thành công!", { variant: "success" });
      }
    } catch (error) {
      console.error(`Error performing ${action} on campaign ${campaign_id}:`, error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi thực hiện hành động!";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoadingAction(false);
      if (action === "cancel") {
        closeCancelModal();
      } else if (action === "send-register") {
        closeSendModal();
      }
    }
  };

  const handleBack = () => {
    navigate(-1)
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
            onClick={() => handleCampaignAction("send-register")}
            disabled={loadingAction}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
              loadingAction ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loadingAction ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                <span>Gửi đơn</span>
              </>
            )}
          </button>,
          <button
            key="edit"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/edit`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4 mr-2" />
            <span>Chỉnh sửa</span>
          </button>,
          <button
            key="cancel"
            onClick={() => handleCampaignAction("cancel")}
            disabled={loadingAction}
            className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer ${
              loadingAction ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4 mr-2" />
            <span>Hủy chiến dịch</span>
          </button>
        );
      } else if (status === "PREPARING") {
        buttons.push(
          <button
            key="close"
            onClick={() => handleCampaignAction("close")}
            disabled={loadingAction}
            className={`flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer ${
              loadingAction ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4 mr-2" />
            <span>Đóng đơn đăng ký</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Xem danh sách học sinh</span>
          </button>,
          <button
            key="cancel"
            onClick={() => handleCampaignAction("cancel")}
            disabled={loadingAction}
            className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer ${
              loadingAction ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4 mr-2" />
            <span>Hủy chiến dịch</span>
          </button>
        );
      } else if (status === "UPCOMING") {
        buttons.push(
          <button
            key="start"
            onClick={() => handleCampaignAction("start")}
            disabled={loadingAction}
            className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer ${
              loadingAction ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            <span>Khởi động chiến dịch</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Xem danh sách học sinh</span>
          </button>,
          <button
            key="cancel"
            onClick={() => handleCampaignAction("cancel")}
            disabled={loadingAction}
            className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer ${
              loadingAction ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <XCircle className="w-4 h-4 mr-2" />
            <span>Hủy chiến dịch</span>
          </button>
        );
      } else if (status === "ONGOING") {
        buttons.push(
          <button
            key="finish"
            onClick={() => handleCampaignAction("finish")}
            disabled={loadingAction}
            className={`flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer ${
              loadingAction ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Hoàn thành chiến dịch</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      } else if (["DONE", "COMPLETED"].includes(status)) {
        buttons.push(
          <button
            key="view-report"
            onClick={() => navigate(`/admin/completed-regular-checkup-report/${campaignId}`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            <span>Xem báo cáo</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/admin/checkup-campaign/${campaignId}/register-list`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
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
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      }
      if (status === "ONGOING") {
        buttons.push(
          <button
            key="edit-report"
            onClick={() => navigate(`/nurse/regular-checkup-report/${campaignId}`)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4 mr-2" />
            <span>Chỉnh sửa báo cáo</span>
          </button>
        );
      }
      if (["DONE", "COMPLETED"].includes(status)) {
        buttons.push(
          <button
            key="view-report"
            onClick={() => navigate(`/nurse/completed-regular-checkup-report/${campaignId}`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            <span>Xem báo cáo</span>
          </button>,
          <button
            key="view-register-list"
            onClick={() => navigate(`/nurse/checkup-campaign/${campaignId}/register-list`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      }
      if (status === "CANCELLED") {
        buttons.push(
          <button
            key="view-register-list"
            onClick={() => navigate(`/nurse/checkup-campaign/${campaignId}/register-list`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Xem danh sách học sinh</span>
          </button>
        );
      }
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalIsOpen}
        onRequestClose={closeCancelModal}
        style={customStyles}
        contentLabel="Xác nhận hủy chiến dịch"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-900">Xác nhận hủy chiến dịch</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn hủy chiến dịch này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => handleCampaignAction("cancel")}
                disabled={loadingAction}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 ${
                  loadingAction ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Xác nhận hủy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Send Register Confirmation Modal */}
      <Modal
        isOpen={sendModalIsOpen}
        onRequestClose={closeSendModal}
        style={customStyles}
        contentLabel="Xác nhận gửi đơn"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Send className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Xác nhận gửi đơn</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn gửi đơn đăng ký cho chiến dịch này không? Hành động này sẽ thông báo cho tất cả phụ huynh qua email.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeSendModal}
                className="px-4 py-2 border cursor-pointer border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => handleCampaignAction("send-register")}
                disabled={loadingAction}
                className={`px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
                  loadingAction ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Xác nhận gửi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Quay lại</span>
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{details.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  {getStatusIcon(details.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      details.status
                    )}`}
                  >
                    {getStatusText(details.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">{getActionButtons(details.status, details.id)}</div>
                {userRole === "admin" && details.status === "DRAFTED" && (
                  <p className="text-sm text-gray-500 mt-2">
                    Chiến dịch đang ở trạng thái nháp. Vui lòng gửi đơn để bắt đầu quá trình chuẩn bị.
                  </p>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg self-start sm:self-center">
                <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-center text-blue-600">Chiến dịch khám sức khỏe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Specialist Exams */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Stethoscope className="w-5 h-5 text-gray-700 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Các khám chuyên khoa</h2>
              </div>
              {details.specialist_exams && details.specialist_exams.length > 0 ? (
                <div className="space-y-4">
                  {details.specialist_exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">{exam.name}</h3>
                          <p className="text-sm text-gray-600">{exam.description || "Chưa có mô tả"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Chưa có thông tin về các khám chuyên khoa</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-gray-700 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Mô tả chi tiết</h2>
              </div>
              <p className="text-sm text-gray-700">{details.description || "Chưa có mô tả"}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-700" />
                Thông tin lịch trình
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Thời gian bắt đầu</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {details.start_date ? formatDate(details.start_date) : "Chưa xác định"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Thời gian kết thúc</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {details.end_date ? formatDate(details.end_date) : "Chưa xác định"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Địa điểm</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {details.location || "Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-700" />
                Thống kê nhanh
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số khám chuyên khoa</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {details.specialist_exams?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {getStatusText(details.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ID Chiến dịch</span>
                  <span className="text-sm font-semibold text-gray-900">#{details.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularCheckupDetails;