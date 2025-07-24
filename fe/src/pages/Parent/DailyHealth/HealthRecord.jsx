import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, Calendar, Clock, MapPin, Pill, User, Activity, CheckCircle, XCircle, Shield, Loader2, Heart, X } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getStudentInfo } from '../../../service/childenService';

const HealthRecord = () => {
  const { student_id } = useParams();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'detect_time', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [student, setStudent] = useState(null);
  const recordsPerPage = 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(new Set());
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Chưa xác định';
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

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

      // Fetch health records
      try {
        const response = await axiosClient.get(`/${student_id}/daily-health-record`);
        console.log("Daily health record: ", response.data.data);
        const fetchedRecords = response.data;
        if (!fetchedRecords.error && fetchedRecords.data) {
          setRecords(fetchedRecords.data);
          setFilteredRecords(fetchedRecords.data);
        } else {
          setError(fetchedRecords.message || 'Không thể tải hồ sơ y tế');
        }
      } catch (error) {
        setError('Không thể tải hồ sơ y tế');
        console.error('Error fetching health records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student_id]);

  useEffect(() => {
    let filtered = records.filter((record) => {
      const matchesDate = !dateFilter || 
        formatDateForInput(record.detect_time) === dateFilter ||
        formatDateForInput(record.record_date) === dateFilter;
      return matchesDate;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [dateFilter, records, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleRowExpansion = (recordId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(recordId)) {
      newExpandedRows.delete(recordId);
    } else {
      newExpandedRows.add(recordId);
    }
    setExpandedRows(newExpandedRows);
  };

  const filterTodayRecords = () => {
    setDateFilter(getTodayDate());
  };

  const clearFilters = () => {
    setDateFilter('');
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const getStudentDisplay = (studentId) => {
    return `${String(studentId).padStart(6, '0')}`;
  };

  const getStatusBadge = (record) => {
    if (record.transferred_to) {
      return (
        <span className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 border-red-200 rounded-full text-sm">
          <XCircle className="w-4 h-4" />
          Chuyển viện
        </span>
      );
    } else if (record.on_site_treatment) {
      return (
        <span className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border-amber-200 rounded-full text-sm">
          <Clock className="w-4 h-4" />
          Điều trị tại chỗ
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 border-green-200 rounded-full text-sm">
        <CheckCircle className="w-4 h-4" />
        Bình thường
      </span>
    );
  };

  const todayRecordsCount = records.filter(record => 
    isToday(record.detect_time) || isToday(record.record_date)
  ).length;

  const handleViewDetails = async (record) => {
    setDownloading((prev) => new Set(prev).add(`details_${record.id}`));
    try {
      console.log(`Fetching full record for student_id: ${record.student_id}, record_id: ${record.id}`);
      const response = await axiosClient.get(`/daily-health-record/${record.id}`);
      console.log("FULL RECORD RESPONSE:", response.data);
      const fullRecord = response.data.data;
      if (!fullRecord) {
        throw new Error("Không tìm thấy hồ sơ chi tiết!");
      }
      setSelectedRecord(fullRecord);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching full record:", error.response || error);
      setError(
        error.response?.data?.message ||
          `Không thể tải chi tiết hồ sơ: ${error.message}`
      );
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(`details_${record.id}`);
        return next;
      });
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRecord(null);
  };

  const renderDetailsModal = () => {
    if (!selectedRecord) return null;
    else console.log('Selected record: ', selectedRecord);
    return (
      <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết hồ sơ y tế
            </h3>
            <button
              onClick={closeDetailsModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {downloading.has(`details_${selectedRecord.id}`) ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-gray-600">Đang tải chi tiết...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800 uppercase">
                    Thông tin học sinh
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Mã học sinh: {selectedRecord.student_id} | Họ tên: {selectedRecord.name || 'N/A'}
                  </p>
                </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-lg font-medium text-gray-800 uppercase border-b border-gray-200 pb-2 mb-4">
                            Chi tiết y tế
                            </h4>
                            <div className="space-y-4">
                                <h5 className="text-sm font-bold text-gray-800">I. Thời gian</h5>
                                {[
                                { label: "Ngày phát hiện", value: formatDate(selectedRecord.detect_time) },
                                { label: "Ngày ghi nhận", value: formatDate(selectedRecord?.record_date) },
                                ].map(({ label, value }) => (
                                <div key={label} className="flex items-start">
                                    <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                                    <p className="flex-1 text-sm text-gray-800">{value}</p>
                                </div>
                                ))}
                            </div>
                            <div className="space-y-4 mt-6">
                                <h5 className="text-sm font-bold text-gray-800">II. Chẩn đoán & Điều trị</h5>
                                {[
                                { label: "Chẩn đoán", value: selectedRecord?.diagnosis || 'Chưa có chẩn đoán' },
                                { label: "Xử lý tại chỗ", value: selectedRecord?.on_site_treatment || 'Không có' },
                                ].map(({ label, value }) => (
                                <div key={label} className="flex items-start">
                                    <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                                    <p className="flex-1 text-sm text-gray-800">{value}</p>
                                </div>
                                ))}
                            </div>
                            <div className="mt-6 space-y-4">
                                <h5 className="text-sm font-bold text-gray-800">III. Chuyển viện & Vật tư</h5>
                                {[
                                    { label: "Chuyển đến", value: selectedRecord?.transferred_to || 'Không chuyển viện' },
                                    { label: "Vật tư sử dụng", value: selectedRecord?.items_usage || 'Không sử dụng' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-start">
                                    <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                                    <p className="flex-1 text-sm text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
              </>
            )}
          </div>
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button 
              onClick={() => navigate(`${selectedRecord.id}`)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
            >
              Xem chi tiết
            </button>
            <button
              onClick={closeDetailsModal}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sức khỏe hằng ngày</h1>
              <p className="text-gray-600">Theo dõi tình hình sức khỏe của con em tại trường</p>
              {student && (
                <p className="text-sm font-medium text-gray-700 mt-2">
                  Học sinh: {student.name || getStudentDisplay(student.id)}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="flex space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Tổng hồ sơ: </span>
              <span className="font-medium text-blue-600">{records.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Hôm nay: </span>
              <span className="font-medium text-blue-600">{todayRecordsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc theo ngày</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={filterTodayRecords}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Clock className="w-4 h-4" />
                  Hôm nay
                </button>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('detect_time')}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày Phát Hiện {sortConfig.key === 'detect_time' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('record_date')}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ngày Ghi Nhận {sortConfig.key === 'record_date' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Chẩn Đoán
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-700">Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-900 text-lg font-semibold">Không tìm thấy hồ sơ</p>
                      <p className="text-gray-600 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc liên hệ với nhà trường</p>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {isToday(record.detect_time) && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                          {formatDate(record.detect_time)}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {isToday(record.record_date) && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                          {formatDate(record.record_date)}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-medium">
                        {record.diagnosis || 'Chưa có chẩn đoán'}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(record)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleViewDetails(record)}
                          disabled={loading || downloading.has(`details_${record.id}`)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            loading || downloading.has(`details_${record.id}`)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700'
                          }`}
                          title={
                            downloading.has(`details_${record.id}`)
                              ? 'Đang tải chi tiết...'
                              : 'Xem chi tiết'
                          }
                          aria-label={
                            downloading.has(`details_${record.id}`)
                              ? 'Đang tải chi tiết...'
                              : 'Xem chi tiết'
                          }
                        >
                          {downloading.has(`details_${record.id}`) ? (
                            <Loader2
                              className="animate-spin h-4 w-4 text-gray-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </Loader2>
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredRecords.length)} của {filteredRecords.length} hồ sơ
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
              >
                Trước
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
      {renderDetailsModal()}
    </div>
  );
};

export default HealthRecord;