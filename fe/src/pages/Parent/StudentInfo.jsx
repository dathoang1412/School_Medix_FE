import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import TabHeader from '../../components/TabHeader';
export const StudentInfo = () => {

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
      {/* Title & Tabs */}
      {/* Student Card */}
      <div className="w-full max-w-xs mx-auto sm:mx-0 p-5 rounded-xl shadow flex flex-col items-center bg-blue-50 border border-blue-200 mb-8">
        <img src={child.image} alt="student_1" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-3 object-cover bg-white" />
        <h3 className="text-base sm:text-lg font-semibold">{child.name}</h3>
        <p className="text-gray-600">{child.class}</p>
      </div>

      {/* Info Sections */}
      <div className="space-y-8">
        {/* Thông tin chung */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3">Thông tin chung</h2>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-24 mt-2 mb-10">
            <div className="flex-1 flex flex-col gap-2 text-gray-700">
              <span>Ngày sinh: 20/2/2013</span>
              <span>Giới tính: Nữ</span>
              <span>Nơi sinh: </span>
              <span>Quốc tịch</span>
              <span>Số điện thoại</span>
            </div>
            <div className="flex-1 flex flex-col gap-2 text-gray-700">
              <span>Mã học sinh: SE196253</span>
              <span>Khối: Khối 3</span>
              <span>Lớp: 3A</span>
              <span>
                Trạng Thái:
                <span className="ml-2 px-2 py-0.5 rounded text-emerald-800 bg-green-100 text-xs">Đang học</span>
              </span>
              <span>Địa chỉ cư trú</span>
            </div>
          </div>
        </div>
        {/* Thông tin gia đình */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3">Thông tin gia đình</h2>
          <div className="flex flex-col gap-2 text-gray-700">
            <span>Họ và tên: </span>
            <span>Ngày sinh: </span>
            <span>Nghề nghiệp: </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;