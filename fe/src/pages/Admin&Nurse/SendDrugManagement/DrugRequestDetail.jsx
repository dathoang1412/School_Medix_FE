import React, { useState, useEffect } from "react";
import {
  FileText,
  User,
  Pill,
  Calendar,
  Stethoscope,
  ArrowLeft,
  Loader2,
  X,
  CheckSquare,
  Eye,
  RefreshCw,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getUserRole } from "../../../service/authService";

const DrugRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const userRole = getUserRole();
  const [drug, setDrug] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [commentModal, setCommentModal] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const fetchDrugRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get(`/send-drug-request/${id}`);
      setDrug(res.data.data);
      await fetchSchedules(res.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải thông tin đơn thuốc."
      );
      enqueueSnackbar(
        error.response?.data?.message || "Không thể tải thông tin đơn thuốc.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const fetchSchedules = async (drugData) => {
    try {
      const dates = [];
      const { start_intake_date, end_intake_date } = drugData;
      let currentDate = new Date(start_intake_date);
      const endDate = new Date(end_intake_date);
      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const schedulePromises = dates.map((date) =>
        axiosClient.get(`/medication-schedule-by-day?date=${date}`)
      );
      const responses = await Promise.all(schedulePromises);
      const scheduleData = {};
      responses.forEach((res, index) => {
        const filteredData = {
          MORNING: (res.data.data?.MORNING || []).filter(
            (group) => group.student_id === drugData.student_id
          ),
          MIDDAY: (res.data.data?.MIDDAY || []).filter(
            (group) => group.student_id === drugData.student_id
          ),
          AFTERNOON: (res.data.data?.AFTERNOON || []).filter(
            (group) => group.student_id === drugData.student_id
          ),
        };
        if (
          filteredData.MORNING.length > 0 ||
          filteredData.MIDDAY.length > 0 ||
          filteredData.AFTERNOON.length > 0
        ) {
          scheduleData[dates[index]] = filteredData;
        }
      });
      setSchedules(scheduleData);
    } catch (error) {
      enqueueSnackbar("Không thể tải lịch uống thuốc.", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchDrugRequest();
  }, [id, enqueueSnackbar]);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    setCommentModal(null);
    await fetchDrugRequest();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleString("vi-VN", {
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
      PROCESSING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-yellow-800",
      REFUSED: "bg-red-100 text-red-800",
      DONE: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      RECEIVED: "bg-purple-100 text-purple-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {getStatusDisplay(status)}
      </span>
    );
  };

  const getStudentDisplay = (studentId) => String(studentId).padStart(6, "0");

  const calculateDays = () => {
    if (!drug || !drug.start_intake_date || !drug.end_intake_date)
      return { total: 0, taken: 0, remaining: 0 };
    const start = new Date(drug.start_intake_date);
    const end = new Date(drug.end_intake_date);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    let takenDays = 0;
    Object.entries(schedules).forEach(([date, day]) => {
      if (date <= today) {
        const allTaken = ["MORNING", "MIDDAY", "AFTERNOON"].every(
          (time) =>
            !day[time]?.length || day[time].every((group) => group.is_taken)
        );
        if (allTaken) takenDays++;
      }
    });
    return {
      total: totalDays,
      taken: takenDays,
      remaining: Math.max(totalDays - takenDays, 0),
    };
  };

  const handleCheckboxChange = async (time, date, groupIndex, isTaken) => {
    if (userRole !== "admin" && userRole !== "nurse") {
      enqueueSnackbar(
        "Chỉ admin hoặc nurse mới có quyền cập nhật trạng thái uống thuốc.",
        { variant: "error" }
      );
      return;
    }
    if (date !== today) {
      enqueueSnackbar("Chỉ có thể cập nhật trạng thái cho ngày hiện tại.", {
        variant: "warning",
      });
      return;
    }
    const group = schedules[date][time][groupIndex];
    if (group.request_status === "DONE") {
      enqueueSnackbar("Không thể cập nhật trạng thái cho đơn đã hoàn thành.", {
        variant: "warning",
      });
      return;
    }
    if (isTaken === group.is_taken) {
      enqueueSnackbar(
        `Buổi này đã được ${isTaken ? "đánh dấu" : "bỏ đánh dấu"}.`,
        { variant: "warning" }
      );
      return;
    }

    if (isTaken) {
      setCommentModal({ time, date, groupIndex, group });
    } else {
      setActionLoading((prev) => ({
        ...prev,
        [date + time + groupIndex]: true,
      }));
      try {
        const medicationIds = group.medications.map(
          (med) => med.medication_schedule_id
        );
        const promises = medicationIds.map((id) =>
          axiosClient.patch(`/medication-schedule/${id}/untick`, {})
        );
        const responses = await Promise.all(promises);

        if (responses.every((res) => res.status === 200)) {
          setSchedules((prev) => {
            const updated = { ...prev };
            updated[date][time][groupIndex] = {
              ...group,
              is_taken: false,
              note: "",
            };
            return updated;
          });
          enqueueSnackbar("Bỏ đánh dấu uống thuốc thành công!", {
            variant: "success",
          });
        } else {
          throw new Error("Yêu cầu không hợp lệ");
        }
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || "Lỗi khi cập nhật trạng thái.",
          { variant: "error" }
        );
      } finally {
        setActionLoading((prev) => ({
          ...prev,
          [date + time + groupIndex]: false,
        }));
      }
    }
  };

  const handleCommentSubmit = async (
    time,
    date,
    groupIndex,
    group,
    comment
  ) => {
    if (group.request_status === "DONE") {
      enqueueSnackbar("Không thể cập nhật trạng thái cho đơn đã hoàn thành.", {
        variant: "warning",
      });
      return;
    }
    setActionLoading((prev) => ({ ...prev, [date + time + groupIndex]: true }));
    try {
      const medicationIds = group.medications.map(
        (med) => med.medication_schedule_id
      );
      const promises = medicationIds.map((id) =>
        axiosClient.patch(`/medication-schedule/${id}/tick`, {
          intake_time: new Date().toISOString(),
          note: comment || "",
        })
      );
      const responses = await Promise.all(promises);

      if (responses.every((res) => res.status === 200)) {
        setSchedules((prev) => {
          const updated = { ...prev };
          updated[date][time][groupIndex] = {
            ...group,
            is_taken: true,
            note: comment || "",
          };
          return updated;
        });
        enqueueSnackbar("Đánh dấu uống thuốc thành công!", {
          variant: "success",
        });
      } else {
        throw new Error("Yêu cầu không hợp lệ");
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái.",
        { variant: "error" }
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [date + time + groupIndex]: false,
      }));
      setCommentModal(null);
    }
  };

  const handleViewComment = (time, date, groupIndex, note) => {
    setCommentModal({ time, date, groupIndex, note, isViewOnly: true });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-600 ml-2">Đang tải...</p>
      </div>
    );

  if (error || !drug)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-gray-600 mt-2">
            {error || "Không tìm thấy đơn thuốc."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 cursor-pointer px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Quay lại
          </button>
        </div>
      </div>
    );

  const daysInfo = calculateDays();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
              >
                <ArrowLeft size={16} /> Quay lại
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshLoading}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 ${
                  refreshLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {refreshLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Làm mới
              </button>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Đơn thuốc #{drug.id}
            </h1>
          </div>

          {(drug.status === "RECEIVED" || drug.status === "DONE") && (
            <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Lịch uống thuốc
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                Tổng: {daysInfo.total} ngày, Đã uống: {daysInfo.taken}, Còn lại:{" "}
                {daysInfo.remaining}
              </p>
              {Object.keys(schedules).length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500">
                  Không có lịch uống thuốc.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="p-2 sm:p-3 text-left font-medium">
                          Buổi
                        </th>
                        {Object.keys(schedules).map((date) => (
                          <th
                            key={date}
                            className={`p-2 sm:p-3 text-left font-medium ${
                              date === today
                                ? "bg-blue-50 font-semibold"
                                : date > today
                                ? "opacity-50"
                                : ""
                            }`}
                          >
                            {formatDate(date)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {["MORNING", "MIDDAY", "AFTERNOON"].map((time) => (
                        <tr key={time} className="border-b border-gray-200">
                          <td className="p-2 sm:p-3 text-gray-700">
                            {time === "MORNING"
                              ? "Sáng"
                              : time === "MIDDAY"
                              ? "Trưa"
                              : "Chiều"}
                          </td>
                          {Object.entries(schedules).map(([date, groups]) => (
                            <td
                              key={date + time}
                              className={`p-2 sm:p-3 ${
                                date > today ? "opacity-50" : ""
                              }`}
                            >
                              {groups[time]?.length > 0 &&
                                groups[time].map((group, groupIndex) => (
                                  <div
                                    key={group.request_id}
                                    className="flex items-center gap-2"
                                  >
                                    { (
                                      <button
                                        onClick={() =>
                                          setSelectedGroup({
                                            date,
                                            time,
                                            groupIndex,
                                            medications: group.medications,
                                            note: group.note,
                                            intake_time: group.intake_time,
                                            is_taken: group.is_taken,
                                          })
                                        }
                                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                                      >
                                        <Eye size={14} />
                                      </button>
                                    )}
                                    {date > today ? (
                                      <Clock
                                        size={14}
                                        className="text-gray-400"
                                      />
                                    ) : group.request_status === "DONE" ? (
                                      <div className="flex items-center gap-2">
                                        {group.is_taken ? (
                                          <CheckSquare
                                            size={14}
                                            className="text-green-600"
                                          />
                                        ) : (
                                          <X
                                            size={14}
                                            className="text-red-600"
                                          />
                                        )}
                                        {group.note && (
                                          <button
                                            onClick={() =>
                                              handleViewComment(
                                                time,
                                                date,
                                                groupIndex,
                                                group.note
                                              )
                                            }
                                            className="text-gray-600 cursor-pointer hover:text-gray-800"
                                          >
                                            <MessageSquare size={14} />
                                          </button>
                                        )}
                                      </div>
                                    ) : date === today ? (
                                      userRole === "parent" ? (
                                        <div className="flex items-center gap-2">
                                          {group.is_taken ? (
                                            <CheckSquare
                                              size={14}
                                              className="text-green-600"
                                            />
                                          ) : (
                                            <X
                                              size={14}
                                              className="text-red-600"
                                            />
                                          )}
                                          {group.note && (
                                            <button
                                              onClick={() =>
                                                handleViewComment(
                                                  time,
                                                  date,
                                                  groupIndex,
                                                  group.note
                                                )
                                              }
                                              className="text-gray-600 cursor-pointer hover:text-gray-800"
                                            >
                                              <MessageSquare size={14} />
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={group.is_taken}
                                            onChange={(e) =>
                                              handleCheckboxChange(
                                                time,
                                                date,
                                                groupIndex,
                                                e.target.checked
                                              )
                                            }
                                            disabled={
                                              actionLoading[
                                                date + time + groupIndex
                                              ] ||
                                              !(
                                                userRole === "admin" ||
                                                userRole === "nurse"
                                              )
                                            }
                                            className={`h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${
                                              date > today
                                                ? "cursor-not-allowed"
                                                : "cursor-pointer"
                                            }`}
                                          />
                                          {actionLoading[
                                            date + time + groupIndex
                                          ] && (
                                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                          )}
                                          {group.note && (
                                            <button
                                              onClick={() =>
                                                handleViewComment(
                                                  time,
                                                  date,
                                                  groupIndex,
                                                  group.note
                                                )
                                              }
                                              className="text-gray-600 cursor-pointer hover:text-gray-800"
                                            >
                                              <MessageSquare size={14} />
                                            </button>
                                          )}
                                        </div>
                                      )
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        {group.is_taken ? (
                                          <CheckSquare
                                            size={14}
                                            className="text-green-600"
                                          />
                                        ) : (
                                          <X
                                            size={14}
                                            className="text-red-600"
                                          />
                                        )}
                                        {group.note && (
                                          <button
                                            onClick={() =>
                                              handleViewComment(
                                                time,
                                                date,
                                                groupIndex,
                                                group.note
                                              )
                                            }
                                            className="text-gray-600 cursor-pointer hover:text-gray-800"
                                          >
                                            <MessageSquare size={14} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(selectedGroup || commentModal) && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
                  <div>
                    {selectedGroup ? (
                      <>
                        <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                          Danh sách thuốc
                        </h2>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedGroup.date)} -{" "}
                          {selectedGroup.time === "MORNING"
                            ? "Sáng"
                            : selectedGroup.time === "MIDDAY"
                            ? "Trưa"
                            : "Chiều"}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                          {commentModal.isViewOnly
                            ? "Xem ghi chú"
                            : "Thêm ghi chú"}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {formatDate(commentModal.date)} -{" "}
                          {commentModal.time === "MORNING"
                            ? "Sáng"
                            : commentModal.time === "MIDDAY"
                            ? "Trưa"
                            : "Chiều"}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedGroup(null);
                      setCommentModal(null);
                    }}
                    className="text-gray-400 cursor-pointer hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-3 sm:p-4 max-h-[60vh] overflow-y-auto">
                  {selectedGroup ? (
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        {selectedGroup.medications.map((med) => (
                          <li
                            key={med.medication_schedule_id}
                            className="text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded border border-gray-200"
                          >
                            <span className="font-medium text-gray-900">
                              {med.item_name}
                            </span>
                            <span className="text-gray-600 ml-1">
                              {med.dosage_usage}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {selectedGroup.is_taken && (
                        <div className="space-y-2">
                          <div>
                            <span className="text-gray-500 block mb-1">
                              Ghi chú:
                            </span>
                            <p className="text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                              {selectedGroup.note || "Không có ghi chú"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">
                              Thời gian uống:
                            </span>
                            <p className="text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                              {formatTimestamp(selectedGroup.intake_time)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : commentModal.isViewOnly ? (
                    <p className="text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                      {commentModal.note || "Không có ghi chú"}
                    </p>
                  ) : (
                    <div>
                      <textarea
                        placeholder="Nhập ghi chú..."
                        defaultValue=""
                        onChange={(e) => (commentModal.note = e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedGroup(null);
                      setCommentModal(null);
                    }}
                    className="px-3 cursor-pointer py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm"
                  >
                    {commentModal && !commentModal.isViewOnly ? "Hủy" : "Đóng"}
                  </button>
                  {commentModal && !commentModal.isViewOnly && (
                    <button
                      onClick={() =>
                        handleCommentSubmit(
                          commentModal.time,
                          commentModal.date,
                          commentModal.groupIndex,
                          commentModal.group,
                          commentModal.note || ""
                        )
                      }
                      className="px-3 cursor-pointer py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
                    >
                      Gửi
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            <div className="border-b border-gray-200 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Mã đơn #{drug.id}
                </h2>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Trạng thái: {getStatusBadge(drug.status)}</span>
                <span>
                  Ngày gửi:{" "}
                  <span className="font-medium">
                    {formatDate(drug.schedule_send_date)}
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <User className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Thông tin học sinh
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500">Mã học sinh:</span>
                  <p className="font-medium">
                    {getStudentDisplay(drug.student_id)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Họ tên:</span>
                  <p className="font-medium">{drug.student_name || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Lớp:</span>
                  <p className="font-medium">{drug.class_name || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Lịch trình
                </h2>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày hẹn gửi:</span>
                  <span className="font-medium">
                    {formatDate(drug.schedule_send_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bắt đầu uống thuốc:</span>
                  <span className="font-medium">
                    {formatDate(drug.start_intake_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kết thúc uống thuốc:</span>
                  <span className="font-medium">
                    {formatDate(drug.end_intake_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày nhận thuốc:</span>
                  <span className="font-medium">
                    {formatDate(drug.receive_at) || "Chưa nhận"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Stethoscope className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Thông tin y tế
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Chẩn đoán:</span>
                  <p className="bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                    {drug.diagnosis || "Không có chẩn đoán"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Ghi chú:</span>
                  <p className="bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                    {drug.note || "Không có ghi chú"}
                  </p>
                </div>
                {drug.prescription_img_urls?.length > 0 && (
                  <div>
                    <span className="text-gray-500 block mb-1">
                      Ảnh đơn thuốc:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {drug.prescription_img_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={url}
                            alt={`Prescription ${index + 1}`}
                            className="w-full h-20 sm:h-24 object-cover rounded border border-gray-200 hover:opacity-80"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Pill className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Danh sách thuốc
                </h2>
              </div>
              {drug.request_items?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {drug.request_items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded p-2 sm:p-3 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200">
                          {index + 1}
                        </div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                          {item.name}
                        </h3>
                      </div>
                      <div className="text-xs sm:text-sm pl-7 sm:pl-8">
                        <p>
                          <span className="text-gray-500">Cách sử dụng:</span>{" "}
                          {item.dosage_usage}
                        </p>
                        <p>
                          <span className="text-gray-500">Thời gian uống:</span>{" "}
                          {Array.isArray(item.intake_templates)
                            ? item.intake_templates
                                .map(
                                  (time) =>
                                    ({
                                      MORNING: "Sáng",
                                      MIDDAY: "Trưa",
                                      AFTERNOON: "Chiều",
                                    }[time] || time)
                                )
                                .join(", ")
                            : item.intake_templates || "Chưa xác định"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 sm:py-4 text-gray-500">
                  <Pill className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs sm:text-sm">
                    Không có thuốc trong đơn.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugRequestDetail;