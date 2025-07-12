import React, { useState, useEffect } from "react";
import {
  FileText,
  User,
  Pill,
  Activity,
  CheckCircle,
  Eye,
  Trash2,
  XCircle,
  TicketCheck,
  X,
  Calendar,
  Stethoscope,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../../service/authService";
import { useSnackbar } from "notistack";

const DrugRequestList = ({
  drugs = [],
  handleAccept,
  handleRefuse,
  handleCancel,
  handleReceive,
  handleDone,
}) => {
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // Explicit loading state
  const [error, setError] = useState(null); // Error state for actions
  const recordsPerPage = 10;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Prevent outer page scrolling when modal is open
  useEffect(() => {
    if (selectedDrug) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDrug]);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Open modal
  const handleView = (drug) => {
    setSelectedDrug(drug);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedDrug(null);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      PROCESSING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ACCEPTED: "bg-green-100 text-green-800 border-green-200",
      REFUSED: "bg-red-100 text-red-800 border-red-200",
      DONE: "bg-blue-100 text-blue-800 border-blue-200",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
      RECEIVED: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status || "Chưa xác định"}
      </span>
    );
  };

  // Get student display name
  const getStudentDisplay = (studentId) => {
    return `${String(studentId).padStart(6, "0")}`;
  };

  // Handle actions with loading and error states
  const handleAction = async (action, id, actionName) => {
    setLoading(true);
    setError(null);
    try {
      await action(id);
      enqueueSnackbar(`${actionName} thành công!`, { variant: "success" });
    } catch (err) {
      console.error(`Error during ${actionName}:`, err);
      enqueueSnackbar(`Lỗi khi ${actionName.toLowerCase()}: ${err.message}`, {
        variant: "error",
      });
      setError(`Lỗi khi ${actionName.toLowerCase()}. Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = drugs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(drugs.length / recordsPerPage);

  // Reset page if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [drugs, currentPage, totalPages]);

  // Enhanced Drug request detail component
  const DrugRequestInfo = ({ drug }) => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mã đơn #{drug.id}</h3>
            <p className="text-sm text-gray-500">Chi tiết đơn thuốc</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">Trạng thái:</span> {getStatusBadge(drug.status)}
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Ngày gửi:</span>{" "}
            <span className="font-medium">{formatDate(drug.schedule_send_date)}</span>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-gray-600" />
          <h4 className="text-base font-medium text-gray-900">Thông tin học sinh</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Mã học sinh:</span>
            <p className="font-medium text-gray-900 mt-1">{getStudentDisplay(drug.student_id)}</p>
          </div>
          <div>
            <span className="text-gray-500">Họ tên:</span>
            <p className="font-medium text-gray-900 mt-1">{drug.student_name || "N/A"}</p>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <span className="text-gray-500">Lớp:</span>
            <p className="font-medium text-gray-900 mt-1">{drug.class_name || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Schedule Information */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h4 className="text-base font-medium text-gray-900">Lịch trình</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Ngày hẹn gửi:</span>
            <span className="font-medium text-gray-900">{formatDate(drug.schedule_send_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ngày uống thuốc:</span>
            <span className="font-medium text-gray-900">{formatDate(drug.intake_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ngày nhận thuốc:</span>
            <span className="font-medium text-gray-900">{formatDate(drug.receive_date) || "Chưa nhận"}</span>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-5 h-5 text-gray-600" />
          <h4 className="text-base font-medium text-gray-900">Thông tin y tế</h4>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Chẩn đoán:</span>
            <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
              {drug.diagnosis || "Không có mô tả"}
            </p>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Ghi chú:</span>
            <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
              {drug.note || "Không có ghi chú"}
            </p>
          </div>
          {drug.prescription_img_urls?.length > 0 && (
            <div>
              <span className="text-gray-500 block mb-1">Ảnh đơn thuốc:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {drug.prescription_img_urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={url}
                      alt={`Prescription ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-gray-200 hover:opacity-80 transition-opacity duration-200"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drug List */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-5 h-5 text-gray-600" />
          <h4 className="text-base font-medium text-gray-900">Danh sách thuốc</h4>
        </div>
        {drug.request_items?.length > 0 ? (
          <div className="space-y-4">
            {drug.request_items.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-300">
                    {index + 1}
                  </div>
                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                </div>
                <div className="space-y-2 text-sm pl-8">
                  <div>
                    <span className="text-gray-500">Cách sử dụng:</span>
                    <p className="text-gray-900">{item.dosage_usage}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Thời gian uống:</span>
                    <p className="text-gray-900">
                      {Array.isArray(item.intake_template_time)
                        ? item.intake_template_time.join(", ")
                        : item.intake_template_time || "Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Pill className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Không có thuốc trong đơn.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-gray-500 text-sm mt-2">Đang xử lý...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-8 h-8 mx-auto text-red-500" />
              <p className="text-gray-500 text-sm mt-2">{error}</p>
            </div>
          ) : drugs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn thuốc</h3>
              <p className="text-gray-600">Hiện tại không có đơn thuốc nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <>
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
                          Chẩn Đoán
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
                    {currentRecords.map((drug) => (
                      <tr key={drug.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">#{drug.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{getStudentDisplay(drug.student_id)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/${getUserRole()}/student-overview/${drug.student_id}`)}
                            className="text-sm cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                          >
                            {drug.student_name || "N/A"}
                          </button>
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
                            <button
                              onClick={() => handleAction(handleDone, drug.id, "Đánh dấu hoàn thành")}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                              title="Đánh dấu hoàn thành"
                            >
                              <CheckCircle size={18} />
                            </button>
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
                              onClick={() => handleView(drug)}
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            {drug.status === "PROCESSING" && (
                              <>
                                <button
                                  className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors duration-200"
                                  onClick={() => handleAction(handleAccept, drug.id, "Chấp nhận")}
                                  title="Chấp nhận"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                                  onClick={() => handleAction(handleRefuse, drug.id, "Từ chối")}
                                  title="Từ chối"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                            {drug.status === "ACCEPTED" && (
                              <button
                                className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50 transition-colors duration-200"
                                onClick={() => handleAction(handleReceive, drug.id, "Nhận thuốc")}
                                title="Nhận thuốc"
                              >
                                <TicketCheck size={18} />
                              </button>
                            )}
                            {!["RECEIVED", "DONE", "CANCELLED", "REFUSED"].includes(drug.status) && (
                              <button
                                className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors duration-200"
                                onClick={() => handleAction(handleCancel, drug.id, "Hủy đơn")}
                                title="Hủy đơn"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Modal */}
              {selectedDrug && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Chi tiết đơn thuốc</h2>
                        <p className="text-gray-500 text-sm mt-1">Thông tin chi tiết về đơn thuốc #{selectedDrug.id}</p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                      <DrugRequestInfo drug={selectedDrug} />
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                      <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-sm"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
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
                            className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
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
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrugRequestList;