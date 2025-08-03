import React, { useState, useEffect } from "react";
import {
  FileText,
  User,
  Activity,
  CheckCircle,
  Eye,
  Trash2,
  XCircle,
  TicketCheck,
  Loader2,
  PenBox,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../../service/authService";
import { useSnackbar } from "notistack";
import Modal from "react-modal";

// Set app element for react-modal (for accessibility)
Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "500px",
    width: "90%",
    borderRadius: "0.5rem",
    border: "none",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "0",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
};

const DrugRequestList = ({
  drugs = [],
  handleAccept,
  handleRefuse,
  handleCancel,
  handleReceive,
  handleDone,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortedDrugs, setSortedDrugs] = useState([]);
  const [doneModalIsOpen, setDoneModalIsOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [drugToDone, setDrugToDone] = useState(null);
  const [drugToCancel, setDrugToCancel] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
  const recordsPerPage = 10;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const userRole = getUserRole();

  useEffect(() => {
    console.log("User Role:", userRole); // Debug vai trò
  }, [userRole]);

  // Sort drugs by create_at in descending order
  useEffect(() => {
    const sorted = [...drugs].sort((a, b) => {
      const dateA = new Date(a.create_at);
      const dateB = new Date(b.create_at);
      return dateB - dateA; // Descending order
    });
    setSortedDrugs(sorted);
  }, [drugs]);

  const truncateText = (text, maxLength = 10, ellipsisThreshold = 10) => {
    if (!text) return "Chưa có chẩn đoán";
    if (text.length <= ellipsisThreshold) return text;
    return text.slice(0, maxLength) + "...";
  };

  const handleView = (drug) => {
    navigate(`/${userRole}/drug-request/${drug.id}`);
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      PROCESSING: "Đang xử lý",
      ACCEPTED: "Đã chấp nhận",
      REFUSED: "Đã từ chối",
      DONE: "Hoàn thành",
      CANCELLED: "Đã hủy",
      RECEIVED: "Đã nhận",
    };
    return statusMap[status] || "Chưa xác định";
  };

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
        {getStatusDisplay(status)}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const openDoneModal = (drugId) => {
    console.log("Opening done modal for drugId:", drugId);
    setDrugToDone(drugId);
    setDoneModalIsOpen(true);
  };

  const closeDoneModal = () => {
    console.log("Closing done modal");
    setDoneModalIsOpen(false);
    setDrugToDone(null);
  };

  const openCancelModal = (drugId) => {
    console.log("Opening cancel modal for drugId:", drugId);
    setDrugToCancel(drugId);
    setCancelModalIsOpen(true);
  };

  const closeCancelModal = () => {
    console.log("Closing cancel modal");
    setCancelModalIsOpen(false);
    setDrugToCancel(null);
  };

  const handleAction = async (action, id, actionName) => {
    if (userRole !== "admin" && userRole !== "nurse") {
      enqueueSnackbar(
        "Chỉ admin hoặc nurse mới có quyền thực hiện thao tác này.",
        {
          variant: "error",
        }
      );
      return;
    }
    if (!id) {
      enqueueSnackbar("Không tìm thấy ID đơn thuốc", { variant: "error" });
      return;
    }

    setLoadingActions((prev) => ({ ...prev, [id]: true }));
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
      setLoadingActions((prev) => ({ ...prev, [id]: false }));
      if (actionName === "Đánh dấu hoàn thành") {
        closeDoneModal();
      } else if (actionName === "Hủy đơn") {
        closeCancelModal();
      }
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedDrugs.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(sortedDrugs.length / recordsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [sortedDrugs, currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Done Confirmation Modal */}
      <Modal
        isOpen={doneModalIsOpen}
        onRequestClose={closeDoneModal}
        style={customStyles}
        contentLabel="Xác nhận hoàn thành đơn thuốc"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Xác nhận hoàn thành đơn thuốc
              </h3>
            </div>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn đánh dấu đơn thuốc này là hoàn thành không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  handleAction(handleDone, drugToDone, "Đánh dấu hoàn thành")
                }
                disabled={loadingActions[drugToDone]}
                className={`px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 ${
                  loadingActions[drugToDone]
                    ? "opacity-75 cursor-not-allowed"
                    : ""
                }`}
              >
                {loadingActions[drugToDone] ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác nhận hoàn thành</span>
                  </>
                )}
              </button>
              <button
                onClick={closeDoneModal}
                className="px-4 py-2 border cursor-pointer border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalIsOpen}
        onRequestClose={closeCancelModal}
        style={customStyles}
        contentLabel="Xác nhận hủy đơn thuốc"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Xác nhận hủy đơn thuốc
              </h3>
            </div>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn hủy đơn thuốc này không? Hành động này không
              thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 border cursor-pointer border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() =>
                  handleAction(handleCancel, drugToCancel, "Hủy đơn")
                }
                disabled={loadingActions[drugToCancel]}
                className={`px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 ${
                  loadingActions[drugToCancel]
                    ? "opacity-75 cursor-not-allowed"
                    : ""
                }`}
              >
                {loadingActions[drugToCancel] ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Xác nhận hủy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
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
          ) : sortedDrugs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy đơn thuốc
              </h3>
              <p className="text-gray-600">
                Hiện tại không có đơn thuốc nào phù hợp với bộ lọc.
              </p>
            </div>
          ) : (
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
                        <Activity size={14} />
                        Chẩn Đoán
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        Ngày Tạo
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
                    <tr
                      key={drug.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{drug.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            userRole &&
                            navigate(
                              `/${userRole}/student-overview/${drug.student_id}`
                            )
                          }
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200 cursor-pointer"
                          disabled={!userRole}
                        >
                          {drug.student_name || "N/A"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {drug.class_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm whitespace-nowrap text-gray-900">
                          {truncateText(drug?.diagnosis)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatDateTime(drug.create_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(drug.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {drug.status === "RECEIVED" &&
                          (userRole === "admin" || userRole === "nurse") && (
                            <button
                              onClick={() => openDoneModal(drug.id)}
                              className="text-blue-600 cursor-pointer hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                              title="Đánh dấu hoàn thành"
                              disabled={loadingActions[drug.id]}
                            >
                              {loadingActions[drug.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle size={18} />
                              )}
                            </button>
                          )}
                        {drug.status === "DONE" && (
                          <div className="flex justify-center">
                            <CheckCircle
                              size={18}
                              className="text-green-600"
                              title="Đã hoàn thành"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="cursor-pointer hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                            onClick={() => handleView(drug)}
                            title={
                              drug.status === "RECEIVED"
                                ? "Chỉnh sửa"
                                : "Xem chi tiết"
                            }
                          >
                            {drug.status === "RECEIVED" ? (
                              <PenBox className="text-green-600" size={18} />
                            ) : (
                              <Eye className="text-blue-600" size={18} />
                            )}
                          </button>
                          {drug.status === "PROCESSING" &&
                            (userRole === "admin" || userRole === "nurse") && (
                              <>
                                <button
                                  className="text-green-600 cursor-pointer hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors duration-200"
                                  onClick={() =>
                                    handleAction(
                                      handleAccept,
                                      drug.id,
                                      "Chấp nhận"
                                    )
                                  }
                                  title="Chấp nhận"
                                  disabled={loadingActions[drug.id]}
                                >
                                  {loadingActions[drug.id] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle size={18} />
                                  )}
                                </button>
                                <button
                                  className="text-red-600 cursor-pointer hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                                  onClick={() =>
                                    handleAction(
                                      handleRefuse,
                                      drug.id,
                                      "Từ chối"
                                    )
                                  }
                                  title="Từ chối"
                                  disabled={loadingActions[drug.id]}
                                >
                                  {loadingActions[drug.id] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 size={18} />
                                  )}
                                </button>
                              </>
                            )}
                          {drug.status === "ACCEPTED" &&
                            (userRole === "admin" || userRole === "nurse") && (
                              <button
                                className="text-purple-600 cursor-pointer hover:text-purple-800 p-1 rounded hover:bg-purple-50 transition-colors duration-200"
                                onClick={() =>
                                  handleAction(
                                    handleReceive,
                                    drug.id,
                                    "Nhận thuốc"
                                  )
                                }
                                title="Nhận thuốc"
                                disabled={loadingActions[drug.id]}
                              >
                                {loadingActions[drug.id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <TicketCheck size={18} />
                                )}
                              </button>
                            )}
                          {![
                            "RECEIVED",
                            "DONE",
                            "CANCELLED",
                            "REFUSED",
                          ].includes(drug.status) &&
                            (userRole === "admin" || userRole === "nurse") && (
                              <button
                                className="text-gray-600 cursor-pointer hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors duration-200"
                                onClick={() => openCancelModal(drug.id)}
                                title="Hủy đơn"
                                disabled={loadingActions[drug.id]}
                              >
                                {loadingActions[drug.id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle size={18} />
                                )}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Hiển thị{" "}
              <span className="font-medium">{indexOfFirstRecord + 1}</span> đến{" "}
              <span className="font-medium">
                {Math.min(indexOfLastRecord, sortedDrugs.length)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-medium">{sortedDrugs.length}</span> đơn
              thuốc
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugRequestList;
