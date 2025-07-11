import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  ClipboardList,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { getStudentInfo } from "../../../service/childenService";
import { getSession } from "../../../config/Supabase";
import { useSnackbar } from "notistack";

const StudentRegularCheckup = () => {
  const { student_id } = useParams();
  const [campaignList, setCampaignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
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

  // Fetch student info and campaigns
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !student_id) return;

      setLoading(true);
      try {
        // Fetch student info
        const child = await getStudentInfo(student_id);
        if (!child?.id) {
          throw new Error("Không tìm thấy thông tin học sinh");
        }
        setCurrChild(child);

        // Fetch campaigns
        const campaignRes = await axiosClient.get("/checkup-campaign");
        let campaigns = campaignRes.data.data || [];

        // Fetch survey status for each campaign
        campaigns = await Promise.all(
          campaigns.map(async (c) => {
            try {
              const surveyRes = await axiosClient.get(
                `/checkup-register/campaign/${c.campaign_id || c.id}/student/${student_id}/status`
              );
              const registerStatus = surveyRes.data.data?.status || "NONE";
              return {
                ...c,
                campaign_id: c.campaign_id || c.id,
                status: c.status || "DRAFTED",
                canSurvey: getCampaignStatus(c).canSurvey,
                isSurveyed: registerStatus === "SUBMITTED",
              };
            } catch (error) {
              console.error(
                `Error fetching survey status for campaign ${c.campaign_id}:`,
                error
              );
              return {
                ...c,
                campaign_id: c.campaign_id || c.id,
                status: c.status || "DRAFTED",
                canSurvey: getCampaignStatus(c).canSurvey,
                isSurveyed: false,
              };
            }
          })
        );

        // Sort campaigns: Prioritize surveyable and not surveyed campaigns, then by most recent date
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
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        enqueueSnackbar("Không thể tải dữ liệu!", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, student_id]);

  const handleSurvey = (campaignId) => {
    navigate(`/parent/edit/${currChild.id}/surveyCheckup/${campaignId}`, {
      state: { from: location.pathname, childId: currChild.id },
    });
  };

  const handleViewDetails = (campaignId) => {
    navigate(`/parent/checkup-campaign/${campaignId}`, {
      state: { from: location.pathname, childId: currChild.id },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Chưa xác định";
    }
  };

  const getCampaignStatus = (campaign) => {
    const status = campaign.status?.toUpperCase();

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
      case "DONE":
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

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
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Lỗi tải dữ liệu
          </h3>
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Kiểm tra sức khỏe định kỳ
          </h1>
          <p className="text-gray-600 mt-1">
            {currChild?.name || "Học sinh"} - Danh sách chiến dịch kiểm tra
          </p>
        </div>

        {campaignList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có chiến dịch kiểm tra
            </h3>
            <p className="text-gray-600">
              Hiện tại chưa có chiến dịch nào được tổ chức. Vui lòng quay lại sau
              để cập nhật thông tin mới nhất.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaignList.filter((campaign) => campaign?.status !== "DRAFTED").map((campaign) => {
              const statusInfo = getCampaignStatus(campaign);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={campaign.campaign_id}
                  className={`bg-white border rounded-lg p-6 hover:shadow-md transition-all duration-200 ${
                    statusInfo.canSurvey
                      ? "border-blue-200 ring-1 ring-blue-100"
                      : "border-gray-200"
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
                            {campaign.name ||
                              `Kiểm tra sức khỏe #${campaign.campaign_id}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Mã chiến dịch: {campaign.campaign_id}
                          </p>
                        </div>
                      </div>

                      {/* Campaign Details */}
                      <div className="flex items-center gap-6 ml-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(campaign.start_date)} -{" "}
                            {formatDate(campaign.end_date)}
                          </span>
                        </div>

                        {campaign.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {campaign.location}
                            </span>
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
                      <div
                        className={`flex items-center gap-2 px-3 py-1 border rounded-full text-sm ${statusInfo.className}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusInfo.status}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(campaign.campaign_id)}
                          className="cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          Chi tiết
                        </button>

                        {statusInfo.canSurvey && (
                          <button
                            onClick={() => handleSurvey(campaign.campaign_id)}
                            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ${
                              campaign.isSurveyed
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-blue-600 hover:bg-blue-700"
                            } transition-colors`}
                          >
                            <ClipboardList className="w-4 h-4" />
                            {campaign.isSurveyed ? "Chỉnh sửa khảo sát" : "Tham gia khảo sát"}
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
      </div>
    </div>
  );
};

export default StudentRegularCheckup;