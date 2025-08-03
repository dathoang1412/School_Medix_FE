import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  FileText,
  User,
  Activity,
  Eye,
  PenBoxIcon,
  Plus,
  Loader2,
  Calendar,
} from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentInfo } from "../../../service/childenService";
import { enqueueSnackbar } from "notistack";
import { getUserRole } from "../../../service/authService";

const DrugTable = () => {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});
  const [userRole, setUserRole] = useState(null);
  const { student_id } = useParams();
  const navigate = useNavigate();

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
        setUserRole(role);

        const child = await getStudentInfo(student_id);
        if (!child) {
          setError("Vui lòng chọn một học sinh để xem lịch sử gửi thuốc.");
          return;
        }
        setCurrChild(child);

        const res = await axiosClient.get(`/student/${student_id}/send-drug-request`);
        console.log("STUDENT DRUG REQUEST: ", res.data.data);
        if (res.data.error) throw new Error(res.data.message);
        const fetchedDrugs = (res.data.data || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
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
      result = result.filter(
        (drug) =>
          drug.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(drug.student_id).includes(searchTerm)
      );
    }
    if (statusFilter) {
      result = result.filter((drug) => drug.status === statusFilter);
    }
    setFilteredDrugs(result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }, [searchTerm, statusFilter, drugs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleView = (drug) => {
    navigate(`/parent/edit/${student_id}/drug-request/${drug.id}`);
  };

  const handleEdit = (drug) => {
    if (userRole !== "parent") {
      enqueueSnackbar("Chỉ phụ huynh mới có quyền chỉnh sửa đơn thuốc.", {
        variant: "error",
      });
      return;
    }
    if (drug.status !== "PROCESSING") {
      enqueueSnackbar("Chỉ có thể chỉnh sửa đơn thuốc ở trạng thái Đang xử lý.", {
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

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm theo chẩn đoán hoặc mã học sinh"
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
                <option value="">Tất cả trạng thái</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="ACCEPTED">Đã chấp nhận</option>
                <option value="REFUSED">Đã từ chối</option>
                <option value="DONE">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="RECEIVED">Đã nhận</option>
              </select>
            </div>
            {userRole === "parent" && (
              <button
                onClick={() =>
                  currChild?.id &&
                  navigate(`/parent/edit/${currChild.id}/send-drug-form`)
                }
                className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Gửi thêm thuốc
              </button>
            )}
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
            <p className="text-gray-500 text-sm mt-2">
              Đang tải lịch sử gửi thuốc...
            </p>
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
                        <Calendar size={14} />
                        Ngày Tạo
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
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <FileText
                          size={40}
                          className="mx-auto text-gray-400 mb-4"
                        />
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
                          <span className="text-sm text-gray-900">
                            {drug.student_name || currChild?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {drug.class_name || currChild?.class_name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {formatDate(drug?.create_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {drug?.diagnosis || "Không có mô tả"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(drug.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="cursor-pointer text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                              onClick={() => handleView(drug)}
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            {userRole === "parent" && drug.status === "PROCESSING" && (
                              <button
                                className="p-1 cursor-pointer rounded text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors duration-200"
                                onClick={() => handleEdit(drug)}
                                title="Chỉnh sửa"
                              >
                                <PenBoxIcon size={18} />
                              </button>
                            )}
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
      </div>
    </div>
  );
};

export default DrugTable;