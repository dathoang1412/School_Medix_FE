import React, { useEffect, useState } from "react";
import {
  MdOutlineSchool,
  MdOutlineMedicalInformation,
  MdMedicationLiquid,
} from "react-icons/md";
import { RiHome9Line } from "react-icons/ri";
import { BsTextIndentLeft } from "react-icons/bs";
import { LuLayoutDashboard, LuNewspaper, LuSyringe } from "react-icons/lu";
import { FaStethoscope, FaVial } from "react-icons/fa";
import {
  Settings,
  Menu,
  X,
  LogOut,
  CalendarDaysIcon,
  User2Icon,
  User2,
  ChevronDown,
  ChevronRight,
  Newspaper,
  PencilLineIcon,
  SquareActivity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser, getUserRole, removeUser } from "../service/authService";
import { enqueueSnackbar } from "notistack";
import { signOut } from "../config/Supabase";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const [isMobile, setIsMobile] = useState(false);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser();
        setUserData(user);
      } catch (error) {
        enqueueSnackbar("Không thể tải thông tin người dùng!", {
          variant: "error",
        });
      }
    };

    fetchUserData();
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update admin items based on role
  useEffect(() => {
    const role = getUserRole();
    if (role === "admin") {
      setAdminItems((prev) => {
        const hasUserManagement = prev.some(
          (item) => item.title === "Quản lý người dùng"
        );
        if (!hasUserManagement) {
          return [
            ...prev,
            {
              title: "Quản lý người dùng",
              path: "user-manage",
              icon: <User2Icon />,
            },
            {
              title: "Quản lý Blog",
              path: "blog",
              icon: <LuNewspaper />,
            },
          ];
        }
        return prev;
      });
    }
  }, []);

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
    {
      title: "Quản lý Khai Báo",
      path: "DeclarationManagement",
      icon: <PencilLineIcon />,
    },
  ]);

  const [adminItems, setAdminItems] = useState([
    {
      title: "Dashboard",
      path: "",
      icon: <LuLayoutDashboard />,
    },
    {
      title: "Hồ sơ bệnh",
      path: "disease",
      icon: <MdOutlineMedicalInformation />,
      hasDropdown: true,
      children: [
        {
          title: "Quản lý bệnh",
          path: "#",
          icon: <SquareActivity/>
        },
        {
          title: "Quản lý hồ sơ bệnh",
          path: "disease",
          icon: <MdOutlineMedicalInformation size={25}/>
        },
      ]
    },
    {
      title: "Khám định kỳ",
      path: "regular-checkup",
      icon: <BsTextIndentLeft />,
      hasDropdown: true,
      children: [
        {
          title: "Quản lý chuyên khoa",
          path: "regular-checkup/specialty-management",
          icon: <FaStethoscope />,
        },
        {
          title: "Khám định kỳ",
          path: "regular-checkup",
          icon: <CalendarDaysIcon />,
        },
      ],
    },
    {
      title: "Kế hoạch tiêm chủng",
      path: "vaccine-campaign",
      icon: <LuSyringe />,
      hasDropdown: true,
      children: [
        {
          title: "Quản lý vaccine",
          path: "vaccine-campaign/vaccine-management",
          icon: <FaVial />,
        },
        {
          title: "Kế hoạch tiêm chủng",
          path: "vaccine-campaign",
          icon: <LuSyringe />,
        },
      ],
    },
  ]);

  const bottomItems = [
    {
      action: "profile",
      title: getUserRole().toString().toUpperCase(),
      icon: (
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border-2 border-blue-200 flex-shrink-0">
          {userData?.profile_img_url ? (
            <img
              src={userData.profile_img_url}
              alt={userData.name || "Người dùng"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
              <User2 className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </div>
      ),
    },
    { title: "Đăng xuất", action: "logout", icon: <LogOut /> },
  ];

  const toggleDropdown = (title) => {
    setExpandedDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleNavigation = (path, title, parentTitle = null) => {
    setActiveItem(title);
    if (parentTitle) {
      setExpandedDropdowns((prev) => ({
        ...prev,
        [parentTitle]: true,
      }));
    }
    navigate(path);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const handleAction = async (action) => {
    if (action === "logout") {
      removeUser();
      await signOut();
      enqueueSnackbar("Đăng xuất thành công", {
        variant: "success",
      });
      navigate("/");
    } else if (action === "profile") {
      navigate("/profile");
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedDropdowns({});
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const renderMenuItem = (item, isChild = false, parentTitle = null) => {
    const isActive = activeItem === item.title;
    const hasDropdown = item.hasDropdown && !isCollapsed;
    const isExpanded = expandedDropdowns[item.title];
    const hasActiveChild = item.children?.some(
      (child) => activeItem === child.title
    );
    const shouldHighlightParent = isActive || hasActiveChild;

    return (
      <div key={item.title}>
        <button
          onClick={() => {
            if (hasDropdown) {
              toggleDropdown(item.title);
            } else {
              handleNavigation(item.path, item.title, parentTitle);
            }
          }}
          className={`
            w-full cursor-pointer flex items-center gap-3 p-3 rounded-xl text-left 
            transition-all duration-300 ease-out group relative
            transform hover:scale-[1.02] active:scale-[0.98]
            ${
              isChild
                ? "ml-4 pl-8 bg-gray-50/70 hover:bg-gray-100/80 border-l-2 border-gray-200"
                : ""
            }
            ${
              isActive || (!isChild && hasActiveChild)
                ? isChild
                  ? "bg-gradient-to-r from-blue-50/80 to-blue-100/80 text-blue-700 shadow-sm scale-[1.02] border-l-blue-300"
                  : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm scale-[1.02]"
                : isChild
                ? "text-gray-500 hover:text-gray-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
            }
          `}
          title={isCollapsed ? item.title : ""}
        >
          <div
            className={`text-lg flex-shrink-0 transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-3 ${
              isChild ? "text-base" : ""
            }`}
          >
            {item.icon}
          </div>
          {!isCollapsed && (
            <span
              className={`font-medium leading-tight truncate flex-1 ${
                isChild ? "text-xs" : "text-sm"
              }`}
            >
              {item.title}
            </span>
          )}
          {hasDropdown && !isCollapsed && (
            <div className="text-sm">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>
          )}
        </button>

        {hasDropdown && item.children && (
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            <div className="mt-1 space-y-1 pb-1 bg-gray-50/30 rounded-lg mx-2 px-1 py-2">
              {item.children.map((child, index) => (
                <div
                  key={child.title}
                  className={`
                    transform transition-all duration-300 ease-out
                    ${
                      isExpanded
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: isExpanded ? `${index * 50}ms` : "0ms",
                  }}
                >
                  {renderMenuItem(child, true, item.title)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <div
        className={`
          ${isMobile ? "fixed" : "relative"} 
          ${isMobile ? "z-50" : "z-10"}
          h-screen bg-white shadow-lg border-r border-gray-200 
          flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-16" : "w-64"}
          ${isMobile && isCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div
          className={`p-3 border-b border-gray-200 flex items-center justify-between 
                        min-h-[60px] ${isCollapsed ? "flex-col" : "flex-row"}`}
        >
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer transition-colors duration-200 group"
            title={isCollapsed ? "SchoolMedix" : ""}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm group-hover:from-blue-500 group-hover:to-blue-600">
              <MdOutlineSchool className="text-white text-lg" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600">
                SchoolMedix
              </span>
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-2 px-2 overflow-y-auto scrollbar-hide">
          {/* Common Items */}
          <div className="space-y-1">
            {commonItems.map((item) => renderMenuItem(item))}
          </div>

          {/* Divider */}
          {adminItems.length > 0 && (
            <div className="my-4 border-t border-gray-100" />
          )}

          {/* Admin Items */}
          <div className="space-y-1">
            {adminItems.map((item) => renderMenuItem(item))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-gray-100 bg-gray-50/50">
          <div className="space-y-1">
            {bottomItems.map((item, index) => (
              <button
                key={item.title}
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center cursor-pointer gap-3 p-3 rounded-xl text-left text-gray-600 hover:bg-white hover:text-gray-900 transition-all duration-300 ease-out group transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm"
                title={isCollapsed ? item.title : ""}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate flex-1">
                    {item.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;