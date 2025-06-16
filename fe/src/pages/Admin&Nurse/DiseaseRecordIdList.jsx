import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, User, Activity, MapPin } from 'lucide-react';

const DiseaseRecordIdList = ({ records }) => {
  const [expanded, setExpanded] = useState({});

  const toggleDetails = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStatusBadge = (record) => {
    // Kiểm tra xem có cần chuyển viện không
    if (record.location_cure && record.location_cure !== 'Tại chỗ') {
      return (
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          Chuyển viện
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
        Điều trị tại chỗ
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-6 gap-4 text-base font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <User size={18} />
            Mã Học Sinh
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            Ngày Phát Hiện
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            Ngày Ghi Nhận
            <ChevronDown size={16} />
          </div>
          <div className="flex items-center gap-2">
            <Activity size={18} />
            Chẩn Đoán
          </div>
          <div>Trạng Thái</div>
          <div>Chi Tiết</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {records.map((record, index) => (
          <div key={index} className="hover:bg-gray-50 transition-colors duration-150">
            {/* Main Row */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4 items-center text-base">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{record.student_id}</span>
                </div>
                <div className="text-gray-700 font-medium">
                  {new Date(record.detect_date).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-gray-700 font-medium">
                  {new Date(record.created_at).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-gray-900 font-medium">
                  {record.diagnosis || record.disease_category || 'Chưa có chẩn đoán'}
                </div>
                <div>
                  {getStatusBadge(record)}
                </div>
                <div>
                  <button
                    onClick={() => toggleDetails(index)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                  >
                    {expanded[index] ? (
                      <>
                        <ChevronUp size={18} />
                        Ẩn
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} />
                        Xem
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expanded[index] && (
              <div className="px-6 pb-6 bg-blue-50 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Thông tin cơ bản */}
                  <div>
                    <h4 className="flex items-center gap-2 text-blue-700 font-medium mb-3">
                      <User size={16} />
                      Thông tin cơ bản
                    </h4>
                    <div className="space-y-2 text-base">
                      <div>
                        <span className="text-gray-600">Mã học sinh: </span>
                        <span className="font-medium">{record.student_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ngày phát hiện: </span>
                        <span className="font-medium">
                          {new Date(record.detect_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ngày ghi nhận: </span>
                        <span className="font-medium">
                          {new Date(record.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chẩn đoán & Điều trị */}
                  <div>
                    <h4 className="flex items-center gap-2 text-green-700 font-medium mb-3">
                      <Activity size={16} />
                      Chẩn đoán & Điều trị
                    </h4>
                    <div className="space-y-2 text-base">
                      <div>
                        <span className="text-gray-600">Chẩn đoán: </span>
                        <span className="font-medium">
                          {record.diagnosis || record.disease_category || 'Chưa có'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Xử lý tại chỗ: </span>
                        <span className="font-medium">
                          {record.description || 'Thông báo phụ huynh, theo dõi phát triển'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ngày điều trị: </span>
                        <span className="font-medium">
                          {record.cure_date ? new Date(record.cure_date).toLocaleDateString('vi-VN') : 'Chưa điều trị'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chuyển viện & Vật tư */}
                  <div>
                    <h4 className="flex items-center gap-2 text-red-700 font-medium mb-3">
                      <MapPin size={16} />
                      Chuyển viện & Vật tư
                    </h4>
                    <div className="space-y-2 text-base">
                      <div>
                        <span className="text-gray-600">Chuyển đến: </span>
                        <span className="font-medium">
                          {record.location_cure || 'Trạm Y tế Phường 3'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cần vaccine: </span>
                        <span className="font-medium">
                          {record.vaccine_need ? 'Có' : 'Không'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-gray-600">Vật tư sử dụng:</span>
                      </div>
                      <div className="ml-6">
                        <span className="font-medium">
                          {record.dose_quantity ? `${record.dose_quantity} liều vaccine` : 'Kem chống ngứa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin bổ sung */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span>Ngày tạo: </span>
                      <span>{new Date(record.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div>
                      <span>Ngày cập nhật: </span>
                      <span>{new Date(record.updated_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {records.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          <div className="mb-2">Không tìm thấy hồ sơ nào</div>
          <div className="text-sm">Thử thay đổi bộ lọc hoặc thêm hồ sơ mới</div>
        </div>
      )}
    </div>
  );
};

export default DiseaseRecordIdList;