import React, { useState, useEffect } from 'react';
import { Shield, FileText, Loader2, XCircle, Calendar, Pill, Activity, User } from 'lucide-react';
import DiseaseRecordRow from './DiseaseRecordRow';
import axiosClient from '../../../config/axiosClient';

const DeclarationManagement = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [diseaseMap, setDiseaseMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/disease-record/requestsHistory');
      console.log('Fetched records:', data); // Log for debugging
      if (!data.error && data.data?.rows) {
        setRecords(data.data.rows);
        setFilteredRecords(data.data.rows);
      } else {
        setError(data.message || 'Không thể tải danh sách khai báo bệnh');
      }
    } catch (err) {
      console.error('Fetch records error:', err.response?.data || err.message);
      setError('Không thể tải danh sách khai báo bệnh: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchDiseases = async () => {
    try {
      const { data } = await axiosClient.get('/diseases');
      setDiseaseMap(data.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {}));
    } catch (err) {
      console.error('Fetch diseases error:', err.response?.data || err.message);
      setError('Không thể tải danh sách bệnh: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchDiseases();
    fetchRecords();
  }, []);

  useEffect(() => {
    const filtered = records.filter(r => statusFilter === 'All' || r.pending === statusFilter);
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [statusFilter, records]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-8 h-8 text-blue-600 p-2 bg-blue-50 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý khai báo bệnh</h1>
              <p className="text-gray-600">Xem và duyệt các đơn khai báo bệnh của học sinh</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm">
              Tổng hồ sơ: <span className="font-medium text-blue-600">{records.length}</span>
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ duyệt</option>
              <option value="DONE">Đã duyệt</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày Tạo</div>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> Mã Học Sinh</div>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2"><Pill className="w-4 h-4" /> Tên Bệnh</div>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Tình trạng</div>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Trạng Thái Đơn</div>
                </th>
                <th className="p-4 text-center text-sm font-semibold text-gray-700">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 text-sm mt-2">Đang tải...</p>
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-900 text-lg font-semibold">Không tìm thấy hồ sơ</p>
                  </td>
                </tr>
              ) : (
                currentRecords.map(record => (
                  <DiseaseRecordRow
                    key={record.id}
                    record={record}
                    diseaseMap={diseaseMap}
                    onUpdate={fetchRecords} // Pass fetchRecords directly
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-4 text-sm">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeclarationManagement;