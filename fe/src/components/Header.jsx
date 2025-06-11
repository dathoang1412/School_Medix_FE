import React, { useState } from "react";
import { User, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MdOutlineLogout, MdOutlineSchool } from "react-icons/md";
import { getUser, removeUser } from "../service/authService";
import { enqueueSnackbar } from "notistack";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { title: "Trang chủ", path: "/" },
    { title: "Hồ sơ sức khỏe", path: "/health-record" },
    { title: "Quản lý thuốc", path: "/medicine" },
    { title: "Tiêm chủng", path: "/vaccination" },
    { title: "Kiểm tra y tế", path: "/health-check" },
    { title: "Báo cáo", path: "/reports" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigation("/")}
          >
            <div className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg">
              <MdOutlineSchool className="text-white text-lg" />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              SchoolMedix
            </span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                className="text-gray-700 cursor-pointer hover:text-blue-600 transition"
              >
                {item.title}
              </button>
            ))}
          </nav>

          {/* User icon & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={() => {
                if (getUser()) {
                  navigate('/' + getUser()?.app_metadata?.role);
                } else {
                  navigate("/login");
                }
              }}
              className="text-gray-700 cursor-pointer hover:text-blue-600 transition"
            >
              {localStorage.getItem("user") ? (
                <div className="flex gap-2 bg-green-400 shadow-md shadow-gray-600 rounded-md p-2 items-center justify-center">
                  {getUser()?.user_metadata?.name}
                </div>
              ) : (
                <>Đăng nhập</>
              )}
            </button>
            {getUser() && (
              <MdOutlineLogout
                onClick={() => {
                  removeUser();
                  navigate("/");
                  enqueueSnackbar("Đăng xuất thành công", { variant: "success" });
                }}
                className="text-4xl cursor-pointer p-2 text-white bg-blue-600 rounded-md"
              />
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 py-2 bg-white border-t shadow">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                className="block w-full text-left py-2 text-gray-700 hover:text-blue-600"
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
