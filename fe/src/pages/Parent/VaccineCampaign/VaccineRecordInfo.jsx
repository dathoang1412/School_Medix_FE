import { useEffect, useState } from "react";
import { Syringe, Loader2, AlertCircle, ChevronDown, ChevronUp, Filter } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import VaccineDetailsDropdown from "./VaccineDetailsDropdown";

const VaccineRecordInfo = ({ records, currChild }) => {
  const [details, setDetails] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({});
  const [filterMode, setFilterMode] = useState("all"); // "all", "notEnough", "enough"

  useEffect(() => {
    if (!currChild?.id) {
      console.log("Không tìm thấy thông tin học sinh");
      return;
    }
  }, [currChild?.id]);

  const fetchDetails = async (diseaseId) => {
    if (!details[diseaseId]) {
      try {
        setLoadingDetails((prev) => ({ ...prev, [diseaseId]: true }));
        const res = await axiosClient.get(`/student/${currChild.id}/disease/${diseaseId}/vaccination-record`);
        const allRecords = res.data.data || [];
        setDetails((prev) => ({ ...prev, [diseaseId]: allRecords }));
      } catch (error) {
        console.error("Error fetching vaccination details:", error);
      } finally {
        setLoadingDetails((prev) => ({ ...prev, [diseaseId]: false }));
      }
    }
  };

  const toggleDropdown = (diseaseId) => {
    const record = records.find((r) => r.disease_id === diseaseId);
    if (record?.completed_doses > 0) {
      const isCurrentlyOpen = openDropdown === diseaseId;
      setOpenDropdown(isCurrentlyOpen ? null : diseaseId);

      if (!isCurrentlyOpen && !details[diseaseId]) {
        fetchDetails(diseaseId);
      }
    }
  };

  // Lọc danh sách dựa trên filterMode
  const filteredRecords = (() => {
    switch (filterMode) {
      case "notEnough":
        return records.filter((record) => record.completed_doses > 0 && record.completed_doses < record.dose_quantity);
      case "enough":
        return records.filter((record) => record.completed_doses === record.dose_quantity);
      default:
        return records;
    }
  })();

  if (!records) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi</h3>
          <p className="text-red-600 mb-4">Không có dữ liệu lịch sử tiêm chủng</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Syringe className="w-8 h-8 text-blue-600" />
          Lịch sử tiêm chủng
        </h1>
        <p className="text-gray-600 py-2">
          Thông tin lịch sử tiêm chủng của{" "}
          <span className="font-semibold">Mai Triệu Phú</span>
        </p>
        <div className="mt-4">
          <button
            onClick={() => setFilterMode(filterMode === "all" ? "notEnough" : "all")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
          >
            <Filter className="w-4 h-4" />
            {filterMode === "all" ? "Chưa đủ mũi" : "Hiển thị tất cả"}
          </button>
          <button
            onClick={() => setFilterMode(filterMode === "all" ? "enough" : "all")}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {filterMode === "all" ? "Đã đủ mũi" : "Hiển thị tất cả"}
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <Syringe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có lịch sử tiêm chủng
          </h3>
          <p className="text-gray-500">
            Hiện tại chưa có thông tin tiêm chủng nào được ghi nhận
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <div className="bg-white border border-gray-200 rounded-lg shadow-md">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-center">
                  <th className="w-1/12 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider">STT</th>
                  <th className="w-2/12 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider">Mã học sinh</th>
                  <th className="w-2/12 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider">Loại bệnh</th>
                  <th className="w-3/12 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider">Số mũi đã tiêm</th>
                  <th className="w-2/12 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider">Số mũi cần tiêm</th>
                  <th className="w-2/12 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider">Trạng thái</th>
                  <th className="w-2/12 px-4 py-4 text-xs font-bold text-gray-800 uppercase tracking-wider">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record, index) => (
                  <>
                    <tr key={record.disease_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{currChild.id}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{record.disease_name}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{record.completed_doses}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{record.dose_quantity}</td>
                      <td className="px-4 py-4 text-center text-sm">
                        {record.completed_doses === 0 ? (
                          <span className="text-red-600 font-medium">Chưa tiêm</span>
                        ) : record.completed_doses == record.dose_quantity ? (
                          <span className="text-green-600 font-medium">Đã tiêm đủ</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">Chưa tiêm đủ</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {record.completed_doses > 0 ? (
                          <button
                            onClick={() => toggleDropdown(record.disease_id)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1 transition-colors"
                          >
                            {loadingDetails[record.disease_id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : openDropdown === record.disease_id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            {openDropdown === record.disease_id ? "Ẩn chi tiết" : "Xem chi tiết"}
                          </button>
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </td>
                    </tr>
                    {openDropdown === record.disease_id && (
                      <tr>
                        <td colSpan="7" className="px-0 py-0 bg-gray-50">
                          <div className="px-4 py-4">
                            <VaccineDetailsDropdown
                              diseaseId={record.disease_id}
                              details={details[record.disease_id] || []}
                              loading={loadingDetails[record.disease_id]}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineRecordInfo;