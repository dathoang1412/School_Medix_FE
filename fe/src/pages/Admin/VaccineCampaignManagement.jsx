import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Calendar, MapPin, CheckCircle, Clock, AlertCircle, Plus, XCircle, PlayCircle, Activity, Users, FileText, Edit } from 'lucide-react';
import { getUserRole } from '../../service/authService';
import axiosClient from '../../config/axiosClient';

const VaccineCampaignManagement = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [loadingActions, setLoadingActions] = useState({});
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchCam = async () => {
      try {
        const res = await axiosClient.get('/vaccination-campaign');
        const campaigns = res.data.data || [];
        setCampaignList(campaigns);
        console.log("Campaign list:", campaigns);
        const ids = campaigns.map(c => c.campaign_id);
        if (new Set(ids).size !== ids.length) {
          console.error("Duplicate campaign IDs detected:", ids);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCam();
    const role = getUserRole();
    setUserRole(role);
  }, []);

  const toggleExpanded = useCallback((id, e) => {
    e.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleAddNewCampaign = () => {
    console.log('Navigate to campaign creation');
  };

  const handleCampaignAction = async (campaignId, action) => {
    setLoadingActions(prev => ({ ...prev, [campaignId]: true }));
    
    setTimeout(() => {
      setLoadingActions(prev => ({ ...prev, [campaignId]: false }));
      console.log(`Action ${action} completed for campaign ${campaignId}`);
    }, 2000);
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
      case 'COMPLETED': return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'ONGOING': return 'text-indigo-800 bg-indigo-50 border-indigo-200';
      case 'PREPARING': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'CANCELLED': return 'text-red-800 bg-red-50 border-red-200';
      case 'UPCOMING': return 'text-violet-800 bg-violet-50 border-violet-200';
      default: return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'ONGOING': return 'Đang thực hiện';
      case 'PREPARING': return 'Đang chuẩn bị';
      case 'CANCELLED': return 'Đã hủy bỏ';
      case 'UPCOMING': return 'Sắp triển khai';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'ONGOING': return <Activity className="w-4 h-4" />;
      case 'PREPARING': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'UPCOMING': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCardBorderColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'border-l-emerald-600';
      case 'ONGOING': return 'border-l-indigo-600';
      case 'PREPARING': return 'border-l-amber-600';
      case 'CANCELLED': return 'border-l-red-600';
      case 'UPCOMING': return 'border-l-violet-600';
      default: return 'border-l-slate-600';
    }
  };

  const getPrimaryActionConfig = (status, campaignId) => {
    // If user is nurse, only show report editing for ONGOING campaigns
    if (userRole === 'nurse') {
      if (status === 'ONGOING') {
        return {
          text: 'Chỉnh sửa báo cáo',
          action: 'edit-report',
          className: 'bg-indigo-700 hover:bg-indigo-800 text-white',
          disabled: false,
          onClick: () => {
            console.log('Navigate to /bao-cao');
            // navigate('/bao-cao');
          }
        };
      }
      return null; // No action buttons for other statuses if user is nurse
    }

    // Admin has full access to all actions
    switch (status) {
      case 'PREPARING':
        return {
          text: 'Đóng đơn đăng ký',
          action: 'close-register',
          className: 'bg-amber-700 hover:bg-amber-800 text-white',
          disabled: false
        };
      case 'UPCOMING':
        return {
          text: 'Khởi động chiến dịch',
          action: 'start',
          className: 'bg-indigo-700 hover:bg-indigo-800 text-white',
          disabled: false
        };
      case 'ONGOING':
        return {
          text: 'Hoàn thành chiến dịch',
          action: 'complete',
          className: 'bg-emerald-700 hover:bg-emerald-800 text-white',
          disabled: false
        };
      case 'COMPLETED':
        return {
          text: 'Xem báo cáo',
          action: 'view-report',
          className: 'bg-slate-700 hover:bg-slate-800 text-white',
          disabled: false,
          onClick: () => console.log(`View report for campaign ${campaignId}`)
        };
      case 'CANCELLED':
        return {
          text: 'Đã hủy bỏ',
          action: null,
          className: 'bg-slate-400 text-white cursor-not-allowed',
          disabled: true
        };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">
                Quản lý Chiến dịch Tiêm chủng
              </h1>
              <p className="text-slate-600 text-base">
                {userRole === 'admin' 
                  ? 'Hệ thống quản lý và giám sát các chiến dịch tiêm chủng' 
                  : 'Theo dõi và cập nhật báo cáo chiến dịch tiêm chủng'
                }
              </p>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={handleAddNewCampaign}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo chiến dịch mới</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { status: 'COMPLETED', label: 'Hoàn thành', count: campaignList.filter(c => c.status === 'COMPLETED').length },
            { status: 'ONGOING', label: 'Đang thực hiện', count: campaignList.filter(c => c.status === 'ONGOING').length },
            { status: 'PREPARING', label: 'Chuẩn bị', count: campaignList.filter(c => c.status === 'PREPARING').length },
            { status: 'UPCOMING', label: 'Sắp triển khai', count: campaignList.filter(c => c.status === 'UPCOMING').length },
            { status: 'CANCELLED', label: 'Đã hủy', count: campaignList.filter(c => c.status === 'CANCELLED').length }
          ].map(({ status, label, count }) => (
            <div key={status} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
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

        {/* Campaign List */}
        <div className="space-y-4">
          {campaignList.map((campaign) => {
            const primaryAction = getPrimaryActionConfig(campaign.status, campaign.campaign_id);
            const isLoading = loadingActions[campaign.campaign_id];

            return (
              <div
                key={campaign.campaign_id}
                className={`bg-white rounded-lg border border-slate-200 border-l-4 ${getCardBorderColor(campaign.status)} shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <div
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                  onClick={(e) => toggleExpanded(campaign.campaign_id, e)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span>{getStatusText(campaign.status)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 max-w-2xl">
                        {campaign.description}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-500 font-medium">Chi tiết</span>
                      {expandedItems[campaign.campaign_id] ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedItems[campaign.campaign_id] && (
                  <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Thời gian bắt đầu</p>
                            <p className="text-base text-slate-900">{formatDate(campaign.start_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Thời gian kết thúc</p>
                            <p className="text-base text-slate-900">{formatDate(campaign.end_date)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Địa điểm thực hiện</p>
                            <p className="text-base text-slate-900">{campaign.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-violet-100 rounded-lg">
                            <Users className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Vaccine sử dụng</p>
                            <p className="text-base text-slate-900">{campaign.vaccine_name}</p>
                            <p className="text-sm text-slate-500">Mã vaccine: {campaign.vaccine_id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-3">
                      <button 
                        className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Xem chi tiết
                      </button>
                      
                      {primaryAction && (
                        <button 
                          onClick={primaryAction.onClick || (() => {
                            if (primaryAction.action) {
                              handleCampaignAction(campaign.campaign_id, primaryAction.action);
                            }
                          })}
                          disabled={primaryAction.disabled || isLoading}
                          className={`px-5 py-2.5 font-medium rounded-lg transition-colors duration-200 ${primaryAction.className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''} flex items-center space-x-2`}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Đang xử lý...</span>
                            </>
                          ) : (
                            <>
                              {primaryAction.action === 'edit-report' && <Edit className="w-4 h-4" />}
                              <span>{primaryAction.text}</span>
                            </>
                          )}
                        </button>
                      )}
                      
                      {userRole === 'admin' && (campaign.status === 'PREPARING' || campaign.status === 'UPCOMING') && (
                        <button 
                          onClick={() => handleCampaignAction(campaign.campaign_id, 'cancel')}
                          disabled={isLoading}
                          className={`px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''} flex items-center space-x-2`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Hủy chiến dịch</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {campaignList.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Chưa có chiến dịch nào</h3>
            <p className="text-slate-500 mb-8">
              {userRole === 'admin' 
                ? 'Hệ thống sẽ hiển thị danh sách khi có chiến dịch mới được tạo'
                : 'Hiện tại chưa có chiến dịch nào để theo dõi'
              }
            </p>
            {userRole === 'admin' && (
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

export default VaccineCampaignManagement;