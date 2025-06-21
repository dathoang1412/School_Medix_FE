import { useEffect, useState } from "react";
import { Syringe, Loader2, AlertCircle } from "lucide-react";
import axiosClient from "../../config/axiosClient";

const VaccineRecordsInfo = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});

  useEffect(() => {
    const child = JSON.parse(localStorage.getItem('selectedChild'));
    if (child) {
      setCurrChild(child);
    }

    if (!currChild?.id) {
      setError("Không tìm thấy thông tin học sinh");
      setLoading(false);
      return;
    }

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/student/${currChild.id}/vaccination-record`);
        const recordData = res.data.data || [];
        setRecords(recordData);
        setError(null);
      } catch (error) {
        console.error("Error fetching vaccination records:", error);
        setError(error.response?.data?.message || "Không thể tải lịch sử tiêm chủng");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [currChild?.id]);

  // Group records by vaccine_id and count completed vaccines
  const groupedRecords = records.reduce((acc, record) => {
    const vaccineId = record.vaccine_id || "Unknown";
    if (!acc[vaccineId]) {
      acc[vaccineId] = {
        vaccine_id: vaccineId,
        vaccine_name: record.name,
        student_id: record.student_id || "Chưa xác định",
        description: record.description || "Không có mô tả",
        completedCount: 0,
      };
    }
    if (record.status?.toUpperCase() === 'COMPLETED') {
      acc[vaccineId].completedCount += 1;
    }
    return acc;
  }, {});

  const vaccineSummary = Object.values(groupedRecords);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Đang tải lịch sử tiêm chủng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="pl-10 text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Syringe className="w-8 h-8 text-blue-600" />
          Lịch sử tiêm chủng
        </h1>
        <p className="text-gray-600 py-2">
          Thông tin lịch sử tiêm chủng của {currChild?.name || "học sinh"}
        </p>
      </div>

      {vaccineSummary.length === 0 ? (
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
          <table className="w-full max-w-none table-fixed bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-center">
                <th className="w-1/10 px-4 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider">STT</th>
                <th className="w-2/10 px-4 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Mã học sinh</th>
                <th className="w-2/10 px-4 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Loại Vaccine</th>
                <th className="w-3/10 px-4 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Mô tả</th>
                <th className="w-2/10 px-4 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Số mũi đã tiêm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vaccineSummary.map((summary, index) => (
                <tr key={summary.vaccine_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-2 text-center text-sm text-gray-600">{summary.student_id}</td>
                  <td className="px-4 py-2 text-center text-sm text-gray-600">{summary.vaccine_name}</td>
                  <td className="px-4 py-2 text-center text-sm text-gray-600">{summary.description}</td>
                  <td className="px-4 py-2 text-center text-sm text-gray-600">{summary.completedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VaccineRecordsInfo;