import React, { useState } from 'react';
import axios from 'axios';

const AddDiseaseRecord = ({ studentId }) => {
  const [formData, setFormData] = useState({
    disease_id: '',
    diagnosis: '',
    detect_date: '',
    cure_date: '',
    location_cure: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setError('Vui lòng nhập ID học sinh');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.post(`/api/student/${studentId}/disease-record`, formData);
      if (!response.data.error) {
        setSuccess('Thêm hồ sơ bệnh thành công');
        setFormData({
          disease_id: '',
          diagnosis: '',
          detect_date: '',
          cure_date: '',
          location_cure: ''
        });
      } else {
        setError('Không thể thêm hồ sơ bệnh');
      }
    } catch (err) {
      {err && setError('Lỗi server khi thêm hồ sơ bệnh')};
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã Bệnh</label>
            <input
              type="text"
              name="disease_id"
              value={formData.disease_id}
              onChange={handleInputChange}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chẩn Đoán</label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày Phát Hiện</label>
            <input
              type="date"
              name="detect_date"
              value={formData.detect_date}
              onChange={handleInputChange}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày Điều Trị</label>
            <input
              type="date"
              name="cure_date"
              value={formData.cure_date}
              onChange={handleInputChange}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Nơi Điều Trị</label>
            <input
              type="text"
              name="location_cure"
              value={formData.location_cure}
              onChange={handleInputChange}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Lưu Hồ Sơ
        </button>
      </form>

      {success && <div className="mt-4 text-green-500">{success}</div>}
      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default AddDiseaseRecord;