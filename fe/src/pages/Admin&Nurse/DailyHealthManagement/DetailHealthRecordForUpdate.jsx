import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getUserRole } from '../../../service/authService';

const DetailHealthRecordForUpdate = () => {
  const { record_id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    diagnosis: '',
    on_site_treatment: '',
    transferred_to: '',
    items_usage: '',
    status: '',
    detect_time: '',
  });
  const [updating, setUpdating] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Chưa xác định';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosClient.get(`/daily-health-record/${record_id}`);
        const fetchedRecord = response.data.data;
        if (!fetchedRecord) {
          setError('Không tìm thấy hồ sơ y tế.');
          setLoading(false);
          return;
        }
        setRecord(fetchedRecord);
        setFormData({
          diagnosis: fetchedRecord.diagnosis || '',
          on_site_treatment: fetchedRecord.on_site_treatment || '',
          transferred_to: fetchedRecord.transferred_to || '',
          items_usage: fetchedRecord.items_usage || '',
          status: fetchedRecord.status || '',
          detect_time: fetchedRecord.detect_time ? new Date(fetchedRecord.detect_time).toISOString().split('T')[0] : '',
        });
      } catch (error) {
        setError('Không thể tải chi tiết hồ sơ y tế.');
        console.error('Error fetching record:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [record_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      setIsChanged(JSON.stringify(newData) !== JSON.stringify(record));
      return newData;
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc: Chẩn đoán.');
      return;
    }
    setUpdating(true);
    try {
      await axiosClient.put(`/daily-health-record/${record_id}`, formData);
      setMessage('Cập nhật hồ sơ thành công.');
      setIsChanged(false); // Reset isChanged sau khi cập nhật thành công
      // Không điều hướng ngay, giữ form hiển thị
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể cập nhật hồ sơ y tế');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleBack = () => {
    if (isChanged && !window.confirm('Bạn có chắc muốn quay lại? Các thay đổi sẽ không được lưu.')) {
      return;
    }
    navigate(`/${getUserRole()}/daily-health`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết hồ sơ y tế</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
            <AlertCircle size={20} className="text-green-500" />
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}


        {/* Form */}
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã Học Sinh
              </label>
              <input
                type="number"
                name="student_id"
                value={record?.student_id || ''}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-100"
                placeholder="Mã học sinh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Học Sinh
              </label>
              <input
                type="text"
                name="name"
                value={record?.name || ''}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-100"
                placeholder="Tên học sinh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Ghi Nhận
              </label>
              <input
                type="text"
                name="record_date"
                value={formatDate(record?.record_date) || ''}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-100"
                placeholder="Ngày ghi nhận"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Phát Hiện
              </label>
              <input
                type="date"
                name="detect_time"
                value={formData.detect_time}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="Chọn ngày phát hiện"
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
              required
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
              disabled={!isChanged || updating}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {updating ? 'Đang cập nhật...' : 'Lưu Hồ Sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailHealthRecordForUpdate;