import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  TicketCheck,
  Eye,
  PenBoxIcon,
  Trash2,
  CheckIcon,
  Plus,
} from "lucide-react";
import axiosClient from "../../config/axiosClient";
import { getUser } from "../../service/authService";
import { getChildClass } from "../../service/childenService";
import { Link, useNavigate } from "react-router-dom";

const DrugTable = () => {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});
  const [childClass, setChildClass] = useState(null);

  useEffect(() => {
    const fetchDrugHistory = async () => {
      const user = getUser();
      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem lịch sử gửi thuốc");
        return;
      }

      const selectedChild = localStorage.getItem("selectedChild");
      if (!selectedChild) {
        setError("Vui lòng chọn một đứa trẻ để xem lịch sử gửi thuốc.");
        return;
      }

      const child = JSON.parse(selectedChild);
      setCurrChild(child);

      setIsLoading(true);
      try {
        const clas = await getChildClass(child?.class_id);
        console.log("Child class fetched:", clas); // Debug log
        setChildClass(clas || "Chưa có thông tin");
        const res = await axiosClient.get(`/student/${child.id}/send-drug-request`);
        setDrugs(res.data.data || []);
        console.log("DRUGS: ", res.data.data)
        setFilteredDrugs(res.data.data || []);
      } catch (error) {
        console.error("Error fetching drug history or class:", error);
        setError("Không thể tải lịch sử gửi thuốc hoặc thông tin lớp. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrugHistory();
  }, []);

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
    alert(`Xem chi tiết đơn thuốc ${drug.id}`);
    // Thêm logic xem chi tiết (ví dụ: mở modal hoặc redirect)
  };

  const handleEdit = (drug) => {
    alert(`Sửa đơn thuốc ${drug.id}`);
    // Thêm logic chỉnh sửa
  };

  const statusColors = {
    PROCESSING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REFUSED: "bg-red-100 text-red-800",
    DONE: "bg-blue-100 text-blue-800",
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm theo mô tả bệnh"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="w-full sm:w-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Tất cả trạng thái</option>
              <option>PROCESSING</option>
              <option>ACCEPTED</option>
              <option>REFUSED</option>
              <option>DONE</option>
            </select>
            <div

              onClick={() => {navigate(`/parent/edit/${currChild?.id}/send-drug-form`)}}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Gửi thêm thuốc
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Đang tải lịch sử gửi thuốc...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên học sinh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lớp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên thuốc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả bệnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrugs.map((drug) => (
                  <tr key={drug.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {drug.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currChild?.name || "Không xác định"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {childClass?.class_name || "Chưa có thông tin"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[150px] truncate">
                      {drug?.request_items?.[0]?.name || "Không có dữ liệu"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[150px] truncate">
                      {drug?.diagnosis || "Không có mô tả"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[drug.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {drug.status || "Chưa xác định"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        onClick={() => handleView(drug)}
                      >
                        <Eye />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 mr-2"
                        onClick={() => handleEdit(drug)}
                      >
                        <PenBoxIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDrugs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugTable;