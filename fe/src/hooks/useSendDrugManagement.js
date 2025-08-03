import { useState, useEffect } from "react";
import axiosClient from "../config/axiosClient";
import {
  handleAccept,
  handleRefuse,
  handleCancel,
  handleReceive,
  handleDone,
} from "../utils/statusUpdateHandler";
import { enqueueSnackbar } from "notistack";

const useSendDrugManagement = () => {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [medicationSchedules, setMedicationSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState(null);


  const fetchDrugHistory = async () => {
    try {
      setError(null);
      const res = await axiosClient.get("/send-drug-request");
      console.log("Drug Requests:", res.data.data); // Debug
      const drugData = res.data.data || [];
      setDrugs(drugData);
      setFilteredDrugs(drugData);
    } catch (error) {
      console.error("Error fetching drug history:", error);
      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách đơn thuốc. Vui lòng thử lại sau."
      );
    }
  };
  useEffect(() => {
    fetchDrugHistory();
  }, []);
  const fetchMedicationSchedules = async () => {
    try {
      const res = await axiosClient.get("/medication-schedule-days");
      console.log("Medication Schedules:", res.data.data); // Debug
      setMedicationSchedules(res.data.data || []);
    } catch (error) {
      console.error("Error fetching medication schedules:", error);
      setError(
        error.response?.data?.message ||
          "Không thể tải lịch uống thuốc. Vui lòng thử lại sau."
      );
    }
  };
  useEffect(() => {
    fetchMedicationSchedules();
  }, []);

  useEffect(() => {
    let result = [...drugs];
    if (statusFilter) {
      result = result.filter((drug) => drug.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(
        (drug) =>
          drug.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(drug.student_id).includes(searchTerm) ||
          drug.request_items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }
    setFilteredDrugs(result);
  }, [searchTerm, statusFilter, drugs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const refresh = async () => {
    setError(null);
    await fetchDrugHistory();
    await fetchMedicationSchedules()
  };


  return {
    refresh,
    drugs,
    filteredDrugs,
    medicationSchedules,
    searchTerm,
    statusFilter,
    error,
    handleSearch,
    handleFilterChange,
    handleAccept: (id) =>
      handleAccept(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleRefuse: (id) =>
      handleRefuse(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleCancel: (id) =>
      handleCancel(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleReceive: (id) =>
      handleReceive(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleDone: (id) =>
      handleDone(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar)
  };
};

export default useSendDrugManagement;

export const handleTick = async (scheduleId, intakeTime, note) => {
  try {
    const res = await axiosClient.patch(`/medication-schedule/${scheduleId}/tick`, {
      intake_time: intakeTime || new Date().toISOString(),
      note: note || "",
    });
    enqueueSnackbar("Đã đánh dấu uống thuốc.", { variant: "success" });
    setMedicationSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, is_taken: true, intake_time: intakeTime, note }
          : schedule
      )
    );
  } catch (error) {
    console.error("Error ticking medication schedule:", error);
    const errorMessage =
      error.response?.data?.message || "Không thể đánh dấu uống thuốc.";
    enqueueSnackbar(errorMessage, { variant: "error" });
  }
};

export const handleUntick = async (scheduleId) => {
  try {
    const res = await axiosClient.patch(`/medication-schedule/${scheduleId}/untick`);
    enqueueSnackbar("Đã bỏ đánh dấu uống thuốc.", { variant: "success" });
    setMedicationSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, is_taken: false, intake_time: null, note: null }
          : schedule
      )
    );
  } catch (error) {
    console.error("Error unticking medication schedule:", error);
    const errorMessage =
      error.response?.data?.message || "Không thể bỏ đánh dấu uống thuốc.";
    enqueueSnackbar(errorMessage, { variant: "error" });
  }
};