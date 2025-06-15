import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Calendar, MapPin, Users, Loader2, AlertCircle, ClipboardList } from "lucide-react";
import axiosClient from "../../config/axiosClient";

const VaccineInfo = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const child = JSON.parse(localStorage.getItem('selectedChild'))
    if (child) setCurrChild(child)
    const fetchCam = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/vaccination-campaign");
        const campaigns = res.data.data || [];
        setCampaignList(campaigns);
        console.log("Campaign list:", campaigns);
        
        // Check for duplicate campaign_ids
        const ids = campaigns.map((c) => c.campaign_id);
        if (new Set(ids).size !== ids.length) {
          console.error("Duplicate campaign IDs detected:", ids);
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError("Không thể tải danh sách chiến dịch tiêm chủng");
      } finally {
        setLoading(false);
      }
    };
    fetchCam();
  }, []);

  const handleSurvey = (campaignId) => {
    // Navigate to survey page for specific campaign
    navigate(`/parent/edit/${currChild.id}/survey/${campaignId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return "Chưa xác định";
    }
  };

  const getCampaignStatus = (campaign) => {
    const status = campaign.status?.toUpperCase();
    
    switch (status) {
      case 'PREPARING':
        return {
          status: "Đang chuẩn bị",
          className: "bg-blue-100 text-blue-800",
          icon: <Calendar className="w-4 h-4" />,
          canSurvey: true
        };
      case 'ACTIVE':
        return {
          status: "Đang diễn ra",
          className: "bg-green-100 text-green-800",
          icon: <Calendar className="w-4 h-4" />,
          canSurvey: false
        };
      case 'COMPLETED':
        return {
          status: "Đã hoàn thành",
          className: "bg-gray-100 text-gray-800",
          icon: <Calendar className="w-4 h-4" />,
          canSurvey: false
        };
      case 'CANCELLED':
        return {
          status: "Đã hủy",
          className: "bg-red-100 text-red-800",
          icon: <AlertCircle className="w-4 h-4" />,
          canSurvey: false
        };
      default:
        return {
          status: "Chưa xác định",
          className: "bg-gray-100 text-gray-800",
          icon: <Calendar className="w-4 h-4" />,
          canSurvey: false
        };
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Đang tải thông tin chiến dịch tiêm chủng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Thông tin tiêm chủng
        </h1>
        <p className="text-gray-600">
          Tham gia khảo sát để đăng ký tiêm chủng cho con em
        </p>
      </div>

      {/* Campaign List */}
      {campaignList.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có chiến dịch tiêm chủng nào
          </h3>
          <p className="text-gray-500">
            Vui lòng quay lại sau để kiểm tra thông tin mới nhất
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaignList.map((campaign) => {
            const statusInfo = getCampaignStatus(campaign);
            
            return (
              <div
                key={campaign.campaign_id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Campaign Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                        {campaign.vaccine_name || `Chiến dịch #${campaign.campaign_id}`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: {campaign.campaign_id}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                      {statusInfo.icon}
                      {statusInfo.status}
                    </span>
                  </div>

                  {/* Campaign Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                      </span>
                    </div>
                    
                    {campaign.location && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="line-clamp-1">{campaign.location}</span>
                      </div>
                    )}
                    
                    {campaign.target_group && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="line-clamp-1">{campaign.target_group}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {campaign.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {campaign.description}
                      </p>
                    </div>
                  )}

                  {/* Survey Button */}
                  {statusInfo.canSurvey ? (
                    <button
                      onClick={() => handleSurvey(campaign.campaign_id)}
                      className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Tham gia khảo sát
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Không thể khảo sát
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VaccineInfo;