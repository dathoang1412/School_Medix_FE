import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, History, Shield, BarChart2 } from "lucide-react";
import { useContext } from "react";
import { ChildContext } from "../../../layouts/ParentLayout";
import StudentRegularCheckup from "./StudentRegularCheckup";
import CheckupHistoryInfo from "./CheckupHistoryInfo";
import HealthDashboard from "./HealthDashboard";

const ParentCheckupLayout = () => {
  const { childId } = useParams();
  const { children, handleSelectChild } = useContext(ChildContext);
  const [currChild, setCurrChild] = useState(null);
  const [activeTab, setActiveTab] = useState("plans");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        setLoading(true);
        const child = children.find((c) => c.id === childId) || JSON.parse(localStorage.getItem("selectedChild"));
        if (!child) {
          setError("Không tìm thấy thông tin học sinh");
          return;
        }
        setCurrChild(child);
        handleSelectChild(child);
        setError(null);
      } catch (error) {
        setError("Không thể tải thông tin học sinh");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChild();
  }, [childId, children, handleSelectChild]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kiểm tra sức khỏe</h1>
              <p className="text-gray-600">Theo dõi và đăng ký tham gia các chiến dịch kiểm tra sức khỏe cho {currChild.name}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("plans")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "plans"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Kế hoạch kiểm tra
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <History className="w-4 h-4" />
              Lịch sử kiểm tra
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Tổng quan chỉ số
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "plans" && <StudentRegularCheckup currChild={currChild} />}
        {activeTab === "history" && <CheckupHistoryInfo />}
        {activeTab === "dashboard" && <HealthDashboard />}
      </div>
    </div>
  );
};

export default ParentCheckupLayout;