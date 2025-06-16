import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle, Play, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const StudentRegularCheckup = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách chiến dịch khám sức khỏe');
        setLoading(false);
        console.error('Error fetching campaigns:', err);
      }
    };
    fetchCampaign();
  }, []);

  const toggleExpanded = (campaignId, e) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'DONE':
        return {
          status: 'Đã hoàn thành',
          className: 'bg-green-300 text-gray-800',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'ONGOING':
        return {
          status: 'Đang diễn ra',
          className: 'bg-green-100 text-green-800',
          icon: <Play className="w-4 h-4" />,
        };
      case 'UPCOMING':
        return {
          status: 'Sắp tới',
          className: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'PREPARING':
        return {
          status: 'Đang chuẩn bị',
          className: 'bg-blue-100 text-blue-800',
          icon: <Calendar className="w-4 h-4" />,
        };
      case 'CANCELLED':
        return {
          status: 'Đã hủy',
          className: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          status: 'Chưa xác định',
          className: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="w-4 h-4" />,
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Chưa xác định';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Đang tải thông tin chiến dịch khám sức khỏe...</p>
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
          Thông tin khám sức khỏe định kỳ
        </h1>
        <p className="text-gray-600">Xem thông tin các chiến dịch khám sức khỏe cho học sinh</p>
      </div>

      {/* Campaign List */}
      {campaignList.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có chiến dịch khám sức khỏe nào</h3>
          <p className="text-gray-500">Vui lòng quay lại sau để kiểm tra thông tin mới nhất</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaignList.map((campaign) => {
            const statusInfo = getStatusConfig(campaign.status);
            return (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Campaign Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{campaign.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">ID: {campaign.id}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
                    >
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
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{campaign.specialist_exams?.length || 0} hạng mục khám</span>
                    </div>
                  </div>

                  {/* Description */}
                  {campaign.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 line-clamp-3">{campaign.description}</p>
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={(e) => toggleExpanded(campaign.id, e)}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    {expandedItems[campaign.id] ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Xem chi tiết
                      </>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {expandedItems[campaign.id] && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      {/* Detailed Description */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết:</p>
                        <p className="text-sm text-gray-600 break-words">{campaign.description}</p>
                      </div>

                      {/* Specialist Exams */}
                      {campaign.specialist_exams && campaign.specialist_exams.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Hạng mục khám chuyên khoa:</p>
                          <div className="space-y-2">
                            {campaign.specialist_exams.map((exam) => (
                              <div
                                key={exam.id}
                                className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200"
                              >
                                <p className="font-medium text-gray-900 break-words">{exam.name}</p>
                                <p className="text-gray-600 break-words">{exam.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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

export default StudentRegularCheckup;