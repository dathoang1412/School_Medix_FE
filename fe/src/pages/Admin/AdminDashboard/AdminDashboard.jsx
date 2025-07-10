import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../../config/axiosClient";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import {
  Users, Heart, AlertTriangle, Thermometer, Activity, Shield, TrendingUp, Calendar, Pill
} from 'lucide-react';
import PropTypes from 'prop-types';

const CurrentTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <div className="text-2xl font-bold text-indigo-600">
        {currentTime.toLocaleTimeString('vi-VN')}
      </div>
      <div className="text-gray-600">
        {currentTime.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate(); // Hook để điều hướng
  
  // Summary data
  const [summary, setSummary] = useState({
    totalStudents: 0,
    healthyStudents: 0,
    recentAccidents: 0,
    previousAccidents: 0,
    monitoredCases: 0,
    newCases: 0,
    proccessingDrug: 0,
    pendingDrug: 0,
    percent: 0.0
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Accident stats
  const [accidentStats, setAccidentStats] = useState([]);
  const [accidentLoading, setAccidentLoading] = useState(true);
  const [accidentError, setAccidentError] = useState(null);
  const [maxAccidentCases, setMaxAccidentCases] = useState(0);

  // Disease stats
  const [diseaseStats, setDiseaseStats] = useState([]);
  const [diseaseLoading, setDiseaseLoading] = useState(true);
  const [diseaseError, setDiseaseError] = useState(null);
  const [availableDiseases, setAvailableDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('');
  const [maxDiseaseCases, setMaxDiseaseCases] = useState(0);

  // Health plans
  const [healthPlanUpcoming, setHealthPlanUpcoming] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(null);

  // Height weight data
  const [heightWeightAvg, setHeightWeightAvg] = useState({});
  const [heightWeightLoading, setHeightWeightLoading] = useState(true);
  const [heightWeightError, setHeightWeightError] = useState(null);
  const [selectedGradeId, setSelectedGradeId] = useState('');

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const response = await axiosClient.get('/dashboard/summary');
        setSummary(response.data.data); 
      } catch (err) {
        console.error('Error fetching summary:', err);
        setSummaryError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.');
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // Fetch accident stats
  useEffect(() => {
    const fetchAccidentStats = async () => {
      setAccidentLoading(true);
      setAccidentError(null);
      try {
        const response = await axiosClient.get('/dashboard/accidents');
        setAccidentStats(Array.isArray(response.data.data) ? response.data.data : []);
        setMaxAccidentCases(response.data.maxAccidentCases || 0);
      } catch (err) {
        console.error('Error fetching accident stats:', err);
        setAccidentError('Không thể tải dữ liệu tai nạn. Vui lòng thử lại sau.');
      } finally {
        setAccidentLoading(false);
      }
    };
    fetchAccidentStats();
  }, []);

  // Fetch disease stats
  useEffect(() => {
    const fetchDiseaseStats = async () => {
      setDiseaseLoading(true);
      setDiseaseError(null);
      try {
        const response = await axiosClient.get('/dashboard/diseases', {
          params: { diseaseId: selectedDiseaseId || undefined },
        });
        setDiseaseStats(response.data.data || []);
        setMaxDiseaseCases(response.data.maxDiseaseCases || 0);
        setAvailableDiseases(response.data.availableDiseases || []);
      } catch (err) {
        console.error('Error fetching disease stats:', err);
        setDiseaseError('Không thể tải dữ liệu dịch bệnh. Vui lòng thử lại sau.');
      } finally {
        setDiseaseLoading(false);
      }
    };
    fetchDiseaseStats();
  }, [selectedDiseaseId]);

  // Fetch health stats
  // Fetch height weight data
  useEffect(() => {
    const fetchHeightWeight = async () => {
      setHeightWeightLoading(true);
      setHeightWeightError(null);
      try {
        const response = await axiosClient.get(`/dashboard/height-weight/${selectedGradeId || ''}`);
        const data = response.data.data?.data || response.data.data || {};
        setHeightWeightAvg(data);
      } catch (err) {
        console.error('Error fetching height weight:', err);
        setHeightWeightError(err.response?.data?.message || 'Không thể tải dữ liệu chiều cao cân nặng. Vui lòng thử lại sau.');
      } finally {
        setHeightWeightLoading(false);
      }
    };
    fetchHeightWeight();
  }, [selectedGradeId]);

  // Fetch health plans
  useEffect(() => {
    const fetchHealthPlans = async () => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const response = await axiosClient.get('/dashboard/upcoming-health-plans');
        setHealthPlanUpcoming(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err) {
        console.error('Error fetching upcoming plans:', err);
        setPlansError(err.response?.data?.message || 'Không thể tải dữ liệu kế hoạch y tế. Vui lòng thử lại sau.');
      } finally {
        setPlansLoading(false);
      }
    };
    fetchHealthPlans();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFTED': return 'bg-gray-100 text-gray-800';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-800';
      case 'UPCOMING': return 'bg-orange-100 text-orange-800';
      case 'ONGOING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccidentComparison = (recent, previous) => {
    const diff = recent - previous;
    if (diff > 0) {
      return `+${diff} ca so với tuần trước`;
    } else if (diff < 0) {
      return `-${Math.abs(diff)} ca so với tuần trước`;
    } else {
      return 'Không thay đổi so với tuần trước';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Quản Lý Y Tế Học Đường</h1>
              <p className="text-gray-600">Trường THPT ABC - Admin Panel</p>
            </div>
            <CurrentTimeDisplay />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryLoading ? (
            <div className="col-span-full text-center py-4 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p>Đang tải dữ liệu tổng quan...</p>
            </div>
          ) : summaryError ? (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{summaryError}</p>
              <button
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => fetchSummary()}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <SummaryCard
                icon={<Heart />}
                label="Học sinh khỏe mạnh"
                value={summary.healthyStudents}
                color="green"
                navigateTo="/admin/healthy-students"
              >
                {summary.percent}% học sinh khỏe mạnh
              </SummaryCard>
              <SummaryCard
                icon={<AlertTriangle />}
                label="Tai nạn tuần này"
                value={summary.recentAccidents}
                color="purple"
                navigateTo="/admin/daily-health"
              >
                {getAccidentComparison(summary.recentAccidents, summary.previousAccidents)}
              </SummaryCard>
              <SummaryCard
                icon={<Thermometer />}
                label="Ca bệnh theo dõi"
                value={summary.monitoredCases}
                color="red"
                navigateTo="/admin/disease"
              >
                +{summary.newCases} ca trong tuần này 
              </SummaryCard>
              <SummaryCard
                icon={<Pill />}
                label="Đơn thuốc đang tiến hành"
                value={summary.proccessingDrug}
                color="blue"
                navigateTo="/admin/send-drug"
              >
                {summary.pendingDrug} đang chờ duyệt
              </SummaryCard>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Accident Chart */}
          <ChartCard title="Tần suất tai nạn y tế" icon={<Activity className="text-red-500" />}>
            {accidentLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Đang tải dữ liệu tai nạn...</p>
              </div>
            ) : accidentError ? (
              <div className="h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">{accidentError}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accidentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, Math.max(4, maxAccidentCases)]} // Minimum upper bound of 5, or maxCases if higher
                    tickCount={Math.max(6, maxAccidentCases + 1)} // Ensure enough ticks for integers
                    interval={0} // Show all ticks
                    allowDecimals={false} // Integer ticks
                    type="number"
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="minor" stackId="a" fill="#facc15" name="Tai nạn nhẹ" />
                  <Bar dataKey="serious" stackId="a" fill="#ef4444" name="Tai nạn nặng" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Disease Chart */}
          <ChartCard
            title="Thống kê dịch bệnh theo năm"
            icon={<Shield className="text-green-500" />}
            select={(
              <select
                id="diseaseSelect"
                value={selectedDiseaseId}
                onChange={(e) => setSelectedDiseaseId(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm h-8 w-48"
              >
                <option value="">Tất cả các bệnh</option>
                {availableDiseases.map(disease => (
                  <option key={disease.id} value={disease.id}>
                    {disease.name}
                  </option>
                ))}
              </select>
            )}
          >
            {diseaseLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Đang tải dữ liệu dịch bệnh...</p>
              </div>
            ) : diseaseError ? (
              <div className="h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">{diseaseError}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={diseaseStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                  />
                  <YAxis
                    domain={[0, Math.max(5, maxDiseaseCases)]}
                    tickCount={Math.max(6, maxDiseaseCases + 1)}
                    interval={0}
                    allowDecimals={false}
                    type="number"
                    label={{ value: 'Số ca bệnh', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={2} name="Ca bệnh" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Health Status + Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Status */}
          <ChartCard title="Tình trạng sức khỏe tổng quát" icon={<TrendingUp className="text-blue-500" />}>
            {heightWeightLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Đang tải dữ liệu sức khỏe...</p>
              </div>
            ) : heightWeightError ? (
              <div className="h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">{heightWeightError}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Tham gia</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {heightWeightAvg.totalChecked || 0} / {heightWeightAvg.totalStudents || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tỷ lệ: {heightWeightAvg.totalStudents ? ((heightWeightAvg.totalChecked / heightWeightAvg.totalStudents) * 100).toFixed(1) : 0}% 
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-pink-500">
                    <p className="text-sm text-gray-500">Tỷ lệ nam/nữ</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {heightWeightAvg.maleCount || 0} / {heightWeightAvg.femaleCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Nam: {heightWeightAvg.totalChecked ? ((heightWeightAvg.maleCount / heightWeightAvg.totalChecked) * 100).toFixed(1) : 0}% 
                    </p>
                  </div>
                </div>
                {/* Detailed Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-600">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Thông số</th>
                        <th className="p-2 text-left">Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-t">Tên đợt khám</td>
                        <td className="p-2 border-t">{heightWeightAvg.checkupName || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t">Ngày khám</td>
                        <td className="p-2 border-t">{heightWeightAvg.latestCheckupDate || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t">Chiều cao TB nam</td>
                        <td className="p-2 border-t">{heightWeightAvg.maleHeightAvg ? `${heightWeightAvg.maleHeightAvg.toFixed(1)} cm` : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t">Cân nặng TB nam</td>
                        <td className="p-2 border-t">{heightWeightAvg.maleWeightAvg ? `${heightWeightAvg.maleWeightAvg.toFixed(1)} kg` : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t">Chiều cao TB nữ</td>
                        <td className="p-2 border-t">{heightWeightAvg.femaleHeightAvg ? `${heightWeightAvg.femaleHeightAvg.toFixed(1)} cm` : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t">Cân nặng TB nữ</td>
                        <td className="p-2 border-t">{heightWeightAvg.femaleWeightAvg ? `${heightWeightAvg.femaleWeightAvg.toFixed(1)} kg` : 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Grade Filter */}
                <div className="mt-4">
                  <select
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm h-8 w-full sm:w-48"
                    onChange={(e) => setSelectedGradeId(e.target.value)}
                    value={selectedGradeId || ''}
                  >
                    <option value="">Tất cả khối lớp</option>
                    {heightWeightAvg?.grades?.length > 0 ? (
                      heightWeightAvg.grades.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))
                    ) : (
                      <option value="">Không có dữ liệu</option>
                    )}
                  </select>
                </div>
              </div>
            )}
          </ChartCard>

          {/* Health Plans */}
          <div className="lg:col-span-2">
            <ChartCard title="Kế hoạch y tế nhà trường" icon={<Calendar className="text-purple-500" />}>
              {plansLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Đang tải dữ liệu kế hoạch...</p>
                </div>
              ) : plansError ? (
                <div className="h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded">
                  <p className="text-red-600">{plansError}</p>
                  <button
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    onClick={() => {
                      delete cache.healthPlanUpcoming;
                      setPlansLoading(true);
                      setPlansError(null);
                      fetchHealthPlans();
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {healthPlanUpcoming.length > 0 ? (
                    healthPlanUpcoming.map((plan) => (
                      <div key={plan.id} className="flex justify-between border p-3 rounded-md">
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-gray-500">{plan.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Không có kế hoạch y tế nào</p>
                  )}
                </div>
              )}
            </ChartCard>
          </div>
        </div>

        {/* Placeholder for Khai báo */}
        <div className="mt-6 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h3 className="text-lg font-semibold text-yellow-800">Mục "Quản lý khai báo" đang được phát triển</h3>
          <p className="text-yellow-700 text-sm">Tính năng khai báo sẽ sớm có trong bản cập nhật tiếp theo.</p>
        </div>
      </div>
    </div>
  );
};

const colorMap = {
  blue: 'border-blue-500 text-blue-500',
  green: 'border-green-500 text-green-500',
  purple: 'border-purple-500 text-purple-500',
  red: 'border-red-500 text-red-500',
  indigo: 'border-indigo-500 text-indigo-500',
};

const SummaryCard = ({ icon, label, value, color, navigateTo, children }) => {
  const navigate = useNavigate();
  const classes = colorMap[color] || 'border-gray-500 text-gray-500';

  return (
    <div
      className={`bg-white p-5 rounded-xl shadow border-l-4 ${classes} cursor-pointer hover:shadow-lg transition-shadow duration-200`}
      onClick={() => navigateTo && navigate(navigateTo)} // Điều hướng khi click vào card
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {children} {/* Hiển thị nội dung tùy chỉnh, như button */}
        </div>
        <div className={classes}>{icon}</div>
      </div>
    </div>
  );
};

SummaryCard.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  color: PropTypes.string.isRequired,
  navigateTo: PropTypes.string,
  children: PropTypes.node,
};

const ChartCard = ({ title, icon, select, children }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800 ml-2">{title}</h3>
      </div>
      {select && <div>{select}</div>}
    </div>
    {children}
  </div>
);

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired,
};

export default AdminDashboard;