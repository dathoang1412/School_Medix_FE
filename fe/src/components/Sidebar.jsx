import {
  Settings,
  Menu,
  X,
  LogOut,
  CalendarDaysIcon,
  User2Icon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { MdOutlineSchool } from "react-icons/md";
import { MdOutlineMedicalInformation } from "react-icons/md";
import { RiHome9Line } from "react-icons/ri";
import { BsTextIndentLeft } from "react-icons/bs";
import { MdMedicationLiquid } from "react-icons/md";
import { LuLayoutDashboard, LuSyringe } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { getUser, getUserRole, removeUser } from "../service/authService";
import { enqueueSnackbar } from "notistack";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [commonItems, setCommonItems] = useState([
    { title: "Trang chủ", path: "/", icon: <RiHome9Line /> },
    {
      title: "Quản lý dặn thuốc",
      path: "send-drug",
      icon: <MdMedicationLiquid />,
    },
    {
      title: "Sức khỏe hằng ngày",
      path: "daily-health",
      icon: <CalendarDaysIcon />,
    },
  ]);

  const [adminItems, setAdminItems] = useState([
    {
      title: "Dashboard / Profile",
      path: "",
      icon: <LuLayoutDashboard />,
    },
    {
      title: "Quản lý bệnh",
      path: "/disease",
      icon: <MdOutlineMedicalInformation />,
    },
    {
      title: "Hồ sơ sức khỏe",
      path: "/health-record",
      icon: <BsTextIndentLeft />,
    },
    { title: "Tiêm chủng", path: "/vaccination", icon: <LuSyringe /> },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRole();
    if (role === "admin") {
      setAdminItems((prev) => {
        // Kiểm tra xem "Quản lý người dùng" đã tồn tại chưa
        if (!prev.some((item) => item.title === "Quản lý người dùng")) {
          return [
            ...prev,
            {
              title: "Quản lý người dùng",
              path: "user-manage",
              icon: <User2Icon />,
            },
          ];
        }
        return prev; // Không thay đổi nếu đã tồn tại
      });
    }
  }, [localStorage.getItem("user")]);

  const bottomItems = [
    { title: "Cài đặt", action: "settings", icon: <Settings /> },
    { title: "Đăng xuất", action: "logout", icon: <LogOut /> },
  ];

  const handleNavigation = (path, title) => {
    setActiveItem(title);
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  const handleAction = (action) => {
    console.log(`Action: ${action}`);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`h-screen bg-gray-100 shadow-md shadow-gray-300 border-r border-gray-200 flex flex-col transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex flex-col items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MdOutlineSchool className="text-white text-lg" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-gray-900">SchoolMedix</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-2">
        {commonItems.map((item) => (
          <button
            key={item.title}
            onClick={() => handleNavigation(item.path, item.title)}
            className={`w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-colors ${
              activeItem === item.title
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-blue-400 hover:text-gray-900"
            }`}
          >
            <div className="text-lg flex-shrink-0">{item.icon}</div>
            {!isCollapsed && <span className="font-medium">{item.title}</span>}
          </button>
        ))}
        {adminItems.map((item) => (
          <button
            key={item.title}
            onClick={() => handleNavigation(item.path, item.title)}
            className={`w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-colors ${
              activeItem === item.title
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-blue-400 hover:text-gray-900"
            }`}
          >
            <div className="text-lg flex-shrink-0">{item.icon}</div>
            {!isCollapsed && <span className="font-medium">{item.title}</span>}
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-gray-200">
        {bottomItems.map((item, index) => (
          <button
            key={item.title}
            onClick={() => {
              handleAction(item.action);
              if (index === 1) {
                removeUser();
                enqueueSnackbar("Đăng xuất thành công", { variant: "success" });
                navigate("/");
              }
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div className="text-lg flex-shrink-0">{item.icon}</div>
            {!isCollapsed && <span className="font-medium">{item.title}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;