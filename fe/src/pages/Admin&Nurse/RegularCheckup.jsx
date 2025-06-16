import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import axiosClient from "../../config/axiosClient";

const RegularCheckup = () => {
  const [campaignList, setCampaignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/checkup-campaign");
        console.log("CHECKUP LIST: ", res.data.data);
        setCampaignList(res.data.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách chiến dịch khám sức khỏe");
        setLoading(false);
        console.error("Error fetching campaigns:", err);
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
      case "DONE":
        return {
          icon: CheckCircle,
          color: "bg-green-100 border-green-200 text-green-700",
          text: "Hoàn thành",
          borderColor: "border-green-400",
        };
      case "ONGOING":
        return {
          icon: Play,
          color: "bg-blue-100 border-blue-200 text-blue-700",
          text: "Đang diễn ra",
          borderColor: "border-blue-400",
        };
      case "UPCOMING":
        return {
          icon: Clock,
          color: "bg-orange-100 border-orange-200 text-orange-700",
          text: "Sắp tới",
          borderColor: "border-orange-400",
        };
      case "PREPARING":
        return {
          icon: AlertCircle,
          color: "bg-yellow-100 border-yellow-200 text-yellow-700",
          text: "Chuẩn bị",
          borderColor: "border-yellow-400",
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          color: "bg-red-100 border-red-200 text-red-700",
          text: "Đã hủy",
          borderColor: "border-red-400",
        };
      default:
        return {
          icon: AlertCircle,
          color: "bg-gray-100 border-gray-200 text-gray-700",
          text: "Không xác định",
          borderColor: "border-gray-400",
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleAddNewCampaign = () => {
    console.log("Add new campaign");
  };

  if (loading) {
    return (
      <div className="w-full mx-auto p-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Đang tải danh sách chiến dịch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full mx-auto p-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <XCircle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Quản lý Chiến dịch Khám sức khỏe
            </h1>
            <p className="text-gray-600 text-lg">
              Danh sách các chiến dịch khám sức khỏe và thông tin chi tiết
            </p>
          </div>
          <div className="flex-shrink-0 ml-6">
            <button
              onClick={handleAddNewCampaign}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm mới chiến dịch</span>
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Trạng thái chiến dịch
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              {
                status: "DONE",
                count: campaignList.filter((c) => c.status === "DONE").length,
              },
              {
                status: "ONGOING",
                count: campaignList.filter((c) => c.status === "ONGOING")
                  .length,
              },
              {
                status: "PREPARING",
                count: campaignList.filter((c) => c.status === "PREPARING")
                  .length,
              },
              {
                status: "UPCOMING",
                count: campaignList.filter((c) => c.status === "UPCOMING")
                  .length,
              },
              {
                status: "CANCELLED",
                count: campaignList.filter((c) => c.status === "CANCELLED")
                  .length,
              },
            ].map(({ status, count }) => {
              const config = getStatusConfig(status);
              return (
                <div
                  key={status}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-semibold ${config.color}`}
                >
                  <config.icon className="w-5 h-5" />
                  <span>{config.text}</span>
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-bold">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {campaignList.map((campaign) => {
          const statusConfig = getStatusConfig(campaign.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={campaign.id}
              className={`bg-white rounded-xl shadow-md border-l-4 ${statusConfig.borderColor} border-r border-t border-b border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300`}
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={(e) => toggleExpanded(campaign.id, e)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-semibold ${statusConfig.color} flex-shrink-0`}
                    >
                      <StatusIcon className="w-5 h-5" />
                      <span>{statusConfig.text}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 truncate">
                      {campaign.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-sm text-gray-500 font-medium">
                      Chi tiết
                    </span>
                    {expandedItems[campaign.id] ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedItems[campaign.id] && (
                <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="p-6 max-w-full">
                    {/* Description */}
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Mô tả chi tiết:
                      </p>
                      <p className="text-gray-600 leading-relaxed break-words">
                        {campaign.description}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                          <Calendar className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Thời gian bắt đầu
                            </p>
                            <p className="text-base text-gray-600 font-medium">
                              {formatDate(campaign.start_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                          <Calendar className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Thời gian kết thúc
                            </p>
                            <p className="text-base text-gray-600 font-medium">
                              {formatDate(campaign.end_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                          <MapPin className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Địa điểm
                            </p>
                            <p className="text-base text-gray-600 font-medium break-words">
                              {campaign.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                            <span className="text-xs text-white font-bold">
                              H
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Số hạng mục khám
                            </p>
                            <p className="text-base text-gray-600 font-medium">
                              {campaign.specialist_exams?.length || 0} hạng mục
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Specialist Exams */}
                    {campaign.specialist_exams &&
                      campaign.specialist_exams.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Các hạng mục khám chuyên khoa
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {campaign.specialist_exams.map((exam) => (
                              <div
                                key={exam.id}
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg flex-shrink-0">
                                    <Users className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-gray-900 mb-2 break-words">
                                      {exam.name}
                                    </h5>
                                    <p className="text-sm text-gray-600 leading-relaxed break-words">
                                      {exam.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          console.log(
                            `View details for campaign ${campaign.id}`
                          )
                        }
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        Xem chi tiết
                      </button>

                      {campaign.status === "PREPARING" && (
                        <button
                          onClick={() =>
                            console.log(`Start campaign ${campaign.id}`)
                          }
                          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                          Bắt đầu chiến dịch
                        </button>
                      )}

                      {(campaign.status === "PREPARING" ||
                        campaign.status === "UPCOMING") && (
                        <button
                          onClick={() =>
                            console.log(`Cancel campaign ${campaign.id}`)
                          }
                          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Hủy chiến dịch</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {campaignList.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-500 text-2xl font-semibold mb-2">
            Chưa có chiến dịch khám sức khỏe nào
          </p>
          <p className="text-gray-400 text-lg mb-8">
            Dữ liệu sẽ được hiển thị khi có chiến dịch mới
          </p>
          <button
            onClick={handleAddNewCampaign}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mx-auto"
          >
            <Plus className="w-6 h-6" />
            <span>Thêm mới chiến dịch</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RegularCheckup;
