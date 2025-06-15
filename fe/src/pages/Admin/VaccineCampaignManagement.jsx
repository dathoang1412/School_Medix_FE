import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Calendar, MapPin, CheckCircle, Clock, AlertCircle, Plus, XCircle, PlayCircle } from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import axiosClient from '../../config/axiosClient';

const VaccineCampaignManagement = () => {
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
    navigate('/admin/vaccine-campaign-creation');
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
      case 'COMPLETED': return 'text-green-700 bg-green-100 border-green-200';
      case 'ONGOING': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'PREPARING': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'CANCELLED': return 'text-red-700 bg-red-100 border-red-200';
      case 'UPCOMING': return 'text-purple-700 bg-purple-100 border-purple-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'ONGOING': return 'Đang diễn ra';
      case 'PREPARING': return 'Đang chuẩn bị';
      case 'CANCELLED': return 'Đã hủy';
      case 'UPCOMING': return 'Sắp diễn ra';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'ONGOING': return <PlayCircle className="w-4 h-4" />;
      case 'PREPARING': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'UPCOMING': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Get card border color based on status
  const getCardBorderColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'border-l-green-500';
      case 'ONGOING': return 'border-l-blue-500';
      case 'PREPARING': return 'border-l-amber-500';
      case 'CANCELLED': return 'border-l-red-500';
      case 'UPCOMING': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

  // Get button styles based on status
  const getActionButtonStyle = (status) => {
    switch (status) {
      case 'PREPARING':
        return 'px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors duration-200';
      case 'UPCOMING':
        return 'px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200';
      case 'ONGOING':
        return 'px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200';
      case 'COMPLETED':
        return 'px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200';
      case 'CANCELLED':
        return 'px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg cursor-not-allowed';
      default:
        return 'px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200';
    }
  };

  const getActionButtonText = (status) => {
    switch (status) {
      case 'PREPARING': return 'Bắt đầu chuẩn bị';
      case 'UPCOMING': return 'Kích hoạt chiến dịch';
      case 'ONGOING': return 'Tạm dừng';
      case 'COMPLETED': return 'Xem báo cáo';
      case 'CANCELLED': return 'Đã hủy';
      default: return 'Thao tác';
    }
  };

  return (
    <div className="w-full mx-auto p-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Quản lý Chiến dịch Tiêm chủng</h1>
            <p className="text-gray-600 text-lg">Danh sách các chiến dịch tiêm chủng và thông tin chi tiết</p>
          </div>
          <button
            onClick={handleAddNewCampaign}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" />
            <span>Thêm mới kế hoạch y tế</span>
          </button>
        </div>

        {/* Status Legend */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái chiến dịch</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { status: 'COMPLETED', count: campaignList.filter(c => c.status === 'COMPLETED').length },
              { status: 'ONGOING', count: campaignList.filter(c => c.status === 'ONGOING').length },
              { status: 'PREPARING', count: campaignList.filter(c => c.status === 'PREPARING').length },
              { status: 'UPCOMING', count: campaignList.filter(c => c.status === 'UPCOMING').length },
              { status: 'CANCELLED', count: campaignList.filter(c => c.status === 'CANCELLED').length }
            ].map(({ status, count }) => (
              <div key={status} className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="font-medium">{getStatusText(status)}</span>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {campaignList.map((campaign) => (
          <div
            key={campaign.campaign_id}
            className={`bg-white rounded-xl shadow-md border-l-4 ${getCardBorderColor(campaign.status)} border-r border-t border-b border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300`}
          >
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={(e) => toggleExpanded(campaign.campaign_id, e)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-semibold ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span>{getStatusText(campaign.status)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{campaign.description}</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 font-medium">Chi tiết</span>
                  {expandedItems[campaign.campaign_id] ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {expandedItems[campaign.campaign_id] && (
              <div className="px-6 pb-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                      <Calendar className="w-6 h-6 text-blue-500 mt-1" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Thời gian bắt đầu</p>
                        <p className="text-base text-gray-600 font-medium">{formatDate(campaign.start_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                      <Calendar className="w-6 h-6 text-red-500 mt-1" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Thời gian kết thúc</p>
                        <p className="text-base text-gray-600 font-medium">{formatDate(campaign.end_date)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                      <MapPin className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Địa điểm</p>
                        <p className="text-base text-gray-600 font-medium">{campaign.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mt-1">
                        <span className="text-sm text-white font-bold">V</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Vaccine</p>
                        <p className="text-base text-gray-600 font-medium">{campaign.vaccine_name} (#{campaign.vaccine_id})</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                  <button onClick={() => {navigate(`/admin/vaccine-campaign/${campaign.campaign_id}`)}}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg">
                    Xem chi tiết
                  </button>
                  <button 
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    disabled={campaign.status === 'CANCELLED'}
                  >
                    Chỉnh sửa
                  </button>
                  {campaign.status === 'PREPARING' && (
                    <button className="cursor-pointer px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-200">
                      Đóng đơn
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {campaignList.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-500 text-2xl font-semibold mb-2">Chưa có chiến dịch tiêm chủng nào</p>
          <p className="text-gray-400 text-lg mb-8">Dữ liệu sẽ được hiển thị khi có chiến dịch mới</p>
          <button
            onClick={handleAddNewCampaign}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mx-auto"
          >
            <Plus className="w-6 h-6" />
            <span>Thêm mới kế hoạch y tế</span>
          </button>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default VaccineCampaignManagement;