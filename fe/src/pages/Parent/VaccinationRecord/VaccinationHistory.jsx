import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getStudentInfo } from "../../../service/childenService";
import { ChevronDown, FileText, X, Filter } from "lucide-react";

const VaccinationHistory = () => {
  const { student_id } = useParams();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDoseFilter, setSelectedDoseFilter] = useState("all");
  const [availableDoses, setAvailableDoses] = useState([]);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedChild, setSelectedChild] = useState(null);

  // Fetch student info
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const child = await getStudentInfo(student_id);
        setSelectedChild(child);
      } catch (error) {
        enqueueSnackbar("Không thể tải thông tin học sinh!", {
          variant: "error",
        });
      }
    };

    fetchStudentInfo();
  }, [student_id, enqueueSnackbar]);

  // Fetch vaccination history when selectedChild is available
  useEffect(() => {
    if (!selectedChild?.id) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/student/${selectedChild.id}/vaccination-record`);
        console.log("Vaccination history detail: ", res.data.data);
        setList(res.data.data);
        
        // Extract unique doses for filter options
        const doses = [...new Set(res.data.data.map(item => item.disease_name).filter(Boolean))];
        setAvailableDoses(doses);
      } catch (error) {
        console.error("Error fetching vaccination history:", error);
        enqueueSnackbar(
          `Không thể tải lịch sử tiêm chủng: ${error.response?.data?.message || error.message}`,
          { variant: "error" }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedChild?.id, enqueueSnackbar]);

  // Filter vaccination records based on selected dose
  useEffect(() => {
    if (selectedDoseFilter === "all") {
      setFilteredList(list);
    } else {
      setFilteredList(list.filter(item => item.disease_name === selectedDoseFilter));
    }
  }, [list, selectedDoseFilter]);

  const handleDoseFilterChange = (dose) => {
    setSelectedDoseFilter(dose);
    setExpandedRow(null); // Close any expanded rows when filter changes
  };

  const toggleRow = (vaccinationRecordId) => {
    setExpandedRow((prev) => (prev === vaccinationRecordId ? null : vaccinationRecordId));
  };

  const openFullDetailsModal = (record) => {
    setSelectedRecord(record);
    setShowFullDetailsModal(true);
  };

  const closeFullDetailsModal = () => {
    setShowFullDetailsModal(false);
    setSelectedRecord(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 bg-green-50 text-green-600 border border-green-200 text-xs font-medium rounded-full">
            Hoàn thành
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-medium rounded-full">
            Chờ xử lý
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-full">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium rounded-full">
            Không xác định
          </span>
        );
    }
  };

  const renderFilterSection = () => (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Lọc theo mũi tiêm:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDoseFilterChange("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              selectedDoseFilter === "all"
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Tất cả ({list.length})
          </button>
          {availableDoses.map((dose) => (
            <button
              key={dose}
              onClick={() => handleDoseFilterChange(dose)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                selectedDoseFilter === dose
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {dose} ({list.filter(item => item.disease_name === dose).length})
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFullDetailsModal = () => {
    if (!selectedRecord) return null;
    return (
      <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết tiêm chủng
            </h3>
            <button
              onClick={closeFullDetailsModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-800">
                Học sinh: {selectedRecord.student_name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Chiến dịch: {selectedRecord.campaign_name || "Không thuộc chiến dịch"} | Mã hồ sơ: #{selectedRecord.id}
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
                  Thông tin tiêm chủng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <label className="w-1/3 text-sm font-medium text-gray-600">
                        Vaccine
                      </label>
                      <p className="flex-1 text-sm text-gray-800">
                        {selectedRecord.vaccine_name || "_ _ _"}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <label className="w-1/3 text-sm font-medium text-gray-600">
                        Bệnh
                      </label>
                      <p className="flex-1 text-sm text-gray-800">
                        {selectedRecord.disease_name || "_ _ _"}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <label className="w-1/3 text-sm font-medium text-gray-600">
                        Ngày tiêm
                      </label>
                      <p className="flex-1 text-sm text-gray-800">
                        {selectedRecord.vaccination_date ? new Date(selectedRecord.vaccination_date).toLocaleDateString('vi-VN') : "_ _ _"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <label className="w-1/3 text-sm font-medium text-gray-600">
                        Địa điểm
                      </label>
                      <p className="flex-1 text-sm text-gray-800">
                        {selectedRecord.location || "_ _ _"}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <label className="w-1/3 text-sm font-medium text-gray-600">
                        Theo dõi sau tiêm
                      </label>
                      <p className="flex-1 text-sm text-gray-800">
                        {selectedRecord.description || "Không có chẩn đoán"}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <label className="w-1/3 text-sm font-medium text-gray-600">
                        Trạng thái
                      </label>
                      <p className="flex-1 text-sm text-gray-800">
                        {getStatusBadge(selectedRecord.status)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button 
              onClick={() => navigate(`${selectedRecord.id}`)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
            >
              Xem chi tiết
            </button>
            <button
              onClick={closeFullDetailsModal}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVaccinationTable = () => (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {loading ? (
        <div className="text-center py-12 bg-white">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-12 bg-white">
          <p className="text-gray-600 text-sm">
            {selectedDoseFilter === "all" 
              ? "Không có dữ liệu lịch sử tiêm chủng" 
              : `Không có dữ liệu cho mũi tiêm "${selectedDoseFilter}"`
            }
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm font-semibold">
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Mã hồ sơ
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Tên học sinh
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Vaccine
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Mũi tiêm
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Ngày tiêm
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-200">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center">Xem chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <>
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 font-mono">
                    #{item.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium">
                    {item.student_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200">
                    {item.vaccine_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200">
                    {item.disease_name || "Không xác định"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200">
                    {item.vaccination_date ? new Date(item.vaccination_date).toLocaleDateString('vi-VN') : "_ _ _"}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openFullDetailsModal(item)}
                      className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 rounded-md transition-colors"
                      title="Xem chi tiết"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                {expandedRow === item.id && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-4 bg-gray-50 border-b border-gray-200"
                    >
                      <div className="text-sm">
                        <div className="p-3 bg-white border border-gray-200 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-800 font-medium text-sm">
                              Địa điểm: {item.location || "Không có"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-800 font-medium text-sm">
                              Theo dõi sau tiêm: {item.description || "Không có"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Lịch sử tiêm chủng
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Xem lịch sử tiêm chủng của {selectedChild?.name || "học sinh"}
          </p>
        </div>
        {availableDoses.length > 0 && renderFilterSection()}
        {renderVaccinationTable()}
        {renderFullDetailsModal()}
      </div>
    </div>
  );
};

export default VaccinationHistory;