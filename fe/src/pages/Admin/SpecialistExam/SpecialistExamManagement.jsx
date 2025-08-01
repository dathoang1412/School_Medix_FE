import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import useSpecialistExams from "../../../hooks/useSpecialistExams";
import SpecialistExamList from "./SpecialistExamList";
import SpecialistExamAdd from "./SpecialistExamAdd";

const SpecialistExamManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const { exams, searchTerm, setSearchTerm, loading, error, refetch } = useSpecialistExams();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Quản lý Khám Chuyên khoa</h1>
              <p className="text-gray-600">Theo dõi và quản lý danh sách khám chuyên khoa</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{exams.length}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Tổng chuyên khoa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        {!showAddForm && (
          <div className="bg-white shadow-sm border border-gray-200 mb-6 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên chuyên khoa"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button
                onClick={() => {
                  setEditExam(null);
                  setShowAddForm(true);
                }}
                className=" cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Thêm Chuyên Khoa Mới
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : showAddForm ? (
          <SpecialistExamAdd
            exam={editExam}
            onClose={() => {
              setShowAddForm(false);
              setEditExam(null);
              refetch();
            }}
          />
        ) : (
          <SpecialistExamList
            exams={exams}
            onEdit={(exam) => {
              setEditExam(exam);
              setShowAddForm(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SpecialistExamManagement;