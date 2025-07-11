import React, { useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { enqueueSnackbar } from "notistack";

const SpecialistExamAdd = ({ exam, onClose }) => {
  const [name, setName] = useState(exam?.name || "");
  const [description, setDescription] = useState(exam?.description || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (exam) {
        // Update existing exam
        await axiosClient.patch(`/special-exam/${exam.id}`, { name, description });
        enqueueSnackbar("Cập nhật chuyên khoa thành công", { variant: "success" });
      } else {
        // Create new exam
        await axiosClient.post("/special-exam", { name, description });
        enqueueSnackbar("Thêm chuyên khoa thành công", { variant: "success" });
      }
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi khi lưu chuyên khoa";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if ((name || description) && !window.confirm("Bạn có chắc muốn quay lại? Các thay đổi sẽ không được lưu.")) {
      return;
    }
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {exam ? "Sửa Chuyên Khoa" : "Thêm Chuyên Khoa Mới"}
            </h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Chuyên Khoa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="Nhập tên chuyên khoa (VD: Nhi khoa, Nội khoa)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô Tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                placeholder="Mô tả chi tiết về chuyên khoa"
                rows="5"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 cursor-pointer py-2.5 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Đang lưu..." : exam ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialistExamAdd;