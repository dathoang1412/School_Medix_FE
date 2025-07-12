import React, { useState, useEffect, useContext, useRef } from "react";
import { ChildContext } from "../../../layouts/ParentLayout";
import axiosClient from "../../../config/axiosClient";
import { getUser } from "../../../service/authService";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { Calendar, Syringe, Heart, ArrowLeft, Clock, AlertCircle } from "lucide-react";

// Event type styles
const eventTypeStyles = {
  vaccination: {
    icon: <Syringe className="w-4 h-4" />,
    bgColor: "#10b981",
    textColor: "text-green-800",
    bgLight: "bg-green-50",
    label: "Tiêm chủng",
  },
  checkup: {
    icon: <Heart className="w-4 h-4" />,
    bgColor: "#ef4444",
    textColor: "text-red-800",
    bgLight: "bg-red-50",
    label: "Khám định kì",
  },
};

// Utility functions
const utils = {
  getEventTypeInfo: (type) =>
    eventTypeStyles[type] || {
      icon: <Calendar className="w-4 h-4" />,
      bgColor: "#6b7280",
      textColor: "text-gray-800",
      bgLight: "bg-gray-50",
      label: "Khác",
    },

  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    let timeStatus = diffInDays === 0 ? "Hôm nay" : diffInDays === 1 ? "Mai" : diffInDays < 0 ? `${Math.abs(diffInDays)}d trước` : `Còn ${diffInDays}d`;
    return {
      formatted: date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }),
      status: timeStatus,
      isUpcoming: diffInDays >= 0 && diffInDays <= 3,
    };
  },

  getChildNames: (childIds, children) =>
    childIds.map((id) => children.find((child) => child.id === id)?.name || "?"),
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
        setError("Vui lòng đăng nhập");
        return;
      }

      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/parent/${user?.id}`);
        setChildren(res.data.data?.children || []);
      } catch (error) {
        console.error("Error fetching children:", error);
        setError("Lỗi tải học sinh");
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
        setError("Vui lòng đăng nhập");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axiosClient.get(`/schedule/${user.id}`);
        setEvents(
          response.data.data
            .filter((event) => ["vaccination", "checkup"].includes(event.type))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        );
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Lỗi tải lịch");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Scroll to today
  useEffect(() => {
    if (!isLoading && !contextLoading && todayRef.current) {
      setTimeout(() => {
        todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [isLoading, contextLoading]);

  // Separate events
  const { pastEvents, futureEvents } = events.reduce(
    (acc, event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) acc.pastEvents.push(event);
      else acc.futureEvents.push(event);
      return acc;
    },
    { pastEvents: [], futureEvents: [] }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto my-4 px-8 shadow border border-gray-200 sm:px-6 lg:px-8 rounded-md py-8 mt-2 bg-gray-200">
        {/* Header */}
        <div className="mb-3 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch y tế</h1>
            <p className="mt-2 text-gray-600 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Theo dõi lịch
            </p>
          </div>
          <button
            onClick={() => navigate("/parent")}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-8 gap-2">
          {Object.entries(eventTypeStyles).map(([type, { label, bgLight, textColor }]) => (
            <div key={type} className={`${bgLight} rounded-md p-1.5 text-xs`}>
              <p className="text-gray-900">{label}</p>
              <p className={`font-semibold ${textColor}`}>
                {events.filter((e) => e.type === type).length}
              </p>
            </div>
          ))}
        </div>

        {/* Error */}
        {(error || contextError) && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-1.5 text-xs flex items-center">
            <AlertCircle className="h-3 w-3 text-red-400 mr-1" />
            <p className="text-red-800">{error || contextError}</p>
          </div>
        )}

        {/* Timeline */}
        {(isLoading || contextLoading) ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-xs text-gray-900">Đang tải...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <VerticalTimeline layout="1-column-left" lineColor="#e5e7eb">
              {pastEvents.map((event) => {
                const { formatted, status } = utils.formatDate(event.date);
                const { icon, bgColor, bgLight, textColor, label } = utils.getEventTypeInfo(event.type);

                return (
                  <VerticalTimelineElement
                    key={event.id}
                    date={<span className="text-sm font-semibold text-gray-900">{formatted}</span>}
                    iconStyle={{ background: bgColor, color: "#fff", boxShadow: `0 0 0 2px ${bgColor}10` }}
                    icon={icon}
                    contentStyle={{ background: "white", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", opacity: 0.6 }}
                    contentArrowStyle={{ borderRight: `5px solid ${bgColor}10` }}
                    className="hover:scale-[1.01] transition-transform duration-150"
                  >
                    <div className="flex items-center gap-2 py-0.5 px-2 text-[10px]">
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex gap-1 mt-0.5">
                          <span className={`px-1 py-0.5 rounded text-[10px] font-medium ${bgLight} ${textColor}`}>
                            {label}
                          </span>
                          <span className="px-1 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">{status}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {utils.getChildNames(event.childIds, children).map((name, index) => (
                          <span key={index} className="px-1.5 py-0.5 rounded text-sm font-medium bg-blue-100 text-blue-800">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </VerticalTimelineElement>
                );
              })}
              <VerticalTimelineElement
                ref={todayRef}
                date={<span className="text-sm font-semibold text-blue-600">Hôm nay</span>}
                iconStyle={{ background: "#3b82f6", color: "#fff", boxShadow: "0 0 0 2px #3b82f620" }}
                icon={<Calendar className="w-4 h-4" />}
                contentStyle={{ background: "white", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                contentArrowStyle={{ borderRight: "5px solid #3b82f610" }}
              >
                <div className="text-center py-0.5 text-[11px]">
                  <p className="font-semibold text-blue-600">{new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" })}</p>
                </div>
              </VerticalTimelineElement>
              {futureEvents.map((event) => {
                const { formatted, status, isUpcoming } = utils.formatDate(event.date);
                const { icon, bgColor, bgLight, textColor, label } = utils.getEventTypeInfo(event.type);

                return (
                  <VerticalTimelineElement
                    key={event.id}
                    date={<span className="text-sm font-semibold text-gray-900">{formatted}</span>}
                    iconStyle={{ background: bgColor, color: "#fff", boxShadow: `0 0 0 2px ${bgColor}20` }}
                    icon={icon}
                    contentStyle={{ background: "white", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    contentArrowStyle={{ borderRight: `5px solid ${bgColor}10` }}
                    className="hover:scale-[1.01] transition-transform duration-150"
                  >
                    <div className="flex items-center gap-2 py-1 px-2 text-xs">
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex gap-1 mt-0.5">
                          <span className={`px-1 py-0.5 rounded text-[11px] font-medium ${bgLight} ${textColor}`}>
                            {label}
                          </span>
                          {isUpcoming && (
                            <span className="px-1 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">{status}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {utils.getChildNames(event.childIds, children).map((name, index) => (
                          <span key={index} className="px-1.5 py-0.5 rounded text-sm font-medium bg-blue-100 text-blue-800">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </VerticalTimelineElement>
                );
              })}
            </VerticalTimeline>
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-900 mb-1">Chưa có sự kiện</p>
            <button
              onClick={() => navigate("/parent")}
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Quay lại
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          .vertical-timeline::before {
            background: linear-gradient(to bottom, #e5e7eb 50%, #3b82f6 50%);
            width: 3px;
          }
          .vertical-timeline-element:hover .vertical-timeline-element-content {
            box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
          }
        `}
      </style>
    </div>
  );
};

export default ParentScheduleWrapper;