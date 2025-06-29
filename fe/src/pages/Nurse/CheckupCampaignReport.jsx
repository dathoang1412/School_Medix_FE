import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack"; // Import notistack
import axiosClient from "../../config/axiosClient";
import { ArrowLeft, Check } from "lucide-react";

const CheckupCampaignReport = () => {
  const [generalHealthList, setGeneralHealthList] = useState([]);
  const [specialistList, setSpecialistList] = useState([]);
  const [tabs, setTabs] = useState(["Khám tổng quát"]);
  const [activeTab, setActiveTab] = useState("Khám tổng quát");
  const [loading, setLoading] = useState({ general: false, specialist: false, tabs: false });
  const { checkup_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Use notistack

  // Fetch tabs for specialist exams
  const fetchTabs = async () => {
    setLoading((prev) => ({ ...prev, tabs: true }));
    try {
      const response = await axiosClient.get("/special-exam");
      const specialistTabs = response.data.data.map((el) => el.name);
      setTabs(["Khám tổng quát", ...specialistTabs]);
    } catch (error) {
      console.error("Error fetching tabs:", error);
      enqueueSnackbar("Không thể tải danh sách tab chuyên khoa!", { variant: "error" });
    } finally {
      setLoading((prev) => ({ ...prev, tabs: false }));
    }
  };

  // Fetch general health records
  const fetchGeneralList = async () => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      const res = await axiosClient.get(`/health-record/campaign/${checkup_id}`);
      setGeneralHealthList(res.data.data);
    } catch (error) {
      console.error("Error fetching general health data:", error);
      enqueueSnackbar("Không thể tải danh sách khám tổng quát!", { variant: "error" });
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  // Fetch specialist exam records
  const fetchSpecialistList = async () => {
    setLoading((prev) => ({ ...prev, specialist: true }));
    try {
      const res = await axiosClient.get(`/campaign/${checkup_id}/specialist-exam/record`);
      setSpecialistList(res.data.data);
    } catch (error) {
      console.error("Error fetching specialist data:", error);
      enqueueSnackbar("Không thể tải danh sách khám chuyên khoa!", { variant: "error" });
    } finally {
      setLoading((prev) => ({ ...prev, specialist: false }));
    }
  };

  // Fetch all data concurrently
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchTabs(), fetchGeneralList(), fetchSpecialistList()]);
      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    };
    fetchAllData();
  }, [checkup_id]);

  // Handle status update for general or specialist exams
  const handleStatusUpdate = async (speId, registerId, currentStatus, type = "general") => {
    if (currentStatus === "DONE") return;

    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === "general") {
        await axiosClient.patch(`/health-record/${registerId}/done`);
        setGeneralHealthList((prev) =>
          prev.map((item) =>
            item.register_id === registerId ? { ...item, status: "DONE" } : item
          )
        );
      } else {
        await axiosClient.patch(`/checkup-register/${registerId}/specialist-exam/${speId}/done`);
        setSpecialistList((prev) =>
          prev.map((specialist) => ({
            ...specialist,
            records: specialist.records.map((item) =>
              item.register_id === registerId && item.spe_exam_id === speId
                ? { ...item, status: "DONE" }
                : item
            ),
          }))
        );
      }
      enqueueSnackbar("Cập nhật trạng thái thành công!", { variant: "success" });
    } catch (error) {
      console.error("Error updating status:", error);
      enqueueSnackbar("Có lỗi xảy ra khi cập nhật trạng thái!", { variant: "error" });
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Render status badge
  const getStatusBadge = (status) => {
    return status === "WAITING" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Chờ khám
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Hoàn thành
      </span>
    );
  };

  // Render table for health records
  const renderHealthTable = (records, type) => (
    <div className="overflow-x-auto">
      {loading[type] ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đăng ký
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên học sinh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lớp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hoàn thành
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((item) => (
              <tr key={item.register_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{item.register_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.student_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.class_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() =>
                      handleStatusUpdate(item.spe_exam_id, item.register_id, item.status, type)
                    }
                    disabled={item.status === "DONE" || loading[type]}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      item.status === "DONE"
                        ? "bg-green-100 text-green-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                    } ${loading[type] ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={item.status === "DONE" ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                    aria-label={item.status === "DONE" ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Memoized tab data
  const tabData = useMemo(() => {
    if (activeTab === "Khám tổng quát") {
      return { records: generalHealthList, type: "general" };
    }
    const specialistData = specialistList.find((item) => item.name === activeTab) || {
      records: [],
    };
    return { records: specialistData.records || [], type: "specialist" };
  }, [activeTab, generalHealthList, specialistList]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/nurse/regular-checkup")}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Quay lại danh sách kiểm tra định kỳ"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </button>
      </div>

      {/* Tab Header */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm `}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{activeTab}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {tabData.records.length} học sinh
          </p>
        </div>
        {renderHealthTable(tabData.records, tabData.type)}
      </div>
    </div>
  );
};

export default CheckupCampaignReport;