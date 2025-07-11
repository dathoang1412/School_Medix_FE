import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, User, Pill, Activity, CheckCircle, Eye, EyeOff, Trash2, XCircle, TicketCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../../service/authService";

const DrugRequestList = ({ drugs, handleAccept, handleRefuse, handleCancel, handleReceive, handleDone }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const navigate = useNavigate();

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Toggle row expansion
  const handleView = (drugId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(drugId)) {
      newExpandedRows.delete(drugId);
    } else {
      newExpandedRows.add(drugId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      PROCESSING: "bg-yellow-50 text-yellow-800 border-yellow-200",
      ACCEPTED: "bg-green-50 text-green-800 border-green-200",
      REFUSED: "bg-red-50 text-red-800 border-red-200",
      DONE: "bg-blue-50 text-blue-800 border-blue-200",
      CANCELLED: "bg-gray-50 text-gray-800 border-gray-200",
      RECEIVED: "bg-purple-50 text-purple-800 border-purple-200",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[status] || "bg-gray-50 text-gray-800 border-gray-200"}`}>
        {status || "Chưa xác định"}
      </span>
    );
  };

  // Get student display name
  const getStudentDisplay = (studentId) => {
    return `HS${String(studentId).padStart(6, "0")}`;
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = drugs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(drugs.length / recordsPerPage);

  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  Mã Đơn
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  Mã Học Sinh
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  Họ Tên
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  Lớp
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Pill size={14} />
                  Tên Thuốc
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Activity size={14} />
                  Mô Tả Bệnh
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Hoàn Thành
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <FileText size={40} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">
                    {drugs.length === 0 ? "Không có dữ liệu đơn thuốc." : "Không tìm thấy đơn thuốc phù hợp."}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc thêm đơn thuốc mới</p>
                </td>
              </tr>
            ) : (
              currentRecords.map((drug) => (
                <React.Fragment key={drug.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">#{drug.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{getStudentDisplay(drug.student_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => navigate(`/${getUserRole()}/student-overview/${drug.student_id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                        >
                          {drug.student_name || "N/A"}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{drug.class_name || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{drug?.request_items?.[0]?.name || "Không có dữ liệu"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{drug?.diagnosis || "Không có mô tả"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(drug.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {drug.status === "RECEIVED" && (
                        <input
                          type="checkbox"
                          onChange={() => handleDone(drug.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                          title="Đánh dấu hoàn thành"
                        />
                      )}
                      {drug.status === "DONE" && (
                        <div className="flex justify-center">
                          <CheckCircle size={18} className="text-green-600" title="Đã hoàn thành" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => handleView(drug.id)}
                          title={expandedRows.has(drug.id) ? "Ẩn chi tiết" : "Xem chi tiết"}
                        >
                          {expandedRows.has(drug.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {drug.status === "PROCESSING" && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors duration-200"
                              onClick={() => handleAccept(drug.id)}
                              title="Chấp nhận"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                              onClick={() => handleRefuse(drug.id)}
                              title="Từ chối"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {drug.status === "ACCEPTED" && (
                          <button
                            className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50 transition-colors duration-200"
                            onClick={() => handleReceive(drug.id)}
                            title="Nhận thuốc"
                          >
                            <TicketCheck size={18} />
                          </button>
                        )}
                        {![ "RECEIVED", "DONE", "CANCELLED", "REFUSED"].includes(drug.status) && (
                          <button
                            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => handleCancel(drug.id)}
                            title="Hủy đơn"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedRows.has(drug.id) && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-gray-50"
                      >
                        <td colSpan="9" className="px-6 py-6">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="border-l-4 border-blue-600 pl-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                  Thông tin cơ bản
                                </h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div><span className="font-medium">Mã đơn:</span> #{drug.id}</div>
                                  <div><span className="font-medium">Mã học sinh:</span> {getStudentDisplay(drug.student_id)}</div>
                                  <div><span className="font-medium">Họ tên:</span> {drug.name || "N/A"}</div>
                                  <div><span className="font-medium">Lớp:</span> {drug.class_name || "N/A"}</div>
                                  <div><span className="font-medium">Ngày tạo:</span> {formatDate(drug.created_at)}</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                  Chi tiết đơn thuốc
                                </h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div><span className="font-medium">Mô tả bệnh:</span> {drug.diagnosis || "Không có mô tả"}</div>
                                  <div><span className="font-medium">Trạng thái:</span> {getStatusBadge(drug.status)}</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                  Danh sách thuốc
                                </h4>
                                {drug.request_items?.length > 0 ? (
                                  <ul className="space-y-2 text-sm text-gray-600">
                                    {drug.request_items.map((item, index) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span>{item.name} - Số lượng: {item.dosage_usage}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-sm text-gray-600">Không có thuốc trong đơn.</div>
                                )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{indexOfFirstRecord + 1}</span> đến{" "}
            <span className="font-medium">{Math.min(indexOfLastRecord, drugs.length)}</span> trong tổng số{" "}
            <span className="font-medium">{drugs.length}</span> đơn thuốc
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
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
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
  );
};

export default DrugRequestList;