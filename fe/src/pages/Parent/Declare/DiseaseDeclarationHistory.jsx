import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, Calendar, Clock, Shield, Loader2, XCircle, CheckCircle, AlertCircle, Pill, User, MapPin, Activity, Edit } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getStudentInfo } from '../../../service/childenService';

const DiseaseDeclarationHistory = ({ student_id }) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [diseaseMap, setDiseaseMap] = useState({});
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      // Fetch student data
      try {
        if (!student_id) {
          setError('Không tìm thấy ID học sinh.');
          setLoading(false);
          return;
        }

        const studentData = await getStudentInfo(student_id);
        if (!studentData) {
          setError('Không thể tải thông tin học sinh. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
        setStudent(studentData);
      } catch (error) {
        console.error('Error fetching student:', error);
        setError('Không thể tải thông tin học sinh. Vui lòng thử lại.');
      }

      // Fetch diseases
      try {
        const { data } = await axiosClient.get('/diseases');
        setDiseaseMap(data.data.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {}));
      } catch {
        setError('Không thể tải danh sách bệnh.');
      }

      // Fetch records
      try {
        const { data } = await axiosClient.get(`/disease-record/${student_id}/requests/history`);
        if (!data.error && data.data?.rows) {
          setRecords(data.data.rows);
          setFilteredRecords(data.data.rows);
        } else {
          setError(data.message || 'Không thể tải lịch sử khai báo bệnh.');
        }
      } catch {
        setError('Không thể tải lịch sử khai báo bệnh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student_id]);

  useEffect(() => {
    let filtered = records.filter(r => statusFilter === 'All' || r.pending === statusFilter);
    if (sortConfig.key !== 'created_at' || sortConfig.direction !== 'desc') {
      filtered.sort((a, b) => {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [statusFilter, records, sortConfig]);

  const formatDate = date => date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa xác định';
  const handleSort = key => setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
  }));

  const toggleRowExpansion = id => {
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.has(id) ? newExpandedRows.delete(id) : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  const handleEdit = (recordId) => {
    navigate(`/parent/edit/${student_id}/disease-declare/${recordId}`);
  };

  const getBadge = (type, value) => {
    const config = {
      pending: {
        PENDING: { style: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock className="w-4 h-4" />, label: 'Đang chờ duyệt' },
        DONE: { style: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Đã duyệt' },
        CANCELLED: { style: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-4 h-4" />, label: 'Đã hủy' }
      },
      status: {
        UNDER_TREATMENT: { style: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-4 h-4" />, label: 'Đang điều trị' },
        RECOVERED: { style: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Đã khỏi' }
      }
    };
    const { style, icon, label } = config[type][value] || { style: 'bg-gray-50 text-gray-700 border-gray-200', icon: <AlertCircle className="w-4 h-4" />, label: 'Không xác định' };
    return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${style}`}>{icon}{label}</span>;
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('created_at')}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Ngày Tạo
                  {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                </div>
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2"><Pill className="w-4 h-4" /> Tên Bệnh</div>
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Chẩn Đoán</div>
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Trạng Thái Đơn</div>
              </th>
              <th className="p-4 text-center text-sm font-semibold text-gray-700">Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-gray-600 text-sm mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : currentRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-900 text-lg font-semibold">Không tìm thấy hồ sơ</p>
                </td>
              </tr>
            ) : (
              currentRecords.map(record => (
                <React.Fragment key={record.id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-700">{formatDate(record.created_at)}</td>
                    <td className="p-4 text-sm text-gray-800 font-medium">{diseaseMap[record.disease_id] || 'Không xác định'}</td>
                    <td className="p-4 text-sm text-gray-800 font-medium">{record.diagnosis || 'Chưa có chẩn đoán'}</td>
                    <td className="p-4">{getBadge('pending', record.pending)}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleRowExpansion(record.id)}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-gray-300 rounded-lg hover:bg-blue-50 text-sm"
                        >
                          {expandedRows.has(record.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {expandedRows.has(record.id) ? 'Ẩn' : 'Xem'}
                        </button>
                        <button
                          onClick={() => handleEdit(record.id)}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-gray-300 rounded-lg hover:bg-blue-50 text-sm"
                        >
                          <Edit className="w-4 h-4" /> Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(record.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="p-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-blue-600" />Thông tin cơ bản</h4>
                            <p><span className="font-medium">Họ và tên:</span> {student?.name || 'Không xác định'}</p>
                            <p><span className="font-medium">Ngày phát hiện:</span> {formatDate(record.detect_date)}</p>
                            <p><span className="font-medium">Ngày tạo:</span> {formatDate(record.created_at)}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><Pill className="w-4 h-4 text-green-600" />Thông tin bệnh</h4>
                            <p><span className="font-medium">Tên bệnh:</span> {diseaseMap[record.disease_id] || 'Không xác định'}</p>
                            <p><span className="font-medium">Chẩn đoán:</span> {record.diagnosis || 'Chưa có chẩn đoán'}</p>
                            <p><span className="font-medium">Trạng thái sức khỏe:</span> {getBadge('status', record.status)}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" />Điều trị & Trạng thái đơn</h4>
                            <p><span className="font-medium">Ngày khỏi:</span> {formatDate(record.cure_date)}</p>
                            <p><span className="font-medium">Nơi điều trị:</span> {record.location_cure || 'Không có'}</p>
                            <p><span className="font-medium">Chuyển đến:</span> {record.transferred_to || 'Không chuyển viện'}</p>
                          </div>
                          {record.reason_by_nurse && (
                            <div className="space-y-2">
                              <h4 className="font-semibold flex items-center gap-2 text-red-700">Đơn đã bị hủy: </h4>
                              <p>{record.reason_by_nurse || 'Không có ghi chú'}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
  );
};

export default DiseaseDeclarationHistory;