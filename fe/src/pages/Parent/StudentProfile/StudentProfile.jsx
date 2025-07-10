import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Calendar, Users, GraduationCap, CheckCircle } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getStudentInfo } from '../../../service/childenService';
import { useParams } from 'react-router-dom';

const StudentProfile = () => {
  const [childData, setChildData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { student_id } = useParams();

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await getStudentInfo(student_id);
        // console.log("Child Info: ", response);
        setChildData(response);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setError(err.message || "Failed to fetch student profile");
        setIsLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">Đang tải thông tin học sinh...</p>
        </div>
      </div>
    );
  }

  if (error || !childData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "Không tìm thấy thông tin học sinh"}</p>
        </div>
      </div>
    );
  }

  const InfoRow = ({ label, value, status, icon: Icon }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
        <span className="text-sm text-gray-600 font-medium">{label}:</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900 font-medium">{value || ""}</span>
        {status && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            {status}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with Avatar and Name */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-20 h-24 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                <span className="text-2xl font-bold text-blue-600">
                  {childData.name?.charAt(0).toUpperCase() || "-"}
                </span>
              </div>
              {childData.email_confirmed && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{childData.name || "Không có tên"}</h1>
              <p className="text-blue-600 font-medium">{childData.class_name || "-"}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Personal Information */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin chung</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <InfoRow label="Ngày sinh" value={formatDate(childData.dob)} icon={Calendar} />
                <InfoRow label="Giới tính" value={childData.isMale ? "Nam" : "Nữ"} icon={User} />
                <InfoRow label="Nơi sinh" value={childData.address || "-"} icon={MapPin} />
                <InfoRow label="Quốc tịch" value="Việt Nam" icon={Users} />
                <InfoRow label="Dân tộc" value="-" icon={Users} />
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-4 mt-6">Thông tin gia đình</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                {childData.mom_profile && (
                  <>
                    <InfoRow label="Họ và tên mẹ" value={childData.mom_profile.name || "-"} icon={User} />
                    <InfoRow label="Ngày sinh" value={formatDate(childData.mom_profile.dob)} icon={Calendar} />
                    <InfoRow label="Nghề nghiệp" value="-" icon={GraduationCap} />
                  </>
                )}
                {childData.dad_profile && (
                  <>
                    <InfoRow label="Họ và tên bố" value={childData.dad_profile.name || "-"} icon={User} />
                    <InfoRow label="Ngày sinh" value={formatDate(childData.dad_profile.dob)} icon={Calendar} />
                    <InfoRow label="Nghề nghiệp" value="-" icon={GraduationCap} />
                  </>
                )}
                {!childData.mom_profile && !childData.dad_profile && (
                  <InfoRow label="Thông tin phụ huynh" value="Không có thông tin" icon={Users} />
                )}
              </div>
            </div>

            {/* Right Column - School Information */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin học tập</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <InfoRow label="Mã học sinh" value={`${childData.id}`} icon={User} />
                <InfoRow label="Lớp" value={childData.class_name || "-"} icon={GraduationCap} />
                <InfoRow label="Trạng thái" value="" status="Đang học" icon={CheckCircle} />
                <InfoRow label="Địa chỉ cư trú" value={childData.address || "-"} icon={MapPin} />
                <InfoRow label="Email" value={childData.email || "-"} icon={Mail} />
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-4 mt-6">Địa chỉ liên hệ </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 leading-relaxed">{childData.address || "-"}</p>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-4 mt-6">Liên hệ khẩn cấp</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <InfoRow label="Số điện thoại" value={childData.phone_number || "-"} icon={Phone} />
                <InfoRow 
                  label="Email phụ huynh" 
                  value={childData.mom_profile?.email || childData.dad_profile?.email || "-"} 
                  icon={Mail}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;