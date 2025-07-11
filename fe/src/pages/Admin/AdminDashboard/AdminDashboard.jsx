import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../config/axiosClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Users, Heart, AlertTriangle, Thermometer, Activity, Shield, TrendingUp, Calendar, Pill, Syringe, Stethoscope, FileText
} from 'lucide-react';
import PropTypes from 'prop-types';
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../../utils/campaignUtils";
import { getUserRole } from "../../../service/authService";

const CurrentTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right space-y-1">
      <div className="text-xl font-semibold text-gray-900">
        {currentTime.toLocaleTimeString("vi-VN")}
      </div>
      <div className="text-sm text-gray-600">
        {currentTime.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalStudents: 0,
    healthyStudents: 0,
    recentAccidents: 0,
    previousAccidents: 0,
    monitoredCases: 0,
    newCases: 0,
    proccessingDrug: 0,
    pendingDrug: 0,
    percent: 0.0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [accidentStats, setAccidentStats] = useState([]);
  const [accidentLoading, setAccidentLoading] = useState(true);
  const [accidentError, setAccidentError] = useState(null);
  const [maxAccidentCases, setMaxAccidentCases] = useState(0);

  const [diseaseStats, setDiseaseStats] = useState([]);
  const [diseaseLoading, setDiseaseLoading] = useState(true);
  const [diseaseError, setDiseaseError] = useState(null);
  const [availableDiseases, setAvailableDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState("");
  const [maxDiseaseCases, setMaxDiseaseCases] = useState(0);

  const [healthPlanUpcoming, setHealthPlanUpcoming] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(null);
  const [planStats, setPlanStats] = useState({
    vaccineCount: 0,
    regularCount: 0,
  });

  const [heightWeightAvg, setHeightWeightAvg] = useState({});
  const [heightWeightLoading, setHeightWeightLoading] = useState(true);
  const [heightWeightError, setHeightWeightError] = useState(null);
  const [selectedGradeId, setSelectedGradeId] = useState("");

  const [pendingRecords, setPendingRecords] = useState({
    pendingDiseaseRecords: 0,
    pendingVaccinationRecords: 0
  });
  const [pendingRecordsLoading, setPendingRecordsLoading] = useState(true);
  const [pendingRecordsError, setPendingRecordsError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const response = await axiosClient.get("/dashboard/summary");
        setSummary(response.data.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setSummaryError("Không thể tải dữ liệu tổng quan.");
        setSummaryError("Không thể tải dữ liệu tổng quan.");
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchAccidentStats = async () => {
      setAccidentLoading(true);
      setAccidentError(null);
      try {
        const response = await axiosClient.get("/dashboard/accidents");
        setAccidentStats(
          Array.isArray(response.data.data) ? response.data.data : []
        );
        setMaxAccidentCases(response.data.maxAccidentCases || 0);
      } catch (err) {
        console.error("Error fetching accident stats:", err);
        setAccidentError("Không thể tải dữ liệu tai nạn.");
      } finally {
        setAccidentLoading(false);
      }
    };
    fetchAccidentStats();
  }, []);

  useEffect(() => {
    const fetchDiseaseStats = async () => {
      setDiseaseLoading(true);
      setDiseaseError(null);
      try {
        const response = await axiosClient.get("/dashboard/diseases", {
          params: { diseaseId: selectedDiseaseId || undefined },
        });
        setDiseaseStats(response.data.data || []);
        setMaxDiseaseCases(response.data.maxCases || 0);
        setAvailableDiseases(response.data.availableDiseases || []);
      } catch (err) {
        console.error("Error fetching disease stats:", err);
        setDiseaseError("Không thể tải dữ liệu dịch bệnh.");
      } finally {
        setDiseaseLoading(false);
      }
    };
    fetchDiseaseStats();
  }, [selectedDiseaseId]);

  useEffect(() => {
    const fetchHeightWeight = async () => {
      setHeightWeightLoading(true);
      setHeightWeightError(null);
      try {
        const response = await axiosClient.get(
          `/dashboard/height-weight/${selectedGradeId || ""}`
        );
        const data = response.data.data?.data || response.data.data || {};
        setHeightWeightAvg(data);
      } catch (err) {
        console.error("Error fetching height weight:", err);
        setHeightWeightError(
          err.response?.data?.message ||
            "Không thể tải dữ liệu chiều cao cân nặng."
        );
      } finally {
        setHeightWeightLoading(false);
      }
    };
    fetchHeightWeight();
  }, [selectedGradeId]);

  useEffect(() => {
    const fetchHealthPlans = async () => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const response = await axiosClient.get(
          "/dashboard/upcoming-health-plans"
        );
        const plans = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setHealthPlanUpcoming(plans);

        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        let vaccineCount = 0;
        let regularCount = 0;
        
        plans.forEach(plan => {
          const planDate = new Date(plan.date);
          if (planDate > today && planDate < thirtyDaysFromNow) {
            if(plan.checkup_id !== null) {
              regularCount++;
            } else {
              vaccineCount++;
            }
          }
        });
        setPlanStats({ vaccineCount, regularCount });
      } catch (err) {
        console.error("Error fetching upcoming plans:", err);
        setPlansError(
          err.response?.data?.message || "Không thể tải dữ liệu kế hoạch y tế."
        );
      } finally {
        setPlansLoading(false);
      }
    };
    fetchHealthPlans();
  }, []);

  useEffect(() => {
    const fetchPendingRecords = async () => {
      setPendingRecordsLoading(true);
      setPendingRecordsError(null);
      try {
        const response = await axiosClient.get('/dashboard/pending-records');
        setPendingRecords({
          pendingDiseaseRecords: response.data.data.pendingDiseaseRecords || 0,
          pendingVaccinationRecords: response.data.data.pendingVaccinationRecords || 0
        });
      } catch (err) {
        console.error('Error fetching pending records:', err);
        setPendingRecordsError('Không thể tải dữ liệu khai báo.');
      } finally {
        setPendingRecordsLoading(false);
      }
    };
    fetchPendingRecords();
  }, []);

  const getAccidentComparison = (recent, previous) => {
    const diff = recent - previous;
    if (diff > 0) {
      return `+${diff} ca so với tuần trước`;
    } else if (diff < 0) {
      return `-${Math.abs(diff)} ca so với tuần trước`;
    } else {
      return "Không thay đổi so với tuần trước";
    }
  };

  const handlePlanClick = (planID) => {
    const plan_type = planID !== null ? "regular-checkup" : "vaccine-campaign";
    navigate(plan_type);
  };

  // const handlePendingRecordsClick = () => {
  //   navigate(`/${getUserRole()}/pending-records`);
  // };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Quản Lý Y Tế
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Trường TH - THPT MedixFPT
              </p>
            </div>
            <CurrentTimeDisplay />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {summaryLoading || pendingRecordsLoading ? (
            <div className="col-span-full flex items-center justify-center py-4 bg-white rounded-2xl shadow-sm">
              <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : summaryError || pendingRecordsError ? (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-600 text-sm">{summaryError || pendingRecordsError}</p>
            </div>
          ) : (
            <>
              <SummaryCard
                icon={<Heart className="w-5 h-5" />}
                label="Tổng số học sinh"
                value={summary.totalStudents}
                color="green"
                navigateTo={`/${getUserRole()}/user-manage`}
              >
                <p className="text-xs">{0} chưa xác thực</p>
              </SummaryCard>
              <SummaryCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Tai nạn tuần này"
                value={summary.recentAccidents}
                color="orange"
                navigateTo={`/${getUserRole()}/daily-health`}
              >
                <p className="text-xs">{getAccidentComparison(summary.recentAccidents, summary.previousAccidents)}</p>
              </SummaryCard>
              <SummaryCard
                icon={<Thermometer className="w-5 h-5" />}
                label="Ca bệnh theo dõi"
                value={summary.monitoredCases}
                color="red"
                navigateTo={`/${getUserRole()}/disease`}
              >
                <p className="text-xs">+{summary.newCases} ca trong tuần này</p>
              </SummaryCard>
              <SummaryCard
                icon={<Pill className="w-5 h-5" />}
                label="Đơn thuốc"
                value={summary.proccessingDrug}
                noti={summary.pendingDrug}
                color="blue"
                navigateTo={`/${getUserRole()}/send-drug`}
              >
                <p className="text-xs">{summary.pendingDrug} chờ duyệt</p>
              </SummaryCard>
              <SummaryCard
                icon={<FileText className="w-5 h-5" />}
                label="Đơn khai báo"
                value={pendingRecords.pendingDiseaseRecords + pendingRecords.pendingVaccinationRecords}
                noti={pendingRecords.pendingDiseaseRecords + pendingRecords.pendingVaccinationRecords}
                color="amber"
                navigateTo={`/${getUserRole()}/DeclarationManagement`}
              >
                <p className="text-xs">Bệnh: {pendingRecords.pendingDiseaseRecords} | Vaccine: {pendingRecords.pendingVaccinationRecords}</p>
              </SummaryCard>
            </>
          )}
        </div>

        {/* Health Status + Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Health Plans */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Kế hoạch y tế nhà trường"
              icon={<Calendar className="w-5 h-5 text-gray-600" />}
              className="h-[600px] flex flex-col" // Changed min-h to h for exact height
            >
              {plansLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-600">Đang tải dữ liệu kế hoạch...</p>
                </div>
              ) : plansError ? (
                <div className="flex-1 flex items-center justify-center bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm">{plansError}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                  <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Kế hoạch trong 30 ngày tới
                      </p>
                      <p className="text-sm text-gray-600">
                        Vaccine: {planStats.vaccineCount} | Khám định kỳ:{" "}
                        {planStats.regularCount}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Stethoscope className="w-4 h-4 mr-1" />
                        Khám định kỳ
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        <Syringe className="w-4 h-4 mr-1" />
                        Vaccine
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {healthPlanUpcoming.length > 0 ? (
                      healthPlanUpcoming.map((plan) => (
                        <div
                          key={plan.id}
                          className="flex justify-between items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handlePlanClick(plan.checkup_id)}
                        >
                          <div className="flex items-center">
                            {plan.checkup_id !== null ? (
                              <Stethoscope className="w-5 h-5 text-blue-500 mr-2" />
                            ) : (
                              <Syringe className="w-5 h-5 text-pink-500 mr-2" />
                            )}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800">
                                {plan.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {formatDate(plan.date)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 철 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              plan.status
                            )}`}
                          >
                            {getStatusText(plan.status)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8 text-sm">
                        Không có kế hoạch y tế nào
                      </p>
                    )}
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Health Status */}
          <ChartCard
            title={`Tình trạng sức khỏe tổng quát${
              heightWeightAvg.isAllGrades ? " (Tất cả khối lớp)" : ""
            }`}
            icon={<TrendingUp className="w-5 h-5 text-gray-600" />}
            className="h-[600px] flex flex-col" // Changed min-h to h for exact height
          >
            {heightWeightLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-600">Đang tải dữ liệu sức khỏe...</p>
              </div>
            ) : heightWeightError ? (
              <div className="flex-1 flex items-center justify-center bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{heightWeightError}</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                <div>
                  <select
                    className="w-full sm:w-48 h-9 rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
                    onChange={(e) => setSelectedGradeId(e.target.value)}
                    value={selectedGradeId || ""}
                  >
                    <option value="">Tất cả khối lớp</option>
                    {heightWeightAvg?.grades?.length > 0 ? (
                      heightWeightAvg.grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Không có khối lớp
                      </option>
                    )}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p className="text-xs text-gray-500">Tham gia khám</p>
                    <p className="text-lg font-bold text-gray-800">
                      {heightWeightAvg.totalChecked || 0} /{" "}
                      {heightWeightAvg.totalStudents || 0}
                    </p>
                    <p className="text-xs text-gray-600">
                      Tỷ lệ:{" "}
                      {heightWeightAvg.totalStudents
                        ? (
                            (heightWeightAvg.totalChecked /
                              heightWeightAvg.totalStudents) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-pink-500">
                    <p className="text-xs text-gray-500">Tỷ lệ nam/nữ</p>
                    <p className="text-lg font-bold text-gray-800">
                      {heightWeightAvg.maleCount || 0} /{" "}
                      {heightWeightAvg.femaleCount || 0}
                    </p>
                    <p className="text-xs text-gray-600">
                      Nam:{" "}
                      {heightWeightAvg.totalChecked
                        ? (
                            (heightWeightAvg.maleCount /
                              heightWeightAvg.totalChecked) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm text-gray-700">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-xs font-semibold text-gray-700">
                          Thông số
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-700">
                          Giá trị
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">Tên đợt khám</td>
                        <td className="p-3">
                          {heightWeightAvg.checkupName || "N/A"}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Ngày khám</td>
                        <td className="p-3">
                          {heightWeightAvg.latestCheckupDate || "N/A"}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Chiều cao TB nam</td>
                        <td className="p-3">
                          {heightWeightAvg.maleHeightAvg
                            ? `${heightWeightAvg.maleHeightAvg.toFixed(1)} cm`
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Cân nặng TB nam</td>
                        <td className="p-3">
                          {heightWeightAvg.maleWeightAvg
                            ? `${heightWeightAvg.maleWeightAvg.toFixed(1)} kg`
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Chiều cao TB nữ</td>
                        <td className="p-3">
                          {heightWeightAvg.femaleHeightAvg
                            ? `${heightWeightAvg.femaleHeightAvg.toFixed(1)} cm`
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Cân nặng TB nữ</td>
                        <td className="p-3">
                          {heightWeightAvg.femaleWeightAvg
                            ? `${heightWeightAvg.femaleWeightAvg.toFixed(1)} kg`
                            : "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard
            title="Tần suất tai nạn y tế"
            icon={<Activity className="w-5 h-5 text-gray-600" />}
          >
            {accidentLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-600">Đang tải dữ liệu tai nạn...</p>
              </div>
            ) : accidentError ? (
              <div className="h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{accidentError}</p>
              </div>
            ) : (
              <div className="h-64">
                <BarChart width={500} height={250} data={accidentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={[0, Math.max(4, maxAccidentCases)]}
                    tickCount={Math.max(6, maxAccidentCases + 1)}
                    interval={0}
                    allowDecimals={false}
                    type="number"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Số ca bệnh",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#374151" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="minor"
                    stackId="a"
                    fill="#facc15"
                    name="Tai nạn nhẹ"
                  />
                  <Bar
                    dataKey="serious"
                    stackId="a"
                    fill="#ef4444"
                    name="Tai nạn nặng"
                  />
                </BarChart>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="Thống kê dịch bệnh theo năm"
            icon={<Shield className="w-5 h-5 text-gray-600" />}
            select={
              <select
                id="diseaseSelect"
                value={selectedDiseaseId}
                onChange={(e) => setSelectedDiseaseId(e.target.value)}
                className="w-48 h-9 rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
              >
                <option value="">Tất cả các bệnh</option>
                {availableDiseases.map((disease) => (
                  <option key={disease.id} value={disease.id}>
                    {disease.name}
                  </option>
                ))}
              </select>
            }
          >
            {diseaseLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-600">Đang tải dữ liệu dịch bệnh...</p>
              </div>
            ) : diseaseError ? (
              <div className="h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{diseaseError}</p>
              </div>
            ) : (
              <div className="h-64">
                <LineChart width={500} height={250} data={diseaseStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={[0, Math.max(5, maxDiseaseCases)]}
                    tickCount={Math.max(6, maxDiseaseCases + 1)}
                    interval={0}
                    allowDecimals={false}
                    type="number"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Số ca bệnh",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#374151" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Ca bệnh"
                  />
                </LineChart>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Pending Records (Detailed View) */}
        {/* <ChartCard
          title="Quản lý khai báo"
          icon={<FileText className="w-5 h-5 text-gray-600" />}
          className="mb-6"
        >
          {pendingRecordsLoading ? (
            <div className="h-32 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-gray-600">Đang tải dữ liệu khai báo...</p>
            </div>
          ) : pendingRecordsError ? (
            <div className="h-32 flex items-center justify-center bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm">{pendingRecordsError}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
                  <p className="text-sm text-gray-500">Khai báo lịch sử bệnh</p>
                  <p className="text-xl font-bold text-gray-800">{pendingRecords.pendingDiseaseRecords}</p>
                  <p className="text-xs text-gray-500">Đang chờ duyệt</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
                  <p className="text-sm text-gray-500">Khai báo lịch sử tiêm chủng</p>
                  <p className="text-xl font-bold text-gray-800">{pendingRecords.pendingVaccinationRecords}</p>
                  <p className="text-xs text-gray-500">Đang chờ duyệt</p>
                </div>
              </div>
              <button
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                onClick={handlePendingRecordsClick}
              >
                Xem và duyệt khai báo
              </button>
            </div>
          )}
        </ChartCard> */}
      </div>
    </div>
  );
};

const colorMap = {
  blue: 'border-blue-500 text-black-500',
  green: 'border-green-500 text-black-500',
  purple: 'border-purple-500 text-black-500',
  red: 'border-red-500 text-black-500',
  indigo: 'border-indigo-500 text-black-500',
  orange: 'border-orange-500 text-black-500',
  amber: 'border-amber-500 text-black-500'
};

const SummaryCard = ({ icon, label, value, color, navigateTo, children, noti }) => {
  const navigate = useNavigate();
  const classes = colorMap[color] || 'border-black-500 text-black-500';

  return (
    <div
      className={`bg-white p-3 rounded-lg shadow-sm border-l-4 ${classes} cursor-pointer hover:shadow-md transition-shadow duration-200 h-20 flex items-center relative`}
      onClick={() => navigateTo && navigate(navigateTo)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-500 font-medium leading-tight">{label}</p>
          <p className="text-lg font-bold text-gray-800">{value}</p>
          {children}
        </div>
        <div className={classes}>{icon}</div>
      </div>
      {noti > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
          {noti}
        </span>
      )}
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

const ChartCard = ({ title, icon, select, children, className }) => (
  <div
    className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 ${className}`}
  >
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
  select: PropTypes.element,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AdminDashboard;
