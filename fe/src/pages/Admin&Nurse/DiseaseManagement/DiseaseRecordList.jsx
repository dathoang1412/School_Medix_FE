import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, User, Calendar, FileText, Activity } from "lucide-react";
import { getUserRole } from "../../../service/authService";

const DiseaseRecordList = ({ records }) => {
  const [expanded, setExpanded] = useState(new Set());
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

  // Get status badge
  const getStatusBadge = (category) => {
    return category === "Bệnh truyền nhiễm" ? (
      <span className="px-2 py-1 bg-red-50 text-red-800 text-xs font-medium rounded border border-red-200">
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
    return `HS${String(studentId).padStart(6, "0")}`;
  };

  // Handle name click to navigate
  const handleNameClick = (studentId) => {
    navigate(`/${getUserRole()}/student-overview/${studentId}`);
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[12%]">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  Mã Học Sinh
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  Họ Tên
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Ngày Phát Hiện
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  Ngày Ghi Nhận
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[25%]">
                <div className="flex items-center gap-2">
                  <Activity size={14} />
                  Chẩn Đoán
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[13%]">
                Phân Loại
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-[10%]">
                Chi Tiết
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <FileText size={40} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Không tìm thấy hồ sơ nào</p>
                  <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc thêm hồ sơ mới</p>
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap w-[12%]">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{getStudentDisplay(record.student_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleNameClick(record.student_id)}
                          className="text-sm cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                        >
                          {record.student_name || "N/A"}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                      <div className="flex items-center">
                        {isToday(record.detect_date) && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        )}
                        <span className="text-sm text-gray-900">{formatDate(record.detect_date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                      <div className="flex items-center">
                        {isToday(record.created_at) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        )}
                        <span className="text-sm text-gray-900">{formatDate(record.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-[25%]">
                      <span className="text-sm text-gray-900">{truncateText(record.diagnosis)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-[13%]">{getStatusBadge(record.disease_category)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center w-[10%]">
                      <button
                        onClick={() => toggleDetails(index)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        {expanded.has(index) ? (
                          <>
                            <ChevronUp size={14} />
                            Ẩn
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} />
                            Xem
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expanded.has(index) && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-gray-50"
                      >
                        <td colSpan="7" className="px-6 py-6">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="border-l-4 border-blue-600 pl-4 w-full"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                  Thông tin cơ bản
                                </h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div><span className="font-medium">Mã học sinh:</span> {getStudentDisplay(record.student_id)}</div>
                                  <div><span className="font-medium">Họ tên:</span> {record.name || "N/A"}</div>
                                  <div><span className="font-medium">Ngày phát hiện:</span> {formatDate(record.detect_date)}</div>
                                  <div><span className="font-medium">Ngày ghi nhận:</span> {formatDate(record.created_at)}</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                  Chẩn đoán & Vaccine
                                </h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div><span className="font-medium">Tên bệnh:</span> {record.disease_name || "Không có thông tin"}</div>
                                  <div><span className="font-medium">Mô tả bệnh:</span> {record.description || "Không có mô tả"}</div>
                                  <div><span className="font-medium">Yêu cầu vaccine:</span> {getVaccineBadge(record.vaccine_need)}</div>
                                  <div><span className="font-medium">Số liều vaccine:</span> {record.dose_quantity || "Chưa xác định"}</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                  Điều trị & Cập nhật
                                </h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div><span className="font-medium">Ngày điều trị:</span> {record.cure_date ? formatDate(record.cure_date) : "Chưa điều trị"}</div>
                                  <div><span className="font-medium">Nơi điều trị:</span> {record.location_cure || "Chưa xác định"}</div>
                                  <div><span className="font-medium">Ngày tạo:</span> {formatDateTime(record.created_at)}</div>
                                  <div><span className="font-medium">Cập nhật cuối:</span> {formatDateTime(record.updated_at)}</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiseaseRecordList;