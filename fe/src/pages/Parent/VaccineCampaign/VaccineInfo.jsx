import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Calendar, MapPin, Loader2, AlertCircle, ClipboardList, History, Shield, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import VaccineRecordsInfo from "./VaccineRecordInfo";
import { ChildContext } from "../../../layouts/ParentLayout";

const VaccineInfo = () => {
  const { student_id } = useParams();
  const { handleSelectChild, children } = useContext(ChildContext);
  const [campaignList, setCampaignList] = useState([]);
  const [completedDoses, setCompletedDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState(null);
  const [historyView, setHistoryView] = useState(false);
  const [registerMap, setRegisterMap] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const child = children.find((c) => c.id === student_id) || JSON.parse(localStorage.getItem("selectedChild"));
        if (!child || child.id !== student_id) {
          setError("Không tìm thấy thông tin học sinh");
          setLoading(false);
          return;
        }
        setCurrChild(child);
        handleSelectChild(child);

        const campaignRes = await axiosClient.get("/vaccination-campaign");
        let campaigns = campaignRes.data.data || [];

        const dosesRes = await axiosClient.get(`/student/${child.id}/completed-doses`);
        const dosesData = dosesRes.data.diseases || [];
        setCompletedDoses(dosesData);

        const registerPromises = campaigns.map(async (campaign) => {
          try {
            const res = await axiosClient.get(
              `/student/${child.id}/vaccination-campaign/${campaign.campaign_id}/register`
            );
            return { campaign_id: campaign.campaign_id, isSurveyed: res.data.data[0]?.is_registered || false };
          } catch (error) {
            console.error(`Error fetching survey status for campaign ${campaign.campaign_id}:`, error);
            return { campaign_id: campaign.campaign_id, isSurveyed: false };
          }
        });
        const registerResults = await Promise.all(registerPromises);
        const newRegisterMap = registerResults.reduce((acc, { campaign_id, isSurveyed }) => {
          acc[campaign_id] = { isSurveyed };
          return acc;
        }, {});
        setRegisterMap(newRegisterMap);

        campaigns = campaigns.map((c) => ({
          ...c,
          campaign_id: c.campaign_id || c.id,
          status: c.status || "DRAFTED",
          canSurvey: getCampaignStatus(c, dosesData, newRegisterMap[c.campaign_id]).canSurvey,
          isSurveyed: newRegisterMap[c.campaign_id]?.isSurveyed || false,
        }));

        campaigns.sort((a, b) => {
          const aCanSurveyNotSurveyed = a.canSurvey && !a.isSurveyed;
          const bCanSurveyNotSurveyed = b.canSurvey && !b.isSurveyed;
          if (aCanSurveyNotSurveyed !== bCanSurveyNotSurveyed) {
            return aCanSurveyNotSurveyed ? -1 : 1;
          }
          return new Date(b.start_date || 0) - new Date(a.start_date || 0);
        });

        setCampaignList(campaigns);
        setError(null);
      } catch (error) {
        setError("Failed to fetch data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handlePopState = () => {
      fetchData();
    };
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [student_id, children, handleSelectChild]);

  const handleSurvey = (campaignId) => {
    navigate(`/parent/edit/${currChild.id}/vaccine-campaign-survey/${campaignId}`, {
      state: { from: location.pathname, childId: currChild.id },
    });
  };

  const handleViewDetails = (campaignId) => {
    navigate(`/parent/vaccination-campaign/${campaignId}`, {
      state: { from: location.pathname, childId: currChild.id },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa xác định";
    }
  };

  const getCampaignStatus = (campaign, dosesData = completedDoses, register = registerMap[campaign.campaign_id]) => {
    const doseInfo = dosesData.find((dose) => dose.disease_id === campaign.disease_id);
    const currentDate = new Date();
    const status = campaign.status?.toUpperCase();

    if (doseInfo && doseInfo.completed_doses === doseInfo.dose_quantity) {
      return {
        status: "Đã đủ mũi tiêm",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        canSurvey: false,
      };
    }
    if (new Date(campaign.end_date) < currentDate && status !== "COMPLETED") {
      return {
        status: "Đã hết hạn đăng ký",
        className: "bg-gray-50 text-gray-700 border-gray-200",
        icon: XCircle,
        canSurvey: false,
      };
    }
    switch (status) {
      case "PREPARING":
        return {
          status: "Đang chuẩn bị",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          canSurvey: true,
        };
      case "ONGOING":
        return {
          status: "Đang diễn ra",
          className: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle,
          canSurvey: false,
        };
      case "UPCOMING":
        return {
          status: "Đã đóng đơn",
          className: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Clock,
          canSurvey: false,
        };
      case "COMPLETED":
        return {
          status: "Hoàn thành",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: CheckCircle,
          canSurvey: false,
        };
      case "CANCELLED":
        return {
          status: "Đã hủy",
          className: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          canSurvey: false,
        };
      default:
        return {
          status: "Nháp",
          className: "bg-gray-50 text-gray-700 border-gray-200",
          icon: Clock,
          canSurvey: false,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hệ thống quản lý tiêm chủng</h1>
              <p className="text-gray-600">Theo dõi và đăng ký tham gia các chiến dịch tiêm chủng</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setHistoryView(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !historyView
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Kế hoạch tiêm chủng
            </button>
            <button
              onClick={() => setHistoryView(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                historyView
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <History className="w-4 h-4" />
              Lịch sử tiêm chủng
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {historyView ? (
          <div className="bg-white rounded-lg shadow-sm">
            <VaccineRecordsInfo records={completedDoses} currChild={currChild} />
          </div>
        ) : (
          <>
            {campaignList.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có chiến dịch tiêm chủng</h3>
                <p className="text-gray-600">Hiện tại chưa có chiến dịch nào được tổ chức. Vui lòng quay lại sau để cập nhật thông tin mới nhất.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaignList.map((campaign) => {
                  const statusInfo = getCampaignStatus(campaign);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={campaign.campaign_id}
                      className={`bg-white border rounded-lg p-6 hover:shadow-md transition-all duration-200 ${
                        !campaign.isSurveyed && statusInfo.canSurvey 
                          ? 'border-blue-200 ring-1 ring-blue-100' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Left Section - Campaign Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {campaign.vaccine_name || `Chiến dịch tiêm chủng #${campaign.campaign_id}`}
                              </h3>
                              <p className="text-sm text-gray-500">Mã chiến dịch: {campaign.campaign_id}</p>
                            </div>
                          </div>

                          {/* Campaign Details */}
                          <div className="flex items-center gap-6 ml-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                              </span>
                            </div>
                            
                            {campaign.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{campaign.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Status and Actions */}
                        <div className="flex items-center gap-4">
                          {/* Survey Status */}
                          {campaign.isSurveyed && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span>Đã khảo sát</span>
                            </div>
                          )}

                          {/* Campaign Status */}
                          <div className={`flex items-center gap-2 px-3 py-1 border rounded-full text-sm ${statusInfo.className}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusInfo.status}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(campaign.campaign_id)}
                              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              <FileText className="w-4 h-4" />
                              Chi tiết
                            </button>
                            
                            {statusInfo.canSurvey && !campaign.isSurveyed && (
                              <button
                                onClick={() => handleSurvey(campaign.campaign_id)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <ClipboardList className="w-4 h-4" />
                                Tham gia khảo sát
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VaccineInfo;