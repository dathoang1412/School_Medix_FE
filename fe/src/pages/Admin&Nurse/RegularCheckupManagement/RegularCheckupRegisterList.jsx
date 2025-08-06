import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, X, Eye } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { enqueueSnackbar } from "notistack";
import { getUserRole } from "../../../service/authService";
import { fetchClass } from './../../../utils/classUtils';

const RegularCheckupRegisterList = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRegister, setSelectedRegister] = useState(null);
  const { campaign_id } = useParams();
  const navigate = useNavigate();

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const res = await axiosClient.get(`/checkup-register/${campaign_id}`);
      console.log("LIST: ", res.data.data);
      // Sort the list to prioritize "SUBMITTED" status
      const sortedList = (res.data.data || []).sort((a, b) => {
        if (a.register_status === "SUBMITTED" && b.register_status !== "SUBMITTED") return -1;
        if (a.register_status !== "SUBMITTED" && b.register_status === "SUBMITTED") return 1;
        return 0;
      });
      setList(sortedList);
      setFilteredList(sortedList); // Initialize filtered list
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải danh sách đăng ký");
      enqueueSnackbar("Không thể tải danh sách đăng ký", { variant: "error" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [campaign_id]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const f = async () => {
      const res = await fetchClass();
      setClasses(res);
    };
    f();
  }, []);

  // Filter list based on selected class
  useEffect(() => {
    if (selectedClass) {
      const filtered = list.filter((item) => item.class_name === selectedClass);
      setFilteredList(filtered);
    } else {
      setFilteredList(list); // Show all if no class is selected
    }
  }, [selectedClass, list]);

  const handleRefresh = () => {
    fetchList();
    setSelectedClass(""); // Reset filter on refresh
    setSelectedRegister(null); // Close modal on refresh
  };

  const handleClassFilterChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "text-blue-600 bg-blue-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      case "APPROVED":
        return "text-green-600 bg-green-100";
      case "REJECTED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCampaignStatusColor = (status) => {
    switch (status) {
      case "UPCOMING":
        return "text-orange-600 bg-orange-100";
      case "ONGOING":
        return "text-green-600 bg-green-100";
      case "COMPLETED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSpecialistStatusDisplay = (status) => {
    const statusMap = {
      DONE: "Hoàn thành",
      CANNOT_ATTACH: "Không thể gắn",
    };
    return statusMap[status] || "Chưa xác định";
  };

  const getSpecialistStatusBadge = (status) => {
    const styles = {
      DONE: "bg-blue-100 text-blue-800",
      CANNOT_ATTACH: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {getSpecialistStatusDisplay(status)}
      </span>
    );
  };

  if (loading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-600">Đang tải danh sách đăng ký...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800 mb-4">{error}</div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleRefresh}
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Loader2
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : "hidden"}`}
            />
            <span>Thử lại</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(`/${getUserRole()}/regular-checkup`)}
            className="flex cursor-pointer items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedClass}
            onChange={handleClassFilterChange}
            className="px-4 cursor-pointer py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="cursor-pointer" value="">Tất cả lớp</option>
            {classes.map((cls) => (
              <option className="cursor-pointer" key={cls.class_name} value={cls.class_name}>
                {cls.class_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 ${
              isRefreshing ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isRefreshing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span>Làm mới</span>
          </button>
        </div>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Danh sách đăng ký khám sức khỏe
        </h1>
        <p className="text-gray-600">Tổng số đăng ký: {filteredList.length}</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Đăng ký
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên học sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái chiến dịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái đăng ký
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lý do
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên khoa
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không có dữ liệu đăng ký
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.register_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{item.register_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/${getUserRole()}/student-overview/${
                          item.student_id
                        }`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {item.student_name}
                      </Link>
                      <div className="text-sm text-gray-500">
                        ID: {item.student_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCampaignStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          item.register_status
                        )}`}
                      >
                        {item.register_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={item.reason}>
                        {item.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.register_status === "SUBMITTED" && (
                        <button
                          onClick={() => setSelectedRegister(item)}
                          className="text-blue-600 cursor-pointer hover:text-blue-800"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredList.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Hiển thị {filteredList.length} kết quả
        </div>
      )}

      {selectedRegister && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Danh sách chuyên khoa
                </h2>
                <p className="text-xs text-gray-500">
                  Đăng ký #{selectedRegister.register_id} - {selectedRegister.student_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedRegister(null)}
                className="text-gray-400 cursor-pointer hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 sm:p-4 max-h-[60vh] overflow-y-auto">
              {selectedRegister.specialist_records && selectedRegister.specialist_records.filter(record => record !== null).length > 0 ? (
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {selectedRegister.specialist_records
                      .filter(record => record !== null && record.status !== "CANNOT_ATTACH")
                      .map((record, index) => (
                        <li
                          key={record.spe_exam_id}
                          className="text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200">
                              {index + 1}
                            </div>
                            <h3 className="text-xs  sm:text-sm ">
                              Chuyên khoa: <span className="font-bold text-cyan-400">{record.specialist_name}</span>
                            </h3>
                          </div>
                          <div className="pl-7 sm:pl-8 space-y-2">
                            <p>
                              <span className="text-gray-500">Trạng thái:</span>{" "}
                              {record.status}
                            </p>
                            <p>
                              <span className="text-gray-500">Kết quả:</span>{" "}
                              {record.result || "Chưa có kết quả"}
                            </p>
                            <p>
                              <span className="text-gray-500">Chẩn đoán:</span>{" "}
                              {record.diagnosis || "Chưa có chẩn đoán"}
                            </p>
                            {record.diagnosis_paper_urls?.length > 0 && (
                              <p>
                                <span className="text-gray-500">Tài liệu:</span>{" "}
                                <a
                                  href={record.diagnosis_paper_urls[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Xem tài liệu
                                </a>
                              </p>
                            )}
                            <p>
                              <span className="text-gray-500">Đã kiểm tra:</span>{" "}
                              {record.is_checked ? "Có" : "Không"}
                            </p>
                            {/* <p>
                              <span className="text-gray-500">Ngày ghi nhận:</span>{" "}
                              {new Date(record.date_record).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }) || "N/A"}
                            </p> */}
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-3 sm:py-4 text-gray-500">
                  <p className="text-xs sm:text-sm">
                    Không có bản ghi chuyên khoa nào.
                  </p>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRegister(null)}
                className="px-3 cursor-pointer py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm"
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

export default RegularCheckupRegisterList;