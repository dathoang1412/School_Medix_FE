import { User, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdDashboardCustomize, MdOutlineSchool } from "react-icons/md";
import { getUser, getUserRole, removeUser } from "../service/authService";
import { enqueueSnackbar } from "notistack";
import { useState, useRef, useEffect } from "react";
import { signOut } from "../config/Supabase";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const user = getUser();
  const isLoggedIn = !!user;
  const userRole = getUserRole();

  const menuItems = [
    { title: "Trang chủ", path: "/" },
    { title: "Giới thiệu", path: "/about" },
    { title: "Dashboard", path: `/${userRole || 'admin'}` },
    { title: "Blog", path: "/blog" },
    { title: "Profile", path: "/profile" },
,
  ];

  const userMenuItems = [
    { title: "Dashboard", path: `/${userRole || 'admin'}`, icon: MdDashboardCustomize },
    { title: "Profile", path: "/notifications", icon: User },
    { 
      title: "Đăng xuất", 
      action: handleLogout,
      icon: LogOut,
      variant: "danger"
    },
  ];

  async function handleLogout() {
    await signOut();
    removeUser();
    navigate("/");
    enqueueSnackbar("Đăng xuất thành công", { variant: "success" });
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleUserClick = () => {
    if (isLoggedIn) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      navigate("/login");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine if a menu item is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavigation("/")}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-10 h-10 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
              <MdOutlineSchool className="text-xl" />
            </div>
            <span className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              SchoolMedix
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-4 cursor-pointer py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </nav>

          {/* User Actions & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* User Section */}
            <div className="relative" ref={dropdownRef}>
              {isLoggedIn ? (
                <div className="flex items-center">
                  <button
                    onClick={handleUserClick}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border-2 border-blue-200">
                      {user?.profile_img_url ? (
                        <img
                          src={user.profile_img_url}
                          alt={user.name || "Người dùng"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {user?.name || "Người dùng"}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 cursor-pointer py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                >
                  Đăng nhập
                </button>
              )}

              {/* User Dropdown Menu */}
              {isLoggedIn && isDropdownOpen && (
                <div className="absolute cursor-pointer right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-blue-200">
                        {user?.profile_img_url ? (
                          <img
                            src={user.profile_img_url}
                            alt={user.name || "Người dùng"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.name || "Người dùng"}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {userRole || "admin"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.title}
                          onClick={() => item.action ? item.action() : handleNavigation(item.path)}
                          className={`flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors duration-200 ${
                            item.variant === "danger"
                              ? "text-red-600 hover:bg-red-50"
                              : `text-gray-700 hover:bg-gray-50 ${
                                  isActive(item.path) ? "bg-blue-50 text-blue-600" : ""
                                }`
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3">
              {/* Main Menu Items */}
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleNavigation(item.path)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              
              {/* Mobile User Menu */}
              {isLoggedIn && (
                <div className="border-t border-gray-200 mt-3 pt-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border-2 border-blue-200">
                      {user?.profile_img_url ? (
                        <img
                          src={user.profile_img_url}
                          alt={user.name || "Người dùng"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.name || "Người dùng"}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {userRole || "admin"}
                      </div>
                    </div>
                  </div>

                  {/* User Menu Items */}
                  <div className="space-y-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.title}
                          onClick={() => item.action ? item.action() : handleNavigation(item.path)}
                          className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg text-sm font-medium transition-colors duration-200 ${
                            item.variant === "danger"
                              ? "text-red-600 hover:bg-red-50"
                              : isActive(item.path)
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;