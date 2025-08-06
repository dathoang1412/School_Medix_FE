import React, { useState, useEffect } from "react";
import {
  Shield,
  FileText,
  Loader2,
  XCircle,
  Calendar,
  Pill,
  Activity,
  User,
  Syringe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DiseaseRecordRow from "./DiseaseRecordRow";
import VaccineRecordRow from "./VaccineRecordRow";
import axiosClient from "../../../config/axiosClient";

const DeclarationManagement = () => {
  const [diseaseRecords, setDiseaseRecords] = useState([]);
  const [vaccineRecords, setVaccineRecords] = useState([]);
  const [filteredDiseaseRecords, setFilteredDiseaseRecords] = useState([]);
  const [filteredVaccineRecords, setFilteredVaccineRecords] = useState([]);
  const [diseaseMap, setDiseaseMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("disease"); // 'disease' or 'vaccine'
  const recordsPerPage = 10;

  const fetchRecords = async () => {
    setLoading(true);
    setError("");

    // Fetch disease records
    try {
      const { data } = await axiosClient.get("/disease-record/requests/history");
      if (!data.error && data.data?.rows) {
        const uniqueRecords = Array.from(
          new Map(data.data.rows.map((record) => [record.id, record])).values()
        );
        setDiseaseRecords(uniqueRecords);
        setFilteredDiseaseRecords(uniqueRecords);
      } else {
        setError(data.message || "Không thể tải danh sách khai báo bệnh");
      }
    } catch (err) {
      console.error("Fetch disease records error:", err.response?.data || err.message);
      setError(
        "Không thể tải danh sách khai báo bệnh: " +
          (err.response?.data?.message || err.message)
      );
    }

    // Fetch vaccine records
    try {
      const { data } = await axiosClient.get("/vaccination-record/requests/history");
      if (!data.error && data.data?.rows) {
        const uniqueRecords = Array.from(
          new Map(data.data.rows.map((record) => [record.id, record])).values()
        );
        setVaccineRecords(uniqueRecords);
        setFilteredVaccineRecords(uniqueRecords);
      } else {
        setError(data.message || "Không thể tải danh sách khai báo vaccine");
      }
    } catch (err) {
      console.error("Fetch vaccine records error:", err.response?.data || err.message);
      setError(
        "Không thể tải danh sách khai báo vaccine: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDiseases = async () => {
    try {
      const { data } = await axiosClient.get("/diseases");
      setDiseaseMap(
        data.data.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {})
      );
    } catch (err) {
      console.error("Fetch diseases error:", err.response?.data || err.message);
      setError(
        "Không thể tải danh sách bệnh: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    fetchDiseases();
    fetchRecords();
  }, []);

  useEffect(() => {
    const filteredDiseases = diseaseRecords.filter(
      (r) => statusFilter === "All" || r.pending === statusFilter
    );
    const filteredVaccines = vaccineRecords.filter(
      (r) => statusFilter === "All" || r.pending === statusFilter
    );
    setFilteredDiseaseRecords(filteredDiseases);
    setFilteredVaccineRecords(filteredVaccines);
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [statusFilter, diseaseRecords, vaccineRecords]);

  // Pagination logic
  const totalRecords = viewMode === "disease" ? filteredDiseaseRecords.length : filteredVaccineRecords.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = (
    viewMode === "disease" ? filteredDiseaseRecords : filteredVaccineRecords
  ).slice(indexOfFirstRecord, indexOfLastRecord);

  // Generate page numbers (show up to 5 pages, with ellipses for large ranges)
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    // Add page range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-8 h-8 text-blue-600 p-2 bg-blue-50 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {viewMode === "disease"
                  ? "Quản lý khai báo bệnh"
                  : "Quản lý khai báo vaccine"}
              </h1>
              <p className="text-gray-600">
                {viewMode === "disease"
                  ? "Xem và duyệt các đơn khai báo bệnh của học sinh"
                  : "Xem và duyệt các đơn khai báo vaccine của học sinh"}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm">
                Tổng hồ sơ:{" "}
                <span className="font-medium text-blue-600">
                  {totalRecords}
                </span>
              </div>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode("disease")}
                  className={`px-4 py-2 text-sm cursor-pointer font-medium flex items-center gap-2 transition-colors ${
                    viewMode === "disease"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Pill className="w-4 h-4" /> Danh sách khai báo bệnh
                </button>
                <button
                  onClick={() => setViewMode("vaccine")}
                  className={`px-4 py-2 text-sm cursor-pointer font-medium flex items-center gap-2 transition-colors ${
                    viewMode === "vaccine"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Syringe className="w-4 h-4" /> Danh sách khai báo vaccine
                </button>
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ duyệt</option>
              <option value="DONE">Đã duyệt</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl py-8 mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left text-sm font-semibold text-gray-700" style={{ width: '15%' }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Ngày Tạo
                  </div>
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700" style={{ width: '15%' }}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Mã Học Sinh
                  </div>
                </th>
                {viewMode === "disease" ? (
                  <>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700" style={{ width: '20%' }}>
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4" /> Tên Bệnh
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700" style={{ width: '15%' }}>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Tình trạng
                      </div>
                    </th>
                  </>
                ) : (
                  <>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700" style={{ width: '20%' }}>
                      <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4" /> Tên Vaccine
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700" style={{ width: '20%' }}>
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4" /> Bệnh Ngừa
                      </div>
                    </th>
                  </>
                )}
                <th className="p-4 text-left text-sm font-semibold text-gray-700" style={{ width: '15%' }}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Trạng Thái Đơn
                  </div>
                </th>
                <th className="p-4 text-center text-sm font-semibold text-gray-700" style={{ width: '15%' }}>
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 text-sm mt-2">Đang tải...</p>
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-900 text-lg font-semibold">
                      Không tìm thấy hồ sơ
                    </p>
                  </td>
                </tr>
              ) : (
                currentRecords.map((record) =>
                  viewMode === "disease" ? (
                    <DiseaseRecordRow
                      key={record.id}
                      record={record}
                      diseaseMap={diseaseMap}
                      onUpdate={fetchRecords}
                    />
                  ) : (
                    <VaccineRecordRow
                      key={record.id}
                      record={record}
                      onUpdate={fetchRecords}
                    />
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-gray-600">
              Hiển thị {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, totalRecords)} của {totalRecords} hồ sơ
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              <div className="flex gap-1">
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-600">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border border-gray-300 rounded-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeclarationManagement;