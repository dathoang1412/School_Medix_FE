import React, { useEffect, useState } from "react";
import {
  MdOutlineSchool,
  MdOutlineMedicalInformation,
  MdMedicationLiquid,
  MdHome,
  MdHomeFilled,
  MdHomeMax,
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
  SquareActivity,
  Ambulance,
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser();
        setUserData(user);
      } catch (error) {
        error &&
          enqueueSnackbar("Không thể tải thông tin người dùng!", {
            variant: "error",
          });
      }
    };
    fetchUserData();
  }, []);

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
              title: "Quản lý Cung ứng Y tế",
              path: "#",
              icon: <Ambulance />,
              hasDropdown: true,
              children: [
                {
                  title: "Quản lý thuốc/vật tư",
                  path: "medical-items-management",
                  icon: <MdMedicationLiquid />,
                },
                {
                  title: "Xuất/nhập kho y tế",
                  path: "inventory-transaction",
                  icon: <LuSyringe />,
                },
              ],
            },
            {
              title: "Quản lý người dùng",
              icon: <User2Icon />,
              hasDropdown: true,
              children: [
                {
                  title: "Người dùng",
                  path: "user-manage",
                  icon: <User2Icon />,
                },
                {
                  title: "Hộ gia đình",
                  path: "home-manage",
                  icon: <MdHome />,
                },
              ],
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

  const [commonItems] = useState([
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
        <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm border-2 border-blue-200 flex-shrink-0">
          {userData?.profile_img_url ? (
            <img
              src={userData.profile_img_url}
              alt={userData.name || "Người dùng"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
              <User2 className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>
      ),
    },
    { title: "Đăng xuất", action: "logout", icon: <LogOut size={16} /> },
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
            w-full cursor-pointer flex items-center gap-2.5 p-2.5 rounded-lg text-left 
            transition-all duration-300 ease-out group relative
            transform hover:scale-[1.02] active:scale-[0.98]
            ${
              isChild
                ? "ml-3 pl-7 bg-gray-50/70 hover:bg-gray-100/80 border-l-2 border-gray-200"
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
            className={`text-[17px] flex-shrink-0 transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-3 ${
              isChild ? "text-sm" : ""
            }`}
          >
            {item.icon}
          </div>
          {!isCollapsed && (
            <span
              className={`font-medium leading-tight truncate flex-1 ${
                isChild ? "text-[11px]" : "text-[13px]"
              }`}
            >
              {item.title}
            </span>
          )}
          {hasDropdown && !isCollapsed && (
            <div className="text-sm">
              {isExpanded ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronRight size={15} />
              )}
            </div>
          )}
        </button>

        {hasDropdown && item.children && (
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            <div className="mt-0.5 space-y-0.5 pb-1 bg-gray-50/30 rounded-lg mx-1.5 px-1 py-1">
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
          ${isCollapsed ? "w-14" : "w-60"}
          ${isMobile && isCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div
          className={`p-2.5 border-b border-gray-200 flex items-center justify-between 
                        min-h-[52px] ${isCollapsed ? "flex-col" : "flex-row"}`}
        >
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 cursor-pointer transition-colors duration-200 group"
            title={isCollapsed ? "SchoolMedix" : ""}
          >
            <div className="flex justify-center">
              <img
                src="../../../public/Gemini_Generated_Image_yzvndbyzvndbyzvn.png" // Thay bằng đường dẫn thực tế của logo
                alt="SchoolMedix Logo"
                className="h-10 w-auto"
              />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-gray-900 text-[17px] group-hover:text-blue-600">
                SchoolMedix
              </span>
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            {isCollapsed ? <Menu size={17} /> : <X size={17} />}
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-1.5 px-1.5 overflow-y-auto scrollbar-hide">
          <div className="space-y-0.75">
            {commonItems.map((item) => renderMenuItem(item))}
          </div>

          {adminItems.length > 0 && (
            <div className="my-3 border-t border-gray-100" />
          )}

          <div className="space-y-0.75">
            {adminItems.map((item) => renderMenuItem(item))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-1.5 border-t border-gray-100 bg-gray-50/50">
          <div className="space-y-0.75">
            {bottomItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center cursor-pointer gap-2.5 p-2.5 rounded-lg text-left text-gray-600 hover:bg-white hover:text-gray-900 transition-all duration-300 ease-out group transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm"
                title={isCollapsed ? item.title : ""}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isCollapsed && (
                  <span className="font-medium text-[13px] truncate flex-1">
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
