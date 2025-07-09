import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getSession } from "../../../config/Supabase";
import { ChildContext } from "../../../layouts/ParentLayout";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
      // Kiểm tra tất cả attribute phải tồn tại và hợp lệ
      return (
        item.height &&
        item.weight &&
        item.blood_pressure &&
        item.left_eye &&
        item.right_eye &&
        // Kiểm tra dữ liệu có thể parse được
        parseValue(item.height, "cm") !== null &&
        parseValue(item.weight, "kg") !== null &&
        parseBloodPressure(item.blood_pressure) !== null &&
        parseEyeVision(item.left_eye) !== null &&
        parseEyeVision(item.right_eye) !== null
      );
    });

    const labels = validRecords.map((item) => item.campaign_name);

    const datasets = [
      {
        label: "Chiều cao (cm)",
        data: validRecords.map((item) => parseValue(item.height, "cm")),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0, // Đường thẳng
      },
      {
        label: "Cân nặng (kg)",
        data: validRecords.map((item) => parseValue(item.weight, "kg")),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        tension: 0, // Đường thẳng
      },
      {
        label: "Huyết áp tâm thu (mmHg)",
        data: validRecords.map((item) => parseBloodPressure(item.blood_pressure)),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: false,
        tension: 0, // Đường thẳng
      },
      {
        label: "Mắt trái",
        data: validRecords.map((item) => parseEyeVision(item.left_eye)),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        fill: false,
        tension: 0, // Đường thẳng
      },
      {
        label: "Mắt phải",
        data: validRecords.map((item) => parseEyeVision(item.right_eye)),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: false,
        tension: 0, // Đường thẳng
      },
    ].filter((dataset) => dataset.data.length > 0); // Loại bỏ dataset trống

    return {
      labels,
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sự phát triển sức khỏe của học sinh",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Giá trị",
        },
      },
      x: {
        title: {
          display: true,
          text: "Chiến dịch",
        },
      },
    },
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-500">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (loading.fetch) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-500">Vui lòng chọn một học sinh để xem biểu đồ sức khỏe.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white border border-gray-300">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Biểu đồ phát triển sức khỏe của {selectedChild?.name || "học sinh"}
          </h2>
          {list.length === 0 || processChartData().labels.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <p className="text-gray-600">Không có dữ liệu sức khỏe hợp lệ để hiển thị.</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <Line data={processChartData()} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;