import React, { useState, useEffect } from "react";
import {
  Calendar,
  Loader2,
  XCircle,
  CheckSquare,
  X,
  Eye,
  Edit2,
  File,
  FileText,
  FileTextIcon,
} from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { useSnackbar } from "notistack";
import { getUserRole } from "../../../service/authService";
import { useNavigate } from "react-router-dom";

const TodayMedicationTab = ({ medicationSchedules }) => {
  const { enqueueSnackbar } = useSnackbar();
  const userRole = getUserRole();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [editingNotes, setEditingNotes] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const today = new Date().toISOString().split("T")[0]; // 2025-08-03
  const navigate = useNavigate();

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

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/medication-schedule-by-day?date=${date}`
      );
      console.log("SEND DRUG " + date + ": ", res.data.data);
      setScheduleDetails(res.data.data || {});
      setNoteInputs({});
      setEditingNotes({});
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      setScheduleDetails(null);
      enqueueSnackbar("Không thể tải lịch uống thuốc.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (time, groupIndex, isTaken) => {
    if (userRole !== "admin" && userRole !== "nurse") {
      enqueueSnackbar(
        "Chỉ admin hoặc nurse mới có quyền cập nhật trạng thái uống thuốc.",
        {
          variant: "error",
        }
      );
      return;
    }
    if (selectedDate !== today) {
      enqueueSnackbar("Chỉ có thể cập nhật trạng thái cho ngày hiện tại.", {
        variant: "warning",
      });
      return;
    }
    const group = scheduleDetails[time][groupIndex];
    if (isTaken === group.is_taken) {
      enqueueSnackbar(
        `Buổi này đã được ${isTaken ? "đánh dấu" : "bỏ đánh dấu"}.`,
        {
          variant: "warning",
        }
      );
      return;
    }

    setActionLoading((prev) => ({ ...prev, [time + groupIndex]: true }));
    try {
      const medicationIds = group.medications.map(
        (med) => med.medication_schedule_id
      );
      const note = noteInputs[time + groupIndex] || "Đã uống";
      const endpoint = isTaken
        ? `/medication-schedule/${medicationIds[0]}/tick`
        : `/medication-schedule/${medicationIds[0]}/untick`;
      const payload = isTaken
        ? { intake_time: new Date().toISOString(), note }
        : {};
      const promises = medicationIds.map((id) =>
        axiosClient.patch(endpoint.replace(medicationIds[0], id), payload)
      );
      const responses = await Promise.all(promises);

      if (responses.every((res) => res.status === 200)) {
        setScheduleDetails((prev) => {
          const updated = { ...prev };
          updated[time][groupIndex] = {
            ...group,
            is_taken: isTaken,
            note: isTaken ? note : group.note,
            intake_time: isTaken ? new Date().toISOString() : null,
          };
          return updated;
        });
        enqueueSnackbar(
          isTaken
            ? "Đánh dấu uống thuốc thành công!"
            : "Bỏ đánh dấu uống thuốc thành công!",
          { variant: "success" }
        );
        if (!isTaken) {
          setNoteInputs((prev) => ({ ...prev, [time + groupIndex]: "" }));
          setEditingNotes((prev) => ({ ...prev, [time + groupIndex]: false }));
        }
      } else {
        throw new Error("Yêu cầu không hợp lệ");
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái.",
        {
          variant: "error",
        }
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [time + groupIndex]: false }));
    }
  };

  const handleNoteChange = (time, groupIndex, value) => {
    setNoteInputs((prev) => ({ ...prev, [time + groupIndex]: value }));
    setScheduleDetails((prev) => {
      const updated = { ...prev };
      updated[time][groupIndex] = {
        ...updated[time][groupIndex],
        is_taken: false,
      };
      return updated;
    });
  };

  const toggleEditNote = (time, groupIndex) => {
    setEditingNotes((prev) => ({
      ...prev,
      [time + groupIndex]: !prev[time + groupIndex],
    }));
  };

  useEffect(() => {
    handleDateSelect(selectedDate);
  }, []);

  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 rounded-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
        <h2 className="text-sm sm:text-base font-medium text-gray-900">
          Lịch uống thuốc
        </h2>
      </div>
      <div className="mb-3 sm:mb-4">
        <div className="relative w-full max-w-xs">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateSelect(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <Calendar className="cursor-pointer absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 mx-auto text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
        </div>
      ) : selectedDate && scheduleDetails ? (
        <div>
          <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">
            Chi tiết lịch uống thuốc ngày {formatDate(selectedDate)}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-2 sm:p-3 text-left font-medium">Buổi</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Học sinh</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Chi tiết</th>
                  <th className="p-2 sm:p-3 text-left font-medium">Lớp</th>
                  <th className="p-2 sm:p-3 text-left font-medium">
                    Trạng thái
                  </th>
                  <th className="p-2 sm:p-3 text-left font-medium">Ghi chú</th>
                  <th className="p-2 sm:p-3 text-left font-medium">
                    Thời gian uống
                  </th>
                </tr>
              </thead>
              <tbody>
                {["MORNING", "MIDDAY", "AFTERNOON"].map(
                  (time) =>
                    scheduleDetails[time]?.length > 0 && (
                      <tr key={time} className="border-b border-gray-200">
                        <td className="p-2 sm:p-3 text-gray-700">
                          {time === "MORNING"
                            ? "Sáng"
                            : time === "MIDDAY"
                            ? "Trưa"
                            : "Chiều"}
                        </td>
                        <td className="p-2 sm:p-3">
                          {scheduleDetails[time].map((group, groupIndex) => (
                            <div key={group.request_id} className="py-1">
                              {group.student_name}
                            </div>
                          ))}
                        </td>
                        <td className="p-2 sm:p-3">
                          {scheduleDetails[time].map((group, groupIndex) => (
                            <FileText
                              size={25}
                              className="text-green-400 py-1 cursor-pointer"
                              onClick={() => {
                                navigate(
                                  `/${getUserRole()}/drug-request/${
                                    group.request_id
                                  }`
                                );
                              }}
                            />
                          ))}
                        </td>
                        <td className="p-2 sm:p-3">
                          {scheduleDetails[time].map((group, groupIndex) => (
                            <div key={group.request_id} className="py-1">
                              {group.class_name}
                            </div>
                          ))}
                        </td>
                        <td className="p-2 sm:p-3">
                          {scheduleDetails[time].map((group, groupIndex) => (
                            <div
                              key={group.request_id}
                              className={`flex items-center gap-2 py-1 ${
                                selectedDate > today ? "opacity-50" : ""
                              }`}
                            >
                              {(userRole === "admin" ||
                                userRole === "nurse") && (
                                <button
                                  onClick={() =>
                                    setSelectedGroup({
                                      time,
                                      groupIndex,
                                      medications: group.medications,
                                    })
                                  }
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                              {selectedDate < today ? (
                                group.is_taken ? (
                                  <CheckSquare
                                    size={14}
                                    className="text-green-600"
                                  />
                                ) : (
                                  <X size={14} className="text-red-600" />
                                )
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={group.is_taken}
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      time,
                                      groupIndex,
                                      e.target.checked
                                    )
                                  }
                                  disabled={
                                    actionLoading[time + groupIndex] ||
                                    !(
                                      userRole === "admin" ||
                                      userRole === "nurse"
                                    ) ||
                                    selectedDate !== today
                                  }
                                  className={`h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${
                                    selectedDate > today
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                />
                              )}
                              {actionLoading[time + groupIndex] && (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              )}
                            </div>
                          ))}
                        </td>
                        <td className="p-2 sm:p-3">
                          {scheduleDetails[time].map((group, groupIndex) => (
                            <div
                              key={group.request_id}
                              className="py-1 flex items-center gap-2"
                            >
                              {selectedDate === today &&
                              (userRole === "admin" || userRole === "nurse") ? (
                                editingNotes[time + groupIndex] ? (
                                  <input
                                    type="text"
                                    value={
                                      noteInputs[time + groupIndex] ||
                                      group.note ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleNoteChange(
                                        time,
                                        groupIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Thêm ghi chú..."
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                ) : (
                                  <>
                                    <span className="text-xs text-gray-500">
                                      {group.note || "Đã uống"}
                                    </span>
                                    <button
                                      onClick={() =>
                                        toggleEditNote(time, groupIndex)
                                      }
                                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  </>
                                )
                              ) : (
                                <span className="text-xs text-gray-500">
                                  {group.note || "N/A"}
                                </span>
                              )}
                            </div>
                          ))}
                        </td>
                        <td className="p-2 sm:p-3">
                          {scheduleDetails[time].map((group, groupIndex) => (
                            <div key={group.request_id} className="py-1">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(group.intake_time)}
                              </span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
            {["MORNING", "MIDDAY", "AFTERNOON"].every(
              (time) => !scheduleDetails[time]?.length
            ) && (
              <p className="text-xs sm:text-sm text-gray-500 mt-3">
                Không có lịch uống thuốc cho ngày {formatDate(selectedDate)}.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-gray-500">
          Không có lịch uống thuốc hoặc đang tải...
        </p>
      )}

      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Danh sách thuốc
                </h2>
                <p className="text-xs text-gray-500">
                  {formatDate(selectedDate)} -{" "}
                  {selectedGroup.time === "MORNING"
                    ? "Sáng"
                    : selectedGroup.time === "MIDDAY"
                    ? "Trưa"
                    : "Chiều"}
                </p>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 sm:p-4 max-h-[60vh] overflow-y-auto">
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
            </div>
            <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedGroup(null)}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayMedicationTab;
