import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  ClipboardList,
  History,
  Shield,
} from "lucide-react";
import axiosClient from "../../config/axiosClient";
import VaccineRecordsInfo from "./VaccineRecordInfo";

const VaccineInfo = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState(null);
  const navigate = useNavigate();
  const [history, setHistory] = useState(false);

  useEffect(() => {
    const child = JSON.parse(localStorage.getItem("selectedChild"));
    if (child) setCurrChild(child);
    const fetchCam = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/vaccination-campaign");
        const campaigns = res.data.data || [];
        setCampaignList(campaigns);
        setError(null);
      } catch (error) {
        setError("Không thể tải danh sách chiến dịch tiêm chủng");
      } finally {
        setLoading(false);
      }
    };
    fetchCam();
  }, []);

  const handleSurvey = (campaignId) => {
    navigate(`/parent/edit/${currChild.id}/survey/${campaignId}`);
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
          <p className="text-lg font-medium text-gray-900">
            Đang tải dữ liệu...
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border border-red-300 rounded-xl p-8 max-w-lg w-full text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Lỗi tải dữ liệu
          </h3>
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
      {/* Header Section */}
      <div className="bg-white border-b border-gray-300 shadow-md">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Shield className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hệ thống quản lý tiêm chủng
              </h1>
              <p className="text-gray-700 mt-1">
                Theo dõi và đăng ký tham gia các chiến dịch tiêm chủng
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
            <button
              onClick={() => setHistory(false)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                !history
                  ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                  : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Kế hoạch tiêm chủng
            </button>
            <button
              onClick={() => setHistory(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                history
                  ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                  : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <History className="w-4 h-4" />
              Lịch sử tiêm chủng
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {history ? (
          <div className="bg-white rounded-xl border border-gray-300 p-10 text-center shadow-md">
            <VaccineRecordsInfo />
          </div>
        ) : (
          <>
            {campaignList.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-300 p-12 text-center shadow-md">
                <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có chiến dịch tiêm chủng
                </h3>
                <p className="text-gray-700">
                  Hiện tại chưa có chiến dịch nào được tổ chức. Vui lòng quay
                  lại sau để cập nhật thông tin mới nhất.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {campaignList.map((campaign) => {
                  const statusInfo = getCampaignStatus(campaign);

                  return (
                    <div
                      key={campaign.campaign_id}
                      className="bg-white border border-gray-300 rounded-xl p-8 hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Campaign Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <Shield className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {campaign.vaccine_name ||
                                  `Chiến dịch tiêm chủng #${campaign.campaign_id}`}
                              </h3>
                              <p className="text-sm text-gray-600 font-mono">
                                Mã chiến dịch: {campaign.campaign_id}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.className}`}
                        >
                          {statusInfo.status}
                        </span>
                      </div>

                      {/* Campaign Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Calendar className="w-5 h-5 text-gray-700" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Thời gian
                            </p>
                            <p className="text-sm text-gray-700">
                              {formatDate(campaign.start_date)} -{" "}
                              {formatDate(campaign.end_date)}
                            </p>
                          </div>
                        </div>

                        {campaign.location && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <MapPin className="w-5 h-5 text-gray-700" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Địa điểm
                              </p>
                              <p className="text-sm text-gray-700">
                                {campaign.location}
                              </p>
                            </div>
                          </div>
                        )}

                        {campaign.target_group && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <Users className="w-5 h-5 text-gray-700" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Đối tượng
                              </p>
                              <p className="text-sm text-gray-700">
                                {campaign.target_group}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {campaign.description && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Mô tả
                          </h4>
                          <p className="text-gray-800 leading-relaxed">
                            {campaign.description}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        {statusInfo.canSurvey ? (
                          <button
                            onClick={() => handleSurvey(campaign.campaign_id)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Tham gia khảo sát
                          </button>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Không khả dụng
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

export default VaccineInfo;
