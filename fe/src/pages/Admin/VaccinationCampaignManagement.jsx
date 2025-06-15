import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Calendar, MapPin, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import axiosClient from '../../config/axiosClient';

const VaccinationCampaignManagement = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCam = async () => {
      try {
        const res = await axiosClient.get('/vaccination-campaign');
        const campaigns = res.data.data || [];
        setCampaignList(campaigns);
        console.log("Campaign list:", campaigns);
        // Check for duplicate campaign_ids
        const ids = campaigns.map(c => c.campaign_id);
        if (new Set(ids).size !== ids.length) {
          console.error("Duplicate campaign IDs detected:", ids);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCam();
  }, []);

  const toggleExpanded = useCallback((id, e) => {
    e.stopPropagation();
    console.log(`Toggling campaign ID: ${id}`);
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleAddNewCampaign = () => {
    navigate('vaccine-campaign-creation'); // Relative path
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'ongoing': return 'text-blue-600 bg-blue-50';
      case 'planned': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành';
      case 'ongoing': return 'Đang diễn ra';
      case 'planned': return 'Đã lên kế hoạch';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'ongoing': return <Clock className="w-4 h-4" />;
      case 'planned': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full mx-auto p-10 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Chiến dịch Tiêm chủng</h1>
            <p className="text-gray-600">Danh sách các chiến dịch tiêm chủng và thông tin chi tiết</p>
          </div>
          <button
            onClick={handleAddNewCampaign}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm mới kế hoạch y tế</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {campaignList.map((campaign) => (
          <div
            key={campaign.campaign_id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={(e) => toggleExpanded(campaign.campaign_id, e)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span>{getStatusText(campaign.status)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{campaign.description}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Chi tiết</span>
                  {expandedItems[campaign.campaign_id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {expandedItems[campaign.campaign_id] && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Thời gian bắt đầu</p>
                        <p className="text-sm text-gray-600">{formatDate(campaign.start_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Thời gian kết thúc</p>
                        <p className="text-sm text-gray-600">{formatDate(campaign.end_date)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Địa điểm</p>
                        <p className="text-sm text-gray-600">{campaign.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">V</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Vaccine</p>
                        <p className="text-sm text-gray-600">{campaign.vaccine_name} (#{campaign.vaccine_id})</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Xem chi tiết
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200">
                    Chỉnh sửa
                  </button>
                  {campaign.status === 'planned' && (
                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200">
                      Bắt đầu chiến dịch
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {campaignList.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Chưa có chiến dịch tiêm chủng nào</p>
          <p className="text-gray-400 text-sm mt-1">Dữ liệu sẽ được hiển thị khi có chiến dịch mới</p>
          <button
            onClick={handleAddNewCampaign}
            className="mt-4 flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm mới kế hoạch y tế</span>
          </button>
        </div>
      )}

      <Outlet />
    </div>
  
);
};

export default VaccinationCampaignManagement;