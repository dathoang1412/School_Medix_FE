import React from "react";
import {
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  PlayCircle,
  Users,
  Syringe,
  FileText,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getCardBorderColor,
  calculateDuration,
  formatDate,
  getStatusColor,
  getStatusText,
} from "../../../utils/campaignUtils";

const VaccineCampaignInfo = ({ details }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "ONGOING":
        return <PlayCircle className="w-4 h-4" />;
      case "PREPARING":
        return <Clock className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "UPCOMING":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Information */}
      <div className="lg:col-span-2 space-y-6">
        {/* Campaign Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {details.description || "Chiến dịch tiêm chủng"}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                {getStatusIcon(details.status)}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    details.status
                  )}`}
                >
                  {getStatusText(details.status)}
                </span>
              </div>
              <button
                onClick={() =>
                  navigate(`/admin/vaccine-campaign/student-list/${details.campaign_id}`)
                }
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Xem danh sách học sinh
              </button>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Syringe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium text-center">
                Chiến dịch tiêm chủng
              </p>
            </div>
          </div>
        </div>

        {/* Vaccine Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Syringe className="w-6 h-6 text-gray-700 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Thông tin vaccine
            </h2>
          </div>
          <div className="space-y-4">
            {details.vaccine_name ? (
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <Syringe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {details.vaccine_name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Vaccine #{details.vaccine_id} - Phòng ngừa{" "}
                      {details.disease || "Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Syringe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có thông tin về vaccine</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-gray-700 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Lịch trình chiến dịch
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Thời gian bắt đầu
                </p>
                <p className="text-gray-900 font-semibold">
                  {details.start_date ? formatDate(details.start_date) : "Chưa xác định"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Thời gian kết thúc
                </p>
                <p className="text-gray-900 font-semibold">
                  {details.end_date ? formatDate(details.end_date) : "Chưa xác định"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Địa điểm</p>
                <p className="text-gray-900 font-semibold capitalize">
                  {details.location || "Chưa xác định"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Information */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-700" />
            Thống kê nhanh
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">ID Chiến dịch</span>
              <span className="font-semibold text-gray-900">
                #{details.campaign_id}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Thời gian</span>
              <span className="font-semibold text-gray-900">
                {calculateDuration(details.start_date, details.end_date)} ngày
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Trạng thái</span>
              <span className="font-semibold text-gray-900">
                {getStatusText(details.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-gray-700" />
            Thao tác nhanh
          </h3>
          <div className="space-y-3">
            <button
              onClick={() =>
                navigate(`/admin/vaccine-campaign/student-list/${details.campaign_id}`)
              }
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Xem danh sách học sinh
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default VaccineCampaignInfo;