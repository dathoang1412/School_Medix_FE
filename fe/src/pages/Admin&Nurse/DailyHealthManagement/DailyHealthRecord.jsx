import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp, Search, FileText, CheckCircle, Calendar, Clock, User, Activity, X } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getUserRole } from '../../../service/authService';
import { fetchClass } from '../../../utils/classUtils';
import { enqueueSnackbar } from 'notistack';

const DailyHealthRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.success || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'record_date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(new Set());

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/daily-health-record');
      console.log("Daily health record: ", res.data.data);
      setRecords(res.data.data);
      setFilteredRecords(res.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể tải hồ sơ y tế');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetchClass();
        setClasses(res);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError('Không thể tải danh sách lớp');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = records.filter((record) => {
      const matchesSearch =
        String(record.student_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.on_site_treatment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.transferred_to || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !dateFilter ||
        formatDateForInput(record.record_date) === dateFilter;

      const matchesClass = !classFilter || record.class_name === classFilter;

      return matchesSearch && matchesDate && matchesClass;
    });

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFilter, classFilter, records]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredRecords].sort((a, b) => {
      if (key === 'student_id') {
        return direction === 'asc' ? a.student_id - b.student_id : b.student_id - a.student_id;
      } else if (key === 'student_name') {
        const nameA = (a.student_name || '').toLowerCase();
        const nameB = (b.student_name || '').toLowerCase();
        return direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (key === 'record_date') {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (key === 'class_name') {
        const classA = (a.class_name || '').toLowerCase();
        const classB = (b.class_name || '').toLowerCase();
        return direction === 'asc' ? classA.localeCompare(classB) : classB.localeCompare(classA);
      }
      return 0;
    });
    setFilteredRecords(sorted);
  };

  // Toggle row expansion
  const toggleRowExpansion = (recordId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(recordId)) {
      newExpandedRows.delete(recordId);
    } else {
      newExpandedRows.add(recordId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Set filter to today's records
  const filterTodayRecords = () => {
    setDateFilter(getTodayDate());
    setSearchTerm('');
    setClassFilter('');
  };

  // Clear all filters
  const clearFilters = () => {
    setDateFilter('');
    setSearchTerm('');
    setClassFilter('');
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Get student display name
  const getStudentDisplay = (studentId) => {
    return `${String(studentId).padStart(6, '0')}`;
  };

  // Get status badge
  const getStatusBadge = (record, forTransfer = false) => {
    if (forTransfer) {
      if (record.transferred_to && record.transferred_to.trim() !== '') {
        return (
          <span className="px-2 py-1 bg-red-50 text-red-800 text-xs font-medium rounded border border-red-200">
            Chuyển viện
          </span>
        );
      }
      return (
        <span className="px-2 py-1 bg-yellow-50 text-yellow-800 text-xs font-medium rounded border border-yellow-200">
          Điều trị tại chỗ
        </span>
      );
    } else {
      if (record.status === 'SERIOUS') {
        return (
          <span className="px-2 py-1 bg-red-50 text-red-800 text-xs font-medium rounded border border-red-200">
            Nghiêm trọng
          </span>
        );
      } else if (record.status === 'MILD') {
        return (
          <span className="px-2 py-1 bg-yellow-50 text-yellow-800 text-xs font-medium rounded border border-yellow-200">
            Nhẹ
          </span>
        );
      }
      return (
        <span className="px-2 py-1 bg-green-50 text-green-800 text-xs font-medium rounded border border-green-200">
          Bình thường
        </span>
      );
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success){
      enqueueSnackbar(success, {variant: "success"})
    }
  }, [success]);

  // Get today's records count
  const todayRecordsCount = records.filter(record =>
    isToday(record.record_date)
  ).length;

  const handleViewDetails = async (record) => {
    setDownloading((prev) => new Set(prev).add(`details_${record.id}`));
    try {
      console.log(record);
      console.log(`Fetching full record for student_id: ${record.student_id}`);
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

  const truncateText = (text, maxLength = 30, ellipsisThreshold = 25) => {
    if (!text) return "Chưa có chẩn đoán";
    if (text.length <= ellipsisThreshold) return text;
    return text.slice(0, maxLength) + "...";
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
              className="text-gray-500 cursor-pointer hover:text-gray-700 p-1 rounded-full transition-colors"
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
                    Mã học sinh: {selectedRecord.student_id} | Họ tên: {selectedRecord.student_name || 'N/A'} | Lớp: {selectedRecord.class_name || 'N/A'}
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
                          <p className="flex-1 text-sm text-gray-800">
                            <div dangerouslySetInnerHTML={{
                              __html: value.replace(/\n/g, '<br/>')
                            }} />
                          </p>
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
              className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
            >
              Xem chi tiết & Chỉnh sửa
            </button>
            <button
              onClick={closeDetailsModal}
              className="px-4 py-2 bg-white cursor-pointer border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 py-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Quản lý y tế hằng ngày</h1>
              <p className="text-gray-600">Hệ thống quản lý và theo dõi hồ sơ sức khỏe học sinh</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{records.length}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Tổng hồ sơ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{todayRecordsCount}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Hôm nay</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã học sinh, họ tên, chẩn đoán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* Class Filter */}
            <div className="relative">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Tất cả lớp</option>
                {classes.map((cls) => (
                  <option key={cls.class_name} value={cls.class_name}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
              <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={filterTodayRecords}
                className="flex cursor-pointer items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                <Clock size={16} />
                Hôm nay
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={() => navigate('/admin/add-record')}
                className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Thêm Hồ Sơ
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors border-gray-200" style={{ width: '10%' }} onClick={() => handleSort('student_id')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <User size={14} />
                      <span>Mã HS</span>
                      {sortConfig.key === 'student_id' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors border-gray-200" style={{ width: '15%' }} onClick={() => handleSort('student_name')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <User size={14} />
                      <span>Họ Tên</span>
                      {sortConfig.key === 'student_name' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors border-gray-200" style={{ width: '12%' }} onClick={() => handleSort('class_name')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <User size={14} />
                      <span>Lớp</span>
                      {sortConfig.key === 'class_name' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors border-gray-200" style={{ width: '12%' }} onClick={() => handleSort('record_date')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>Ngày ghi nhận</span>
                      {sortConfig.key === 'record_date' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-gray-200" style={{ width: '20%' }}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Activity size={14} />
                      <span>Chẩn Đoán</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-gray-200" style={{ width: '11%' }}>
                    <div className="whitespace-nowrap">Tình Trạng</div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-gray-200" style={{ width: '12%' }}>
                    <div className="whitespace-nowrap">Chuyển Đến</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ width: '8%' }}>
                    <div className="whitespace-nowrap">Chi Tiết</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <FileText size={40} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">Không tìm thấy hồ sơ nào</p>
                      <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc thêm hồ sơ mới</p>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 border-gray-100" style={{ width: '10%' }}>
                        <div className="text-sm font-medium text-gray-900 truncate" title={getStudentDisplay(record.student_id)}>
                          {getStudentDisplay(record.student_id)}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-gray-100" style={{ width: '15%' }}>
                        <button
                          onClick={() => navigate(`/${getUserRole()}/student-overview/${record.student_id}`)}
                          className="text-sm cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200 truncate w-full text-left"
                          title={record.student_name || 'N/A'}
                        >
                          {record.student_name || 'N/A'}
                        </button>
                      </td>
                      <td className="px-3 py-3 border-gray-100" style={{ width: '12%' }}>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 truncate" title={record.class_name || 'N/A'}>
                            {record.class_name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 border-gray-100" style={{ width: '12%' }}>
                        <div className="flex items-center">
                          {isToday(record.record_date) && (
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                          )}
                          <span className="text-sm text-gray-900 truncate" title={formatDate(record.record_date)}>
                            {formatDate(record.record_date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ width: '20%' }}>
                        <span className="text-sm text-gray-900">
                          {truncateText(record.diagnosis)}
                        </span>
                      </td>
                      <td className="px-3 py-3 border-gray-100" style={{ width: '11%' }}>
                        <div className="flex justify-start">
                          {getStatusBadge(record)}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-gray-100" style={{ width: '12%' }}>
                        <div className="flex justify-start">
                          {getStatusBadge(record, true)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center" style={{ width: '10%' }}>
                        <button
                          onClick={() => handleViewDetails(record)}
                          disabled={loading || downloading.has(`details_${record.id}`)}
                          className={`inline-flex cursor-pointer items-center justify-center w-8 h-8 rounded-full transition-colors ${
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
                            <svg
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
                            </svg>
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
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{indexOfFirstRecord + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastRecord, filteredRecords.length)}</span> trong tổng số <span className="font-medium">{filteredRecords.length}</span> hồ sơ
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
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
                      className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
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

export default DailyHealthRecord;