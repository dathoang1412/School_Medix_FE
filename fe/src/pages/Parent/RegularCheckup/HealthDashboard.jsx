import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getSession } from "../../../config/Supabase";
import { ChildContext } from "../../../layouts/ParentLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const HealthDashboard = () => {
  const { selectedChild } = useContext(ChildContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    download: {},
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await getSession();
      if (error || !data.session) {
        enqueueSnackbar("Vui lòng đăng nhập để tiếp tục!", {
          variant: "error",
        });
        navigate("/login");
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [navigate, enqueueSnackbar]);

  useEffect(() => {
    if (!isAuthenticated || !selectedChild?.id) return;

    const fetchHistory = async () => {
      setLoading((prev) => ({ ...prev, fetch: true }));
      try {
        const res = await axiosClient.get(
          `/student/${selectedChild.id}/full-record`
        );
        setList(res.data.data);
      } catch (error) {
        enqueueSnackbar("Không thể tải lịch sử kiểm tra sức khỏe!", {
          variant: "error",
        });
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };

    fetchHistory();
  }, [isAuthenticated, selectedChild?.id, enqueueSnackbar]);

  // Hàm parse được khai báo trước processChartData
  const parseValue = (value, unit) => {
    if (!value) return null;
    return parseFloat(value.replace(unit, ""));
  };

  const parseBloodPressure = (value) => {
    if (!value) return null;
    return parseFloat(value.split("/")[0]);
  };

  const parseEyeVision = (value) => {
    if (!value) return null;
    return parseFloat(value.split("/")[0]) || parseFloat(value);
  };

  // Process data for chart
  const processChartData = () => {
    // Lọc các bản ghi có tất cả attribute hợp lệ và status là "DONE"
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

    // Chuyển đổi dữ liệu sang định dạng Recharts
    return validRecords.map((item) => ({
      campaign_name: item.campaign_name,
      height: parseValue(item.height, "cm"),
      weight: parseValue(item.weight, "kg"),
      blood_pressure: parseBloodPressure(item.blood_pressure),
      left_eye: parseEyeVision(item.left_eye),
      right_eye: parseEyeVision(item.right_eye),
    }));
  };

  // Rút ngắn nhãn campaign_name nếu quá 20 ký tự
  const formatXAxisTick = (value) => {
    if (typeof value !== "string") return value;
    return value.length > 12 ? `${value.substring(0, 12)}...` : value;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (loading.fetch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-slate-600">Vui lòng chọn một học sinh để xem biểu đồ sức khỏe.</p>
        </div>
      </div>
    );
  }

  const chartData = processChartData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Biểu đồ phát triển
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedChild?.name || "Học sinh"}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <div className="p-6">
            {list.length === 0 || chartData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-600 text-sm">Không có dữ liệu sức khỏe hợp lệ để hiển thị.</p>
              </div>
            ) : (
              <div className="bg-white">
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart 
                    data={chartData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="campaign_name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tickFormatter={formatXAxisTick}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#1e293b', fontWeight: '500' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="line"
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    <Line
                      type="linear"
                      dataKey="height"
                      name="Chiều cao (cm)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                    />
                    <Line
                      type="linear"
                      dataKey="weight"
                      name="Cân nặng (kg)"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                    <Line
                      type="linear"
                      dataKey="blood_pressure"
                      name="Huyết áp tâm thu (mmHg)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#f59e0b' }}
                      activeDot={{ r: 6, fill: '#f59e0b' }}
                    />
                    <Line
                      type="linear"
                      dataKey="left_eye"
                      name="Mắt trái"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#8b5cf6' }}
                      activeDot={{ r: 6, fill: '#8b5cf6' }}
                    />
                    <Line
                      type="linear"
                      dataKey="right_eye"
                      name="Mắt phải"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#ef4444' }}
                      activeDot={{ r: 6, fill: '#ef4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;