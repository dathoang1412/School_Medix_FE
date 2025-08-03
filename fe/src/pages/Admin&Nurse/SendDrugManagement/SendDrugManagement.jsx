import React, { useState } from "react";
import { Search, Filter, Calendar, Pill, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import useSendDrugManagement from "../../../hooks/useSendDrugManagement";
import DrugRequestList from "./DrugRequestList";
import TodayMedicationTab from "./TodayMedicationTab";

const SendDrugManagement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const {
    drugs,
    filteredDrugs,
    medicationSchedules,
    searchTerm,
    statusFilter,
    error,
    handleSearch,
    handleFilterChange,
    handleAccept,
    handleRefuse,
    handleCancel,
    handleReceive,
    handleDone,
    refresh,
  } = useSendDrugManagement();
  const [viewMode, setViewMode] = useState("today"); // 'today' or 'requests'
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const todayRecordsCount = drugs.filter((drug) =>
    isToday(drug.schedule_send_date)
  ).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6 sm:py-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Quản lý Dặn Thuốc
              </h1>
              <p className="text-sm text-gray-600">
                Theo dõi và quản lý đơn dặn thuốc thuốc của học sinh
              </p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {drugs.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                  Tổng đơn thuốc
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {todayRecordsCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                  Hôm nay
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode("today")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  viewMode === "today"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-4 h-4" /> Uống thuốc
              </button>
              <button
                onClick={() => setViewMode("requests")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  viewMode === "requests"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Pill className="w-4 h-4" /> Quản lý dặn thuốc
              </button>
            </div>
            <div className="flex gap-3 items-center">
              {viewMode === "requests" && (
                <>
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo mã học sinh, chẩn đoán hoặc tên thuốc..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={handleFilterChange}
                      className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="ACCEPTED">Đã chấp nhận</option>
                      <option value="REFUSED">Đã từ chối</option>
                      <option value="DONE">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                      <option value="RECEIVED">Đã nhận</option>
                    </select>
                    <Filter className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </>
              )}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-3 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                  isRefreshing
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {viewMode === "today" ? (
          <TodayMedicationTab medicationSchedules={medicationSchedules} />
        ) : (
          <DrugRequestList
            drugs={filteredDrugs}
            handleAccept={handleAccept}
            handleRefuse={handleRefuse}
            handleCancel={handleCancel}
            handleReceive={handleReceive}
            handleDone={handleDone}
          />
        )}
      </div>
    </div>
  );
};

export default SendDrugManagement;
