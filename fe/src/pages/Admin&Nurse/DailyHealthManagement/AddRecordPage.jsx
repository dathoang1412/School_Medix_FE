import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getUserRole } from '../../../service/authService';

const AddRecordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    detect_time: '',
    diagnosis: '',
    on_site_treatment: '',
    transferred_to: '',
    items_usage: '',
    status: ''
  });
  const [error, setError] = useState('');

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.detect_time) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc: Mã Học Sinh và Ngày Phát Hiện.');
      return;
    }
    try {
      const payload = {
        ...formData,
        detect_time: formatDateForAPI(formData.detect_time),
      };
      console.log("Health record POST: ", payload);
      await axiosClient.post('/daily-health-record', payload);
      navigate(`/${getUserRole()}/daily-health`, { state: { success: 'Hồ sơ y tế đã được tạo thành công!' } });
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể tạo hồ sơ y tế');
      console.error(error);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (Object.values(formData).some((value) => value !== '') &&
        !window.confirm('Bạn có chắc muốn quay lại? Các thay đổi sẽ không được lưu.')) {
      return;
    }
    navigate(`/${getUserRole()}/daily-health`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className=" cursor-pointer  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Thêm Hồ Sơ Y Tế Mới</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã Học Sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="Nhập mã học sinh (VD: 100000)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Phát Hiện <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="detect_time"
                value={formData.detect_time}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chẩn Đoán</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
              placeholder="Mô tả chi tiết chẩn đoán (nếu có)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xử Lý Tại Chỗ</label>
            <textarea
              name="on_site_treatment"
              value={formData.on_site_treatment}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
              placeholder="Mô tả cách xử lý tại chỗ (nếu có)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chuyển Đến</label>
            <input
              type="text"
              name="transferred_to"
              value={formData.transferred_to}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              placeholder="Tên bệnh viện hoặc phòng khám (nếu có chuyển viện)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vật Tư Sử Dụng</label>
            <textarea
              name="items_usage"
              value={formData.items_usage}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
              placeholder="Liệt kê vật tư y tế đã sử dụng (nếu có)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tình Trạng</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              <option value="">Chọn tình trạng</option>
              <option value="MILD">Nhẹ</option>
              <option value="SERIOUS">Nghiêm trọng</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Lưu Hồ Sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordPage;