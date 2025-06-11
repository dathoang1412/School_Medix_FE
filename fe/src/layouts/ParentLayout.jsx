import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../components/Header";

const menu = [
  {
    label: "Thông tin cá nhân",
    to: "/parent/edit/general-information",
  },
  {
    label: "Thông tin tiêm chủng",
    to: "/parent/edit/vaccine-info",
  },
  {
    label: "Khám sức khỏe định kỳ",
    to: "/parent/edit/health-check",
  },
  {
    label: "Gửi thuốc cho nhà trường",
    to: "/parent/edit/send-drug",
  },
    {
    label: "Hồ sơ sức khỏe",
    to: "/parent/edit/health-record",
  },
];

const ParentLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Horizontal menu bar */}
      <nav className="w-full bg-white border-b border-gray-200 shadow-sm pt-30">
        <p>Thông tin của ...</p>
        <div className="max-w-7xl mx-auto flex gap-2 px-2 sm:px-4">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-t transition font-medium ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-700 hover:bg-blue-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      {/* Main content */}
      <main className="flex-1 p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ParentLayout;
