import React, { useState } from "react";
import { Plus, Search, FileText } from "lucide-react";
import useDiseaseRecords from "../../../hooks/useDiseaseRecords";
import DiseaseRecordList from "./DiseaseRecordList";
import AddDiseaseRecord from "./AddDiseaseRecord";

const DiseaseRecordManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { records, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, loading, error } = useDiseaseRecords();

  // Get today's records count
  const todayRecordsCount = records.filter(record => {
    const detectDate = new Date(record.detect_date);
    const createdDate = new Date(record.created_at);
    const today = new Date();
    return (
      detectDate.toDateString() === today.toDateString() ||
      createdDate.toDateString() === today.toDateString()
    );
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Quản lý Hồ sơ Bệnh án</h1>
              <p className="text-gray-600">Theo dõi và quản lý hồ sơ bệnh án học sinh</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{records.length}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Tổng hồ sơ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{todayRecordsCount}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Hôm nay</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        {!showAddForm && (
          <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo mã học sinh hoặc tên bệnh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                <div className="flex gap-3">
                  {["Tất cả bệnh", "Bệnh truyền nhiễm", "Bệnh mãn tính"].map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                        categoryFilter === category
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Thêm Hồ Sơ
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : showAddForm ? (
          <AddDiseaseRecord onClose={() => setShowAddForm(false)} categoryFilter={categoryFilter} />
        ) : records.length === 0 ? (
          <div className="bg-white shadow-sm border border-gray-200 p-12 text-center">
            <FileText size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy hồ sơ nào</p>
            <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc thêm hồ sơ mới</p>
          </div>
        ) : (
          <DiseaseRecordList records={records} />
        )}
      </div>
    </div>
  );
};

export default DiseaseRecordManagement;