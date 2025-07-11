import React, { useState, useEffect } from "react";
import { Search, Filter, FileText, User, Pill, Activity, Eye, PenBoxIcon, Plus, X, Loader2 } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentInfo } from "../../../service/childenService";
import { enqueueSnackbar } from "notistack";
import { getUserRole } from "../../../service/authService";

const DrugTable = () => {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { student_id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchDrugHistory = async () => {
      if (!student_id) {
        setError("Không có ID học sinh. Vui lòng kiểm tra lại.");
        return;
      }

      setIsLoading(true);
      try {
        const role = getUserRole();
        if (!role) {
          setError("Vui lòng đăng nhập để xem lịch sử gửi thuốc.");
          return;
        }
        setUserRole(role); // getUserRole returns a string (e.g., "parent")

        const child = await getStudentInfo(student_id);
        if (!child) {
          setError("Vui lòng chọn một học sinh để xem lịch sử gửi thuốc.");
          return;
        }
        setCurrChild(child);

        const res = await axiosClient.get(`/student/${child.id}/send-drug-request`);
        const fetchedDrugs = Array.isArray(res.data.data)
          ? res.data.data.filter(drug => drug.status !== "DRAFTED") // Filter out DRAFTED
          : [];
        setDrugs(fetchedDrugs);
        setFilteredDrugs(fetchedDrugs);
      } catch (error) {
        console.error("Error fetching drug history:", error);
        setError(
          error.response?.data?.message ||
            "Không thể tải lịch sử gửi thuốc. Vui lòng thử lại sau."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrugHistory();
  }, [student_id]);

  useEffect(() => {
    let result = [...drugs];
    if (searchTerm) {
      result = result.filter((drug) =>
        drug.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) || ""
      );
    }
    if (statusFilter !== "Tất cả trạng thái") {
      result = result.filter((drug) => drug.status === statusFilter);
    }
    setFilteredDrugs(result);
  }, [searchTerm, statusFilter, drugs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleView = (drug) => {
    setSelectedDrug(drug);
  };

  const handleCloseModal = () => {
    setSelectedDrug(null);
  };

  const handleEdit = (drug) => {
    if (userRole !== "parent") {
      enqueueSnackbar("Chỉ phụ huynh mới có quyền chỉnh sửa đơn thuốc.", {
        variant: "error",
      });
      return;
    }
    navigate(`/parent/edit/${student_id}/send-drug-form/${drug.id}`);
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
        {status || "Chưa xác định"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
            <span className="text-gray-500">Họ tên:</span>
            <p className="font-medium text-gray-900 mt-1">{currChild?.name || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-500">Lớp:</span>
            <p className="font-medium text-gray-900 mt-1">{currChild?.class_name || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-gray-600" />
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
                      className="w-full h-24 object-cover rounded-md border border-gray-200 hover:opacity-80"
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
        {drug?.request_items?.length > 0 ? (
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
                        : item.intake_template_time || "N/A"}
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
    <div className="min-h-screen w-full bg-gray-50 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm theo chẩn đoán"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option>Tất cả trạng thái</option>
                <option>PROCESSING</option>
                <option>ACCEPTED</option>
                <option>REFUSED</option>
                <option>DONE</option>
                <option>CANCELLED</option>
                <option>RECEIVED</option>
              </select>
            </div>
            <button
              onClick={() => currChild?.id && navigate(`/parent/edit/${currChild.id}/send-drug-form`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Gửi thêm thuốc
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
            <p className="text-gray-500 text-sm mt-2">Đang tải lịch sử gửi thuốc...</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
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
                        Tên Học Sinh
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
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDrugs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <FileText size={40} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">
                          {drugs.length === 0
                            ? "Không có dữ liệu đơn thuốc."
                            : "Không tìm thấy đơn thuốc phù hợp."}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Thử điều chỉnh bộ lọc hoặc thêm đơn thuốc mới
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDrugs.map((drug) => (
                      <tr key={drug.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">#{drug.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{currChild?.name || "N/A"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{currChild?.class_name || "N/A"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {drug?.request_items?.[0]?.name || "Không có dữ liệu"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {drug?.diagnosis || "Không có mô tả"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(drug.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                              onClick={() => handleView(drug)}
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              className={`p-1 rounded transition-colors duration-200 ${
                                userRole === "parent"
                                  ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                              onClick={() => handleEdit(drug)}
                              disabled={userRole !== "parent"}
                              title={userRole === "parent" ? "Chỉnh sửa" : "Chỉ phụ huynh mới có quyền chỉnh sửa"}
                            >
                              <PenBoxIcon size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
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
      </div>
    </div>
  );
};

export default DrugTable;