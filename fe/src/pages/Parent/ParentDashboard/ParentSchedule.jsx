import React, { useState, useEffect, useContext, useRef } from "react";
import { ChildContext } from "../../../layouts/ParentLayout";
import axiosClient from "../../../config/axiosClient";
import { getUser } from "../../../service/authService";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { Calendar, Syringe, Heart, ArrowLeft, Clock, AlertCircle, CalendarDays } from "lucide-react";

// Event type configuration
const eventTypeStyles = {
  vaccination: {
    icon: <Syringe className="w-5 h-5" />,
    bgColor: "#059669",
    textColor: "text-emerald-700",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    label: "Tiêm chủng",
  },
  checkup: {
    icon: <Heart className="w-5 h-5" />,
    bgColor: "#dc2626",
    textColor: "text-red-700",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    label: "Khám định kỳ",
  },
};

// Utility functions
const utils = {
  getEventTypeInfo: (type) =>
    eventTypeStyles[type] || {
      icon: <CalendarDays className="w-5 h-5" />,
      bgColor: "#6b7280",
      textColor: "text-gray-700",
      bgLight: "bg-gray-50",
      borderColor: "border-gray-200",
      label: "Khác",
    },

  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    let timeStatus = diffInDays === 0 
      ? "Hôm nay" 
      : diffInDays === 1 
      ? "Mai" 
      : diffInDays < 0 
      ? `${Math.abs(diffInDays)} ngày trước` 
      : `Còn ${diffInDays} ngày`;
    
    return {
      formatted: date.toLocaleString("vi-VN", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      shortDate: date.toLocaleDateString("vi-VN", { 
        day: "2-digit", 
        month: "2-digit" 
      }),
      status: timeStatus,
      isUpcoming: diffInDays >= 0 && diffInDays <= 3,
      isPast: diffInDays < 0,
    };
  },

  getChildNames: (childIds, children) =>
    childIds.map((id) => children.find((child) => child.id === id)?.name || "Không xác định"),
};

// Wrapper component
const ParentScheduleWrapper = () => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      const user = getUser();
      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem lịch");
        return;
      }

      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/parent/${user?.id}`);
        setChildren(res.data.data?.children || []);
      } catch (error) {
        console.error("Error fetching children:", error);
        setError("Không thể tải thông tin học sinh");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  return (
    <ChildContext.Provider value={{ children, isLoading, error }}>
      <ParentSchedule />
    </ChildContext.Provider>
  );
};

// Main component
const ParentSchedule = () => {
  const { children, isLoading: contextLoading, error: contextError } = useContext(ChildContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const todayRef = useRef(null);

  // Fetch schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      const user = getUser();
      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem lịch");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axiosClient.get(`/schedule/${user.id}`);
        console.log("Schedule: ", response.data.data);
        setEvents(
          response.data.data
            .filter((event) => ["vaccination", "checkup"].includes(event.type))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        );
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Không thể tải lịch y tế");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Auto scroll to today
  useEffect(() => {
    if (!isLoading && !contextLoading && todayRef.current && events.length > 0) {
      setTimeout(() => {
        todayRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }, 300);
    }
  }, [isLoading, contextLoading, events.length]);

  // Separate events by time
  const { pastEvents, futureEvents } = events.reduce(
    (acc, event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        acc.pastEvents.push(event);
      } else {
        acc.futureEvents.push(event);
      }
      return acc;
    },
    { pastEvents: [], futureEvents: [] }
  );

  const totalUpcoming = futureEvents.filter(event => 
    utils.formatDate(event.date).isUpcoming
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch Y Tế</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1 text-sm">
                  <Clock className="w-4 h-4" />
                  Theo dõi lịch trình sức khỏe của con
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/parent")}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {Object.entries(eventTypeStyles).map(([type, { label, bgLight, textColor, icon }]) => {
              const count = events.filter((e) => e.type === type).length;
              return (
                <div key={type} className={`${bgLight} rounded-lg p-3 border border-gray-200`}>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600">
                      {React.cloneElement(icon, { className: "w-4 h-4" })}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{label}</p>
                      <p className={`text-lg font-bold ${textColor}`}>{count}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-xs text-gray-600">Sắp tới</p>
                  <p className="text-lg font-bold text-amber-700">{totalUpcoming}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || contextError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-800 text-sm font-medium">{error || contextError}</p>
            </div>
          </div>
        )}

        {/* Timeline Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {(isLoading || contextLoading) ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600 text-sm">Đang tải lịch y tế...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="p-6">
              <VerticalTimeline layout="1-column-left" lineColor="#e2e8f0">
                {/* Past Events */}
                {pastEvents.map((event) => {
                  const { formatted, shortDate, status, isPast } = utils.formatDate(event.date);
                  const { icon, bgColor, bgLight, textColor, label } = utils.getEventTypeInfo(event.type);

                  return (
                    <VerticalTimelineElement
                      key={event.id}
                      date={
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{shortDate}</div>
                          <div className="text-xs text-gray-500">{status}</div>
                        </div>
                      }
                      iconStyle={{ 
                        background: bgColor, 
                        color: "#fff", 
                        boxShadow: `0 4px 12px ${bgColor}30`,
                        border: `3px solid ${bgColor}20`
                      }}
                      icon={icon}
                      contentStyle={{ 
                        background: "white", 
                        borderRadius: "8px", 
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                        border: "1px solid #e5e7eb",
                        opacity: isPast ? 0.7 : 1
                      }}
                      contentArrowStyle={{ borderRight: `7px solid #f9fafb` }}
                      className="hover:scale-[1.01] transition-all duration-150"
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">{event.title}</h3>
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bgLight} ${textColor} border border-gray-200`}>
                                {React.cloneElement(icon, { className: "w-3 h-3" })}
                                {label}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Thời gian</div>
                            <div className="text-xs font-medium text-gray-900">{formatted}</div>
                          </div>
                        </div>
                        
                        {event.childIds && event.childIds.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Học sinh</div>
                            <div className="flex flex-wrap gap-1">
                              {utils.getChildNames(event.childIds, children).map((name, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </VerticalTimelineElement>
                  );
                })}

                {/* Today Marker */}
                <VerticalTimelineElement
                  ref={todayRef}
                  date={
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">Hôm nay</div>
                      <div className="text-xs text-blue-500">
                        {new Date().toLocaleDateString("vi-VN", { 
                          day: "2-digit", 
                          month: "2-digit" 
                        })}
                      </div>
                    </div>
                  }
                  iconStyle={{ 
                    background: "#3b82f6", 
                    color: "#fff",
                    boxShadow: "0 4px 8px rgba(59, 130, 246, 0.2)",
                    border: "2px solid rgba(59, 130, 246, 0.1)"
                  }}
                  icon={<Calendar className="w-4 h-4" />}
                  contentStyle={{ 
                    background: "#f0f9ff", 
                    borderRadius: "8px", 
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #bfdbfe"
                  }}
                  contentArrowStyle={{ borderRight: "7px solid #f0f9ff" }}
                >
                  <div className="text-center py-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-semibold text-blue-900 text-sm">
                      {new Date().toLocaleDateString("vi-VN", { 
                        weekday: "long",
                        day: "numeric", 
                        month: "long", 
                        year: "numeric" 
                      })}
                    </p>
                    <p className="text-blue-700 text-xs mt-1">Ngày hiện tại</p>
                  </div>
                </VerticalTimelineElement>

                {/* Future Events */}
                {futureEvents.map((event) => {
                  const { formatted, shortDate, status, isUpcoming } = utils.formatDate(event.date);
                  const { icon, bgColor, bgLight, textColor, label } = utils.getEventTypeInfo(event.type);

                  return (
                    <VerticalTimelineElement
                      key={event.id}
                      date={
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{shortDate}</div>
                          <div className="text-xs text-gray-500">{status}</div>
                        </div>
                      }
                      iconStyle={{ 
                        background: bgColor, 
                        color: "#fff", 
                        boxShadow: `0 4px 12px ${bgColor}30`,
                        border: `3px solid ${bgColor}20`
                      }}
                      icon={icon}
                      contentStyle={{ 
                        background: isUpcoming ? "#fffbeb" : "white", 
                        borderRadius: "8px", 
                        boxShadow: isUpcoming ? "0 4px 8px rgba(245, 158, 11, 0.1)" : "0 2px 4px rgba(0, 0, 0, 0.05)",
                        border: isUpcoming ? "2px solid #f59e0b" : "1px solid #e5e7eb"
                      }}
                      contentArrowStyle={{ 
                        borderRight: isUpcoming ? "7px solid #fffbeb" : "7px solid #f9fafb" 
                      }}
                      className="hover:scale-[1.01] transition-all duration-150"
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-semibold text-gray-900">{event.title}</h3>
                              {isUpcoming && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  SẮP TỚI
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bgLight} ${textColor} border border-gray-200`}>
                                {React.cloneElement(icon, { className: "w-3 h-3" })}
                                {label}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Thời gian</div>
                            <div className="text-xs font-medium text-gray-900">{formatted}</div>
                          </div>
                        </div>
                        
                        {event.childIds && event.childIds.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Học sinh</div>
                            <div className="flex flex-wrap gap-1">
                              {utils.getChildNames(event.childIds, children).map((name, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </VerticalTimelineElement>
                  );
                })}
              </VerticalTimeline>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch y tế</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md text-sm">
                Hiện tại chưa có sự kiện y tế nào được lên lịch. Vui lòng liên hệ nhà trường để biết thêm thông tin.
              </p>
              <button
                onClick={() => navigate("/parent")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại trang chính
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Timeline Styles */}
      <style jsx>{`
        .vertical-timeline::before {
          background: #e2e8f0;
          width: 3px;
        }
        
        .vertical-timeline-element:hover .vertical-timeline-element-content {
          transform: translateY(-1px);
        }
        
        .vertical-timeline-element-content::before {
          border-right-color: transparent !important;
        }
        
        @media (max-width: 768px) {
          .vertical-timeline::before {
            left: 40px;
          }
          
          .vertical-timeline-element-content {
            margin-left: 70px;
          }
          
          .vertical-timeline-element-date {
            position: static !important;
            float: none !important;
            margin-top: 1rem;
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentScheduleWrapper;