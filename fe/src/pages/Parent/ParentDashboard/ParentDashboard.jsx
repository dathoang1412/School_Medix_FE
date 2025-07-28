import React, { useState, useEffect, useCallback, useContext } from "react";
import { Heart, Activity, Pill, Syringe, User2, Calendar } from "lucide-react";
import { ChildContext } from "../../../layouts/ParentLayout";
import axiosClient from "../../../config/axiosClient";
import { getUser } from "../../../service/authService";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { MdDashboard } from "react-icons/md";

// Wrapper component to provide ChildContext
const ParentDashboardWrapper = () => {
  const [selectedChild, setSelectedChild] = useState(() => {
    const savedChild = localStorage.getItem("selectedChild");
    return savedChild ? JSON.parse(savedChild) : null;
  });
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  const [dashboardStats, setDashboardStats] = useState({
    surveyVaccinationPending: 0,
    surveyCheckupPending: 0,
    dailyHealthRecordToday: 0,
    drugSendPending: 0,
    declareSendPending: 0,
    sumNoti: 0
  });

  // Fetch children data and their notification counts
  useEffect(() => {
    const fetchChildren = async () => {
      const user = getUser();
      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem thông tin");
        return;
      }

      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/parent/${user?.id}`);
        const childrenData = res.data.data?.children || [];
        
        // Fetch notification stats for each child
        const childrenWithNoti = await Promise.all(
          childrenData.map(async (child) => {
            try {
              const response = await axiosClient.get(`/dashboard/${child.id}/parent-dashboard`);
              return { ...child, sumNoti: response.data.data.sumNoti || 0 };
            } catch (err) {
              console.error(`Error fetching dashboard for child ${child.id}:`, err);
              return { ...child, sumNoti: 0 };
            }
          })
        );
        
        setChildren(childrenWithNoti);
      } catch (error) {
        console.error("Error fetching children:", error);
        setError("Không thể tải thông tin học sinh. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Sync selectedChild with URL
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const childIdFromUrl = pathSegments[3]; // e.g., "211003" in /parent/edit/211003/health-profile

    if (childIdFromUrl && children.length > 0) {
      const childFromUrl = children.find(
        (child) => child.id === childIdFromUrl
      );
      if (
        childFromUrl &&
        (!selectedChild || selectedChild.id !== childIdFromUrl)
      ) {
        setSelectedChild(childFromUrl);
        localStorage.setItem("selectedChild", JSON.stringify(childFromUrl));
      }
    }
  }, [location.pathname, children, selectedChild]);

  // Fetch dashboard stats for selected child
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!selectedChild?.id) return;
      
      try {
        const response = await axiosClient.get(`/dashboard/${selectedChild.id}/parent-dashboard`);
        setDashboardStats(response.data.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };
    
    fetchDashboard();
  }, [selectedChild?.id]);

  const handleSelectChild = useCallback((child) => {
    setSelectedChild(child);
    localStorage.setItem("selectedChild", JSON.stringify(child));
  }, []);

  return (
    <ChildContext.Provider
      value={{ children, selectedChild, handleSelectChild, isLoading, error, dashboardStats }}
    >
      <ParentDashboard />
    </ChildContext.Provider>
  );
};

// Main ParentDashboard component
const ParentDashboard = () => {
  const { children, selectedChild, handleSelectChild, isLoading, error, dashboardStats } =
    useContext(ChildContext);
  const navigate = useNavigate();

  const services = [
    {
      icon: <Syringe className="w-6 h-6 text-green-600" />,
      title: "Tiêm Chủng",
      description: "Theo dõi và cập nhật lịch tiêm chủng",
      info: dashboardStats?.surveyVaccinationPending
        ? `${dashboardStats.surveyVaccinationPending} đơn khảo sát chờ hoàn thành`
        : null,
      path: selectedChild
        ? `/parent/edit/${selectedChild.id}/vaccine-info`
        : "#",
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Khám sức khỏe định kỳ",
      description: "Lịch khám và kết quả khám định kỳ",
      info: dashboardStats?.surveyCheckupPending
        ? `${dashboardStats.surveyCheckupPending} đơn khảo sát chờ hoàn thành`
        : null,
      path: selectedChild
        ? `/parent/edit/${selectedChild.id}/regular-checkup`
        : "#",
    },
    {
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      title: "Sức khỏe hằng ngày",
      description: "Các khảo sát về tình trạng sức khỏe",
      info: dashboardStats?.dailyHealthRecordToday 
        ? `${dashboardStats.dailyHealthRecordToday} ca được ghi nhận hôm nay`
        : null,
      path: selectedChild
        ? `/parent/edit/${selectedChild.id}/health-record`
        : "#",
    },
    {
      icon: <Pill className="w-6 h-6 text-purple-600" />,
      title: "Gửi thuốc cho nhà trường",
      description: "Đăng ký và theo dõi thuốc tại trường",
      info: dashboardStats?.drugSendPending 
        ? `${dashboardStats.drugSendPending} đơn thuốc đang chờ xác nhận`
        : null,
      path: selectedChild ? `/parent/edit/${selectedChild.id}/drug-table` : "#",
    },
    {
      icon: <User2 className="w-6 h-6 text-orange-600" />,
      title: "Hồ sơ",
      description: "Xem hồ sơ, thông tin trẻ",
      path: selectedChild
        ? `/parent/edit/${selectedChild.id}/health-profile`
        : "#",
    },
    {
      icon: <MdDashboard className="w-6 h-6 text-blue-400" />,
      title: "Khai báo",
      description: "Khai báo bệnh và tiêm chủng cho học sinh",
      info: dashboardStats?.declareSendPending
        ? `${dashboardStats.declareSendPending} đơn khai báo đang chờ xác nhận`
        : null,
      path: selectedChild
        ? `/parent/edit/${selectedChild.id}/history-declare-record`
        : "#",
    },
  ];

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto my-4 px-8 shadow border border-gray-200 sm:px-6 lg:px-8 rounded-md py-8 mt-2 bg-gray-200">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trang chủ phụ huynh</h1>
            <p className="mt-2 text-gray-600">Quản lý thông tin y tế học đường cho con em</p>
          </div>
          <button
            onClick={() => navigate("/parent/schedule")}
            className="flex cursor-pointer items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Xem lịch trình
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Children List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Danh sách con em</h2>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải thông tin...</p>
                  </div>
                ) : children.length > 0 ? (
                  <div className="space-y-3">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => handleSelectChild(child)}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 relative
                          ${
                            selectedChild?.id === child.id
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }
                        `}
                        aria-label={`Chọn ${child?.name}`}
                      >
                        {child.sumNoti > 0 && (
                          <span className="absolute top-[-8px] right-[-8px] bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium z-10 shadow-sm">
                            {child.sumNoti}
                          </span>
                        )}
                        
                        <div className="flex items-center space-x-3">
                          <div
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm
                              ${
                                selectedChild?.id === child.id
                                  ? "bg-blue-500"
                                  : "bg-gray-400"
                              }
                            `}
                          >
                            {getInitials(child?.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {child?.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {child.class_name || "Chưa có thông tin lớp"}
                            </p>
                          </div>
                          {selectedChild?.id === child.id && (
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-2 text-gray-500">Không có thông tin trẻ em</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Services */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dịch vụ y tế học đường
                  {selectedChild && (
                    <span className="ml-2 text-blue-600 font-normal">
                      - {selectedChild.name}
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="p-6">
                {selectedChild ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service, index) => (
                      <a
                        key={index}
                        onClick={() => navigate(service.path)}
                        className="group cursor-pointer block p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {service.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {service.description}
                            </p>
                            {service.info && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {service.info}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Chọn trẻ em</h3>
                    <p className="mt-1 text-gray-500">
                      Vui lòng chọn một trẻ em từ danh sách bên trái để xem các dịch vụ y tế
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardWrapper;