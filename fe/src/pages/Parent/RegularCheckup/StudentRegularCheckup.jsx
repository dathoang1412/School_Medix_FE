import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, MapPin, Loader2, AlertCircle, ClipboardList, History, Shield } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import CheckupHistoryInfo from "./CheckupHistoryInfo";
import { useContext } from "react";
import { ChildContext } from "../../../layouts/ParentLayout";

const StudentRegularCheckup = () => {
  const { childId } = useParams();
  const { handleSelectChild, children } = useContext(ChildContext);
  const [campaignList, setCampaignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState(null);
  const [historyView, setHistoryView] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const child = children.find((c) => c.id === childId) || JSON.parse(localStorage.getItem("selectedChild"));
        if (!child) {
          setError("Không tìm thấy thông tin học sinh");
          setLoading(false);
          return;
        }
        setCurrChild(child);
        handleSelectChild(child);

        const campaignRes = await axiosClient.get("/checkup-campaign");
        let campaigns = campaignRes.data.data || [];

        // Sort campaigns: canSurvey first, then by start_date (most recent first)
        campaigns = campaigns.map((c) => ({
          ...c,
          status: c.status || "Chưa xác định",
          canSurvey: getCampaignStatus(c).canSurvey,
        }));
        campaigns.sort((a, b) => {
          if (a.canSurvey !== b.canSurvey) {
            return a.canSurvey ? -1 : 1;
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
  }, [childId, children, handleSelectChild]);

  const handleSurvey = (campaignId) => {
    navigate(`/parent/edit/${currChild.id}/surveyCheckup/${campaignId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa xác định";
    }
  };

  const getCampaignStatus = (campaign) => {
    const status = campaign.status?.toUpperCase();

    switch (status) {
      case "PREPARING":
        return {
          status: "Chuẩn bị",
          className: "bg-orange-100 text-orange-900 border-orange-400",
          canSurvey: true,
        };
      case "ACTIVE":
        return {
          status: "Đang diễn ra",
          className: "bg-green-100 text-green-900 border-green-400",
          canSurvey: false,
        };
      case "COMPLETED":
        return {
          status: "Hoàn thành",
          className: "bg-gray-100 text-gray-900 border-gray-400",
          canSurvey: false,
        };
      case "CANCELLED":
        return {
          status: "Đã hủy",
          className: "bg-red-100 text-red-900 border-red-400",
          canSurvey: false,
        };
      default:
        return {
          status: "Chưa xác định",
          className: "bg-gray-100 text-gray-900 border-gray-400",
          canSurvey: false,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Đang tải dữ liệu...</p>
          <p className="text-sm text-gray-700 mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border border-red-300 rounded-xl p-8 max-w-lg w-full text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-300 shadow-md">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Shield className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hệ thống quản lý kiểm tra sức khỏe</h1>
              <p className="text-gray-700 mt-1">Theo dõi và đăng ký tham gia các chiến dịch kiểm tra sức khỏe</p>
            </div>
          </div>

          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
            <button
              onClick={() => setHistoryView(false)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                !historyView
                  ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                  : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Kế hoạch kiểm tra
            </button>
            <button
              onClick={() => setHistoryView(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                historyView
                  ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                  : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <History className="w-4 h-4" />
              Lịch sử kiểm tra
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pt-10">
        {historyView ? (
          <div className="bg-white rounded-xl border border-gray-300 py-0 text-center shadow-md">
            <CheckupHistoryInfo currChild={currChild} />
          </div>
        ) : (
          <>
            {campaignList.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-300 p-6 text-center shadow-md">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có chiến dịch kiểm tra sức khỏe</h3>
                <p className="text-gray-700 text-sm">Hiện tại chưa có chiến dịch nào được tổ chức. Vui lòng quay lại sau để cập nhật thông tin mới nhất.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaignList.map((campaign) => {
                  const statusInfo = getCampaignStatus(campaign);

                  return (
                    <div
                      key={campaign.id}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all duration-200 h-full"
                    >
                      {/* Campaign Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-blue-50 rounded-md border border-blue-200">
                              <Shield className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">
                                {campaign.name || `Kiểm tra sức khỏe #${campaign.id}`}
                              </h3>
                              <p className="text-xs text-gray-600 font-mono">Mã: {campaign.id}</p>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                          {statusInfo.status}
                        </span>
                      </div>

                      {/* Campaign Details Grid */}
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                          <Calendar className="w-4 h-4 text-gray-700" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">Thời gian</p>
                            <p className="text-xs text-gray-700">
                              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                            </p>
                          </div>
                        </div>

                        {campaign.location && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                            <MapPin className="w-4 h-4 text-gray-700" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">Địa điểm</p>
                              <p className="text-xs text-gray-700">{campaign.location}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {campaign.description && (
                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-900 mb-1">Mô tả</h4>
                          <p className="text-gray-800 text-xs leading-tight">{campaign.description}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end pt-2 border-t border-gray-200">
                        {statusInfo.canSurvey ? (
                          <button
                            onClick={() => handleSurvey(campaign.id)}
                            className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <ClipboardList className="w-3 h-3" />
                            Tham gia khảo sát
                          </button>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium cursor-not-allowed"
                          >
                            <ClipboardList className="w-3 h-3" />
                            {statusInfo.status}
                          </button>
                        )}
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

export default StudentRegularCheckup;