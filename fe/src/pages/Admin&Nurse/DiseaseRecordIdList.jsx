import React, { useState } from 'react';

const DiseaseRecordIdList = ({ records }) => {
  const [expanded, setExpanded] = useState({});

  const toggleDetails = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-6 gap-4 text-gray-700 font-semibold mb-2 border-b pb-2">
        <span>Mã Học Sinh</span>
        <span>Ngày Phát Hiện</span>
        <span>Ngày Ghi Nhận</span>
        <span>Chẩn Đoán</span>
        <span>Loại Bệnh</span>
        <span></span>
      </div>
      {records.map((record, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 items-center py-2 border-b hover:bg-gray-50">
          <span className="text-blue-600">• {record.student_id}</span>
          <span>{new Date(record.detect_date).toLocaleDateString()}</span>
          <span>{new Date(record.created_at).toLocaleDateString()}</span>
          <span>{record.diagnosis || 'Không có'}</span>
          <span>{record.disease_category === 'Bệnh truyền nhiễm' ? 'Truyền nhiễm' : 'Mãn tính'}</span>
          <div className="flex gap-2">
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => toggleDetails(index)}
            >
              Chi Tiết
            </span>
          </div>

          {/* Dropdown Details */}
          {expanded[index] && (
            <div className="col-span-6 bg-gray-50 p-4 mt-2 rounded-lg shadow-inner">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div><strong>Tên Bệnh:</strong> {record.disease_name || 'Không có'}</div>
                <div><strong>Mô Tả:</strong> {record.description || 'Không có'}</div>
                <div><strong>Cần Vaccine:</strong> {record.vaccine_need ? 'Có' : 'Không'}</div>
                <div><strong>Số Liều:</strong> {record.dose_quantity || 'Không có'}</div>
                <div><strong>Ngày Điều Trị:</strong> {record.cure_date ? new Date(record.cure_date).toLocaleDateString() : 'Chưa điều trị'}</div>
                <div><strong>Nơi Điều Trị:</strong> {record.location_cure || 'Không có'}</div>
                <div><strong>Ngày Tạo:</strong> {new Date(record.created_at).toLocaleString()}</div>
                <div><strong>Ngày Cập Nhật:</strong> {new Date(record.updated_at).toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      ))}
      {records.length === 0 && <div className="text-center text-gray-500 py-4">Không có hồ sơ bệnh nào</div>}
    </div>
  );
};

export default DiseaseRecordIdList;