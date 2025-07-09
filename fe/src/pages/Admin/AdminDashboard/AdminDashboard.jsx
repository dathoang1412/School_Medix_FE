// import React, { useState, useEffect } from 'react';
// import axiosClient from "../../../config/axiosClient";

// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
// } from 'recharts';
// import {
//   Users, Heart, AlertTriangle, Thermometer, Activity, Shield,
//   TrendingUp, Calendar
// } from 'lucide-react';

// const AdminDashboard = () => {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [studentStats, setStudentStats] = useState({});
//   const [accidentsData, setAccidentsData] = useState([]);
//   const [diseaseTrends, setDiseaseTrends] = useState([]);
//   const [diseaseOptions, setDiseaseOptions] = useState([]);
//   const [selectedDisease, setSelectedDisease] = useState(null);
//   const [healthPlans, setHealthPlans] = useState([]);
//   const [healthStats, setHealthStats] = useState([]);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [studentsRes, accidentsRes, diseaseRes, plansRes, statsRes] = await Promise.all([
//           axiosClient.get('/dashboard/students'),
//           axiosClient.get('/dashboard/accidents'),
//           axiosClient.get('/dashboard/disease-trend'),
//           axiosClient.get('/dashboard/plans'),
//           axiosClient.get('/dashboard/health-status')
//         ]);

//         setStudentStats(studentsRes.data);
//         setAccidentsData(accidentsRes.data);
//         setDiseaseTrends(diseaseRes.data.trends);
//         setDiseaseOptions(diseaseRes.data.diseases);
//         setSelectedDisease(diseaseRes.data.diseases[0]?.value);
//         setHealthPlans(plansRes.data);
//         setHealthStats(statsRes.data);
//       } catch (err) {
//         console.error("Dashboard data load error:", err);
//       }
//     };

//     fetchData();
//   }, []);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'completed': return 'bg-green-100 text-green-800';
//       case 'in-progress': return 'bg-blue-100 text-blue-800';
//       case 'upcoming': return 'bg-orange-100 text-orange-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case 'completed': return 'Hoàn thành';
//       case 'in-progress': return 'Đang thực hiện';
//       case 'upcoming': return 'Sắp tới';
//       default: return 'Chưa xác định';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 mb-2">Hệ thống Quản Lý Y Tế Học Đường</h1>
//               <p className="text-gray-600">Trường School Medix</p>
//             </div>
//             <div className="text-right">
//               <div className="text-2xl font-bold text-indigo-600">
//                 {currentTime.toLocaleTimeString('vi-VN')}
//               </div>
//               <div className="text-gray-600">
//                 {currentTime.toLocaleDateString('vi-VN', {
//                   weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <StatCard icon={<Users className="h-12 w-12 text-blue-500" />} label="Tổng học sinh" value={studentStats.total || 0} note="" />
//           <StatCard icon={<Heart className="h-12 w-12 text-green-500" />} label="Học sinh khỏe mạnh" value={studentStats.healthy || 0} note={`${studentStats.healthy_percent || 0}%`} />
//           <StatCard icon={<AlertTriangle className="h-12 w-12 text-orange-500" />} label="Tai nạn tuần này" value={studentStats.accidents || 0} note="" />
//           <StatCard icon={<Thermometer className="h-12 w-12 text-red-500" />} label="Ca theo dõi" value={studentStats.monitored || 0} note="" />
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//               <Activity className="mr-2 h-5 w-5 text-red-500" /> Tần suất tai nạn hàng ngày
//             </h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={accidentsData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="minor" stackId="a" fill="#fbbf24" name="Tai nạn nhẹ" />
//                 <Bar dataKey="serious" stackId="a" fill="#ef4444" name="Tai nạn nặng" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-semibold text-gray-800 flex items-center">
//                 <Shield className="mr-2 h-5 w-5 text-green-500" /> Xu hướng dịch bệnh
//               </h3>
//               <select
//                 value={selectedDisease}
//                 onChange={(e) => setSelectedDisease(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
//               >
//                 {diseaseOptions.map(d => (
//                   <option key={d.value} value={d.value}>{d.label}</option>
//                 ))}
//               </select>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={diseaseTrends[selectedDisease] || []}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={3} name="Số ca" />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Health Stats & Plans */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//               <TrendingUp className="mr-2 h-5 w-5 text-blue-500" /> Tình trạng sức khỏe
//             </h3>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={healthStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
//                   {healthStats.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
//             <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//               <Calendar className="mr-2 h-5 w-5 text-purple-500" /> Kế hoạch y tế
//             </h3>
//             <div className="space-y-4">
//               {healthPlans.map((plan, index) => (
//                 <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-gray-800">{plan.name}</h4>
//                     <p className="text-gray-600 text-sm">{plan.date} • {plan.participants} người tham gia</p>
//                   </div>
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
//                     {getStatusText(plan.status)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// const StatCard = ({ icon, label, value, note }) => (
//   <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-gray-600 text-sm font-medium">{label}</p>
//         <p className="text-3xl font-bold text-gray-800">{value}</p>
//         <p className="text-blue-600 text-sm">{note}</p>
//       </div>
//       {icon}
//     </div>
//   </div>
// );

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import {
  Users, Heart, AlertTriangle, Thermometer, Activity, Shield, TrendingUp, Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [summary, setSummary] = useState({
    totalStudents: 0,
    healthyStudents: 0,
    recentAccidents: 0,
    monitoredCases: 0
  });
  const [accidentStats, setAccidentStats] = useState([]);
  const [diseaseStats, setDiseaseStats] = useState([]);
  const [healthStats, setHealthStats] = useState([]);
  const [healthPlanUpcoming, setHealthPlanUpcoming] = useState([]);
  const [heightWeightAvg, setHeightWeightAvg] = useState({});
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('vi-VN')), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [summaryRes, accidentRes, diseaseRes, healthRes, plansRes, heightWeightRes] = await Promise.all([
          axios.get('/api/dashboard/summary'),
          axios.get('/api/dashboard/accidents'),
          axios.get('/api/dashboard/diseases'),
          axios.get('/api/dashboard/health-stats'),
          axios.get('/api/dashboard/upcoming-health-plans'),
          axios.get(`/api/dashboard/height-weight?grade=${selectedGrade || ''}`),
        ]);
        setSummary(summaryRes.data);
        setAccidentStats(Array.isArray(accidentRes.data) ? accidentRes.data : []);
        setDiseaseStats(Array.isArray(diseaseRes.data) ? diseaseRes.data : []);
        setHealthStats(Array.isArray(healthRes.data) ? healthRes.data : []);
        setHealthPlanUpcoming(Array.isArray(plansRes.data) ? plansRes.data : []);
        setHeightWeightAvg(heightWeightRes.data || {});
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [selectedGrade]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">SchoolMedix Admin Dashboard</h1>
            <p className="text-gray-500">Thời gian hiện tại: {currentTime}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">{new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <p>Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard icon={<Users />} label="Tổng học sinh" value={summary.totalStudents} color="blue" />
              <SummaryCard icon={<Heart />} label="Học sinh khỏe mạnh" value={summary.healthyStudents} color="green" />
              <SummaryCard icon={<AlertTriangle />} label="Tai nạn tuần này" value={summary.recentAccidents} color="orange" />
              <SummaryCard icon={<Thermometer />} label="Ca bệnh theo dõi" value={summary.monitoredCases} color="red" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartCard title="Tần suất tai nạn y tế" icon={<Activity className="text-red-500" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={accidentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="minor" stackId="a" fill="#facc15" name="Tai nạn nhẹ" />
                    <Bar dataKey="serious" stackId="a" fill="#ef4444" name="Tai nạn nặng" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Thống kê dịch bệnh" icon={<Shield className="text-green-500" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={diseaseStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={2} name="Ca bệnh" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Health Status + Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="Tình trạng sức khỏe tổng quát" icon={<TrendingUp className="text-blue-500" />}>
                {isLoading ? (
                  <p>Đang tải dữ liệu...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={healthStats || []} dataKey="value" innerRadius={60} outerRadius={90}>
                        {Array.isArray(healthStats) && healthStats.length > 0 ? (
                          healthStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                          ))
                        ) : (
                          <Cell fill="#8884d8" />
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="mt-4 text-sm text-gray-600">
                  <p>Chiều cao trung bình: {heightWeightAvg?.heightAvg || 'N/A'} cm</p>
                  <p>Cân nặng trung bình: {heightWeightAvg?.weightAvg || 'N/A'} kg</p>
                  <p>Đợt khám gần nhất: {heightWeightAvg?.latestCheckupDate || 'N/A'}</p>
                  <p>Đã khám {heightWeightAvg?.checked || 0} / {heightWeightAvg?.total || 0} học sinh</p>
                  <select className="mt-2 border rounded px-2 py-1" onChange={(e) => setSelectedGrade(e.target.value)}>
                    <option value="">Chọn khối</option>
                    {heightWeightAvg?.grades?.length > 0 ? (
                      heightWeightAvg.grades.map(g => <option key={g} value={g}>{g}</option>)
                    ) : (
                      <option value="">Không có dữ liệu</option>
                    )}
                  </select>
                </div>
              </ChartCard>

              <div className="lg:col-span-2">
                <ChartCard title="Kế hoạch y tế sắp tới" icon={<Calendar className="text-purple-500" />}>
                  <div className="space-y-3">
                    {healthPlanUpcoming.map((plan) => (
                      <div key={plan.id} className="flex justify-between border p-3 rounded-md">
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-gray-500">{plan.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </div>

            {/* Placeholder for Khai báo */}
            <div className="mt-6 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="text-lg font-semibold text-yellow-800">Mục "Quản lý khai báo" đang được phát triển</h3>
              <p className="text-yellow-700 text-sm">Tính năng khai báo sẽ sớm có trong bản cập nhật tiếp theo.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => (
  <div className={`bg-white p-5 rounded-xl shadow border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`text-${color}-500`}>{icon}</div>
    </div>
  </div>
);

const ChartCard = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">{icon} <span className="ml-2">{title}</span></h3>
    {children}
  </div>
);

export default AdminDashboard;
