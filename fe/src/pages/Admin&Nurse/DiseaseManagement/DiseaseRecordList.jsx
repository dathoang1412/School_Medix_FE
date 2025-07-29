import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, User, Calendar, FileText, Activity, Eye, X } from "lucide-react";
import { getUserRole } from "../../../service/authService";

const DiseaseRecordList = ({ records }) => {
  const [expanded, setExpanded] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(new Set());
  const navigate = useNavigate();

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format date and time to DD/MM/YYYY HH:MM
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  // Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Truncate text to 30 characters with "..." if exceeding 25 characters
  const truncateText = (text, maxLength = 30, ellipsisThreshold = 25) => {
    if (!text) return "Chưa có chẩn đoán";
    if (text.length <= ellipsisThreshold) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Toggle row expansion
  const toggleDetails = (index) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  // Open modal with selected record
  const renderModalDetail = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  // Get status badge
  const getStatusBadge = (category) => {
    return category === "Bệnh truyền nhiễm" ? (
      <span className="px-2 py-1 bg-red-50 text-red-800 text-xs font-medium rounded border ed-200">
        Truyền nhiễm
      </span>
    ) : (
      <span className="px-2 py-1 bg-yellow-50 text-yellow-800 text-xs font-medium rounded border border-yellow-200">
        Mãn tính
      </span>
    );
  };

  // Get vaccine badge
  const getVaccineBadge = (vaccineNeed) => {
    return vaccineNeed ? (
      <span className="px-2 py-1 bg-green-50 text-green-800 text-xs font-medium rounded border border-green-200">
        Cần thiết
      </span>
    ) : (
      <span className="px-2 py-1 bg-gray-50 text-gray-800 text-xs font-medium rounded border border-gray-200">
        Không cần
      </span>
    );
  };

  // Get student display name
  const getStudentDisplay = (studentId) => {
    return `${String(studentId).padStart(6, "0")}`;
  };

  // Handle name click to navigate
  const handleNameClick = (studentId) => {
    navigate(`/${getUserRole()}/student-overview/${studentId}`);
  };

  // Render Details Modal with updated styling
  const renderDetailsModal = () => {
    if (!selectedRecord) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết hồ sơ y tế
            </h3>
            <button
              onClick={closeModal}
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
                    Mã học sinh: {selectedRecord.student_id} | Họ tên: {selectedRecord.student_name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 uppercase border-b border-gray-200 pb-2 mb-4">
                      Chi tiết y tế
                    </h4>
                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-gray-800">I. Thông tin cơ bản</h5>
                      {[
                        { label: "Tên bệnh", value: selectedRecord.disease_name || 'Không có thông tin' },
                        { label: "Mô tả bệnh", value: selectedRecord.description || 'Không có mô tả' },
                        { label: "Phân loại", value: selectedRecord.disease_category || 'Chưa phân loại' },
                        { label: "Ngày phát hiện", value: formatDate(selectedRecord.detect_date) },
                        { label: "Ngày ghi nhận", value: formatDate(selectedRecord.created_at) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-start">
                          <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                          <p className="flex-1 text-sm text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 mt-6">
                      <h5 className="text-sm font-bold text-gray-800">II. Chẩn đoán </h5>
                      {[
                        { label: "Chẩn đoán", value: selectedRecord.diagnosis || 'Chưa có chẩn đoán' },
                        // { label: "Yêu cầu vaccine", value: selectedRecord.vaccine_need ? 'Cần thiết' : 'Không cần' },
                        // { label: "Số liều vaccine", value: selectedRecord.dose_quantity || 'Chưa xác định' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-start">
                          <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                          <p className="flex-1 text-sm text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 space-y-4">
                      <h5 className="text-sm font-bold text-gray-800">III. Điều trị & Cập nhật</h5>
                      {[
                        { label: "Ngày điều trị", value: selectedRecord.cure_date ? formatDate(selectedRecord.cure_date) : 'Chưa điều trị' },
                        { label: "Nơi điều trị", value: selectedRecord.location_cure || 'Chưa xác định' },
                        { label: "Ngày tạo", value: formatDateTime(selectedRecord.created_at) },
                        { label: "Cập nhật cuối", value: formatDateTime(selectedRecord.updated_at) },
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
              onClick={closeModal}
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
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider  border-gray-200" style={{ width: '7%' }}>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <User size={14} />
                  <span>Mã HS</span>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider  border-gray-200" style={{ width: '15%' }}>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <User size={14} />
                  <span>Họ Tên</span>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider  border-gray-200" style={{ width: '12%' }}>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar size={14} />
                  <span>Ngày phát hiện</span>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider  border-gray-200" style={{ width: '12%' }}>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <FileText size={14} />
                  <span>Ngày ghi nhận</span>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider  border-gray-200" style={{ width: '13%' }}>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Activity size={14} />
                  <span>Tên Bệnh</span>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider  border-gray-200" style={{ width: '18%' }}>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Activity size={14} />
                  <span>Chẩn Đoán</span>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider  border-gray-200" style={{ width: '11%' }}>
                <div className="whitespace-nowrap">Phân Loại</div>
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ width: '8%' }}>
                <div className="whitespace-nowrap">Chi Tiết</div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <FileText size={40} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Không tìm thấy hồ sơ nào</p>
                  <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc thêm hồ sơ mới</p>
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3  border-gray-100" style={{ width: '10%' }}>
                      <div className="text-sm font-medium text-gray-900 truncate" title={getStudentDisplay(record.student_id)}>
                        {getStudentDisplay(record.student_id)}
                      </div>
                    </td>
                    <td className="px-3 py-3  border-gray-100" style={{ width: '15%' }}>
                      <button
                        onClick={() => handleNameClick(record.student_id)}
                        className="text-sm cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200 truncate w-full text-left"
                        title={record.student_name || 'N/A'}
                      >
                        {record.student_name || 'N/A'}
                      </button>
                    </td>
                    <td className="px-3 py-3  border-gray-100" style={{ width: '12%' }}>
                      <div className="flex items-center">
                        {isToday(record.detect_date) && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        )}
                        <span className="text-sm text-gray-900 truncate" title={formatDate(record.detect_date)}>
                          {formatDate(record.detect_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3  border-gray-100" style={{ width: '12%' }}>
                      <div className="flex items-center">
                        {isToday(record.created_at) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        )}
                        <span className="text-sm text-gray-900 truncate" title={formatDate(record.created_at)}>
                          {formatDate(record.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3  border-gray-100" style={{ width: '18%' }}>
                      <span className="text-sm text-gray-900 truncate block" title={record.disease_name || 'Chưa có thông tin'}>
                        {truncateText(record.disease_name)}
                      </span>
                    </td>
                    <td className="px-3 py-3  border-gray-100" style={{ width: '18%' }}>
                      <span className="text-sm text-gray-900 truncate block" title={record.diagnosis || 'Chưa có chẩn đoán'}>
                        {truncateText(record.diagnosis)}
                      </span>
                    </td>
                    <td className="px-3 py-3  border-gray-100" style={{ width: '10%' }}>
                      <div className="flex justify-start">
                        {getStatusBadge(record.disease_category)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center" style={{ width: '5%' }}>
                      <button
                        onClick={() => renderModalDetail(record)}
                        disabled={downloading.has(`details_${record.id}`)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          downloading.has(`details_${record.id}`)
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
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {renderDetailsModal()}
    </div>
  );
};

export default DiseaseRecordList;