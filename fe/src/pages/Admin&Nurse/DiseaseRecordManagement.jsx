import React, { useState, useEffect } from 'react';
import DiseaseRecordIdList from './DiseaseRecordIdList';
import AddDiseaseRecord from './AddDiseaseRecord';
import axiosClient from '../../config/axiosClient';

const DiseaseRecordManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get('/disease-records');
        if (response.data.error === false || (response.data.error === undefined && response.data.data)) {
          setRecords(response.data.data || []);
        } else {
          setError('Không thể tải hồ sơ bệnh: ' + (response.data.message || 'Không có thông báo'));
        }
      } catch (err) {
        setError('Lỗi server khi tải hồ sơ bệnh: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);
  const handleTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateFilter(today);
  };

  const clearFilter = () => {
    setSearchTerm('');
    setDateFilter('');
  };

  const filteredRecords = records.filter(record =>
    (searchTerm === '' || record.student_id.toString().includes(searchTerm) ||
     record.disease_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (dateFilter === '' || new Date(record.detect_date).toISOString().split('T')[0] === dateFilter)
  );

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">SỔ Y TẾ HÀNG NGÀY</h1>
      <p className="text-gray-600 mb-4">Quản lý và theo dõi sức khỏe học sinh một cách hiệu quả</p>

      {/* Header Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm theo mã HS, chẩn đoán, điều trị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded p-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded p-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTodayFilter}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Hôm nay
          </button>
          <button
            onClick={clearFilter}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Xóa bộ lọc
          </button>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <span className="text-gray-600">Tổng hồ sơ: {records.length}</span>
          <span className="text-gray-600">Hôm nay: {filteredRecords.filter(r => new Date(r.detect_date).toDateString() === new Date().toDateString()).length}</span>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Thêm Hồ Sơ
          </button>
        </div>
      </div>

      {/* Content Area */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-600">Đang tải...</div>
      ) : showAddForm ? (
        <AddDiseaseRecord onClose={() => setShowAddForm(false)} />
      ) : (
        <DiseaseRecordIdList records={filteredRecords} />
      )}
    </div>
  );
};

export default DiseaseRecordManagement;