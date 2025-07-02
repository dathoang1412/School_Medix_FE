import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, StepBackIcon } from 'lucide-react';
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
      console.log("Health record POST: ", payload)
      await axiosClient.post('/daily-health-record', payload);
      navigate('/daily-health-record', { state: { success: 'Hồ sơ y tế đã được tạo thành công!' } });
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
    navigate( '/'  + getUserRole() +'/daily-health');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">

      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={24} />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Thêm Hồ Sơ Y Tế Mới</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-3" />
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã Học Sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập mã học sinh (VD: 100000)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày Phát Hiện <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="detect_time"
                value={formData.detect_time}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chẩn Đoán</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Nhập chi tiết chẩn đoán"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Xử Lý Tại Chỗ</label>
            <textarea
              name="on_site_treatment"
              value={formData.on_site_treatment}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Mô tả cách xử lý tại chỗ"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chuyển Đến</label>
            <input
              type="text"
              name="transferred_to"
              value={formData.transferred_to}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Tên bệnh viện hoặc phòng khám (nếu có chuyển viện)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vật Tư Sử Dụng</label>
            <textarea
              name="items_usage"
              value={formData.items_usage}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Liệt kê vật tư y tế đã sử dụng"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
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