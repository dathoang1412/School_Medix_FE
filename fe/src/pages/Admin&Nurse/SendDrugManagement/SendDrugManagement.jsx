import React, { useEffect, useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSendDrugManagement from "../../../hooks/useSendDrugManagement";
import DrugRequestList from "./DrugRequestList";

const SendDrugManagement = () => {
  const navigate = useNavigate();
  const {
    drugs,
    filteredDrugs,
    searchTerm,
    statusFilter,
    error,
    classMap,
    handleSearch,
    handleFilterChange,
    handleAccept,
    handleRefuse,
    handleCancel,
    handleReceive,
    handleDone,
  } = useSendDrugManagement();

  // Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get today's records count
  const todayRecordsCount = drugs.filter((drug) => isToday(drug.created_at)).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Quản lý Đơn Thuốc</h1>
              <p className="text-gray-600">Theo dõi và quản lý đơn thuốc của học sinh</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{drugs.length}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Tổng đơn thuốc</div>
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
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã học sinh hoặc mô tả bệnh..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={handleFilterChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PROCESSING">Đang xử lý</option>
                  <option value="ACCEPTED">Đã chấp nhận</option>
                  <option value="REFUSED">Đã từ chối</option>
                  <option value="DONE">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="RECEIVED">Đã nhận</option>
                </select>
                <Filter size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button
                onClick={() => navigate("/admin/add-drug-request")}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Thêm Đơn Thuốc
              </button>
            </div>
          </div>
        </div>

        {/* Drug Request List */}
        <DrugRequestList
          drugs={filteredDrugs}
          handleAccept={handleAccept}
          handleRefuse={handleRefuse}
          handleCancel={handleCancel}
          handleReceive={handleReceive}
          handleDone={handleDone}
        />
      </div>
    </div>
  );
};

export default SendDrugManagement;