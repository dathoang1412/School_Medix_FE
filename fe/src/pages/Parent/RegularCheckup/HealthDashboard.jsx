import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getSession } from "../../../config/Supabase";
import { getStudentInfo } from "../../../service/childenService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HealthDashboard = () => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    download: {},
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { student_id } = useParams();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const { data, error } = await getSession();
      if (error || !data.session) {
        enqueueSnackbar("Vui lòng đăng nhập để tiếp tục!", {
          variant: "error",
        });
        navigate("/login");
        return;
      }
      setIsAuthenticated(true);
      setLoading((prev) => ({ ...prev, fetch: false }));
    };
    checkAuth();
  }, [navigate, enqueueSnackbar]);

  // Fetch student info
  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (!student_id) {
        enqueueSnackbar("Không tìm thấy ID học sinh trong URL!", {
          variant: "error",
        });
        return;
      }

      setLoading((prev) => ({ ...prev, fetch: true }));
      try {
        const child = await getStudentInfo(student_id);
        if (!child?.id) {
          throw new Error("Không tìm thấy thông tin học sinh");
        }
        setSelectedChild(child);
      } catch (error) {
        console.error("Error fetching student info:", error);
        enqueueSnackbar("Không thể tải thông tin học sinh!", {
          variant: "error",
        });
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };

    if (isAuthenticated) {
      fetchStudentInfo();
    }
  }, [isAuthenticated, student_id, navigate, enqueueSnackbar]);

  // Fetch health history
  useEffect(() => {
    if (!isAuthenticated || !selectedChild?.id) return;

    const fetchHistory = async () => {
      setLoading((prev) => ({ ...prev, fetch: true }));
      try {
        const res = await axiosClient.get(`/student/${selectedChild.id}/full-record`);
        setList(res.data.data || []);
      } catch (error) {
        console.error("Error fetching health history:", error);
        enqueueSnackbar("Không thể tải lịch sử kiểm tra sức khỏe!", {
          variant: "error",
        });
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };

    fetchHistory();
  }, [isAuthenticated, selectedChild?.id, enqueueSnackbar]);

  // Parse functions
  const parseValue = (value, unit) => {
    if (!value || typeof value !== "string") return null;
    return parseFloat(value.replace(unit, ""));
  };

  const parseBloodPressure = (value) => {
    if (!value || typeof value !== "string") return null;
    const systolic = value.split("/")[0];
    return parseFloat(systolic) || null;
  };

  const parseEyeVision = (value) => {
    if (!value || typeof value !== "string") return null;
    const vision = value.split("/")[0] || value;
    return parseFloat(vision) || null;
  };

  // Process data for chart
  const processChartData = () => {
    const validRecords = list.filter((item) => {
      if (item.record_status !== "DONE") return false;
      return (
        item.height &&
        item.weight &&
        item.blood_pressure &&
        item.left_eye &&
        item.right_eye &&
        parseValue(item.height, "cm") !== null &&
        parseValue(item.weight, "kg") !== null &&
        parseBloodPressure(item.blood_pressure) !== null &&
        parseEyeVision(item.left_eye) !== null &&
        parseEyeVision(item.right_eye) !== null
      );
    });

    return validRecords.map((item) => ({
      campaign_name: item.campaign_name,
      height: parseValue(item.height, "cm"),
      weight: parseValue(item.weight, "kg"),
      blood_pressure: parseBloodPressure(item.blood_pressure),
      left_eye: parseEyeVision(item.left_eye),
      right_eye: parseEyeVision(item.right_eye),
    }));
  };

  // Format X-axis tick
  const formatXAxisTick = (value) => {
    if (typeof value !== "string") return value;
    return value.length > 12 ? `${value.substring(0, 12)}...` : value;
  };

  // Loading state for authentication or student info
  if (!isAuthenticated || loading.fetch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-100 mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">
            {isAuthenticated ? "Đang tải dữ liệu..." : "Đang kiểm tra đăng nhập..."}
          </p>
          <p className="text-sm text-gray-400 mt-1">Vui lòng đợi một chút</p>
        </div>
      </div>
    );
  }

  // No selected child
  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Vui lòng chọn một học sinh để xem biểu đồ sức khỏe.</p>
          <p className="text-sm text-gray-400 mt-1">Không tìm thấy thông tin học sinh.</p>
        </div>
      </div>
    );
  }

  const chartData = processChartData();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Biểu đồ phát triển
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedChild?.name || "Học sinh"}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6"
            >
              {list.length === 0 || chartData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Không có dữ liệu sức khỏe hợp lệ để hiển thị.</p>
                  <p className="text-sm text-gray-400 mt-1">Vui lòng kiểm tra lại thông tin hoặc thêm dữ liệu mới.</p>
                </div>
              ) : (
                <div className="bg-white">
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid
                        stroke="#d1d5db"
                        strokeWidth={1}
                        strokeOpacity={0.8}
                      />
                      <XAxis
                        dataKey="campaign_name"
                        axisLine={{ stroke: "#1e293b", strokeWidth: 2 }}
                        tickLine={{ stroke: "#1e293b", strokeWidth: 1 }}
                        tick={{ fontSize: 14, fill: "#1e293b", fontWeight: 500 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tickFormatter={formatXAxisTick}
                        label={{
                          value: "Tên chiến dịch",
                          position: "bottom",
                          offset: 50,
                          fontSize: 14,
                          fill: "#1e293b",
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        axisLine={{ stroke: "#1e293b", strokeWidth: 2 }}
                        tickLine={{ stroke: "#1e293b", strokeWidth: 1 }}
                        tick={{ fontSize: 14, fill: "#1e293b", fontWeight: 500 }}
                        label={{
                          value: "Giá trị",
                          angle: -90,
                          position: "insideLeft",
                          offset: 10,
                          fontSize: 14,
                          fill: "#1e293b",
                          fontWeight: 600,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          padding: "12px",
                        }}
                        labelStyle={{ color: "#1e293b", fontWeight: "600", marginBottom: "8px" }}
                        itemStyle={{ fontSize: "14px", padding: "4px 0" }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={40}
                        iconType="circle"
                        wrapperStyle={{
                          paddingBottom: "24px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#1e293b",
                        }}
                      />
                      <Line
                        type="linear"
                        dataKey="height"
                        name="Chiều cao (cm)"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#3b82f6", strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                      <Line
                        type="linear"
                        dataKey="weight"
                        name="Cân nặng (kg)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#10b981", strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                      <Line
                        type="linear"
                        dataKey="blood_pressure"
                        name="Huyết áp tâm thu (mmHg)"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                      <Line
                        type="linear"
                        dataKey="left_eye"
                        name="Mắt trái"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                      <Line
                        type="linear"
                        dataKey="right_eye"
                        name="Mắt phải"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#ef4444", strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;