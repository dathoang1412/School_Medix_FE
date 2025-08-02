import React from "react";
import { NavLink } from "react-router-dom";

const Header = ({ title }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
      <div className="flex flex-col items-center">
        <div className="w-full flex flex-col items-center border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
          <div className="flex flex-wrap gap-2 p-4">
            <NavLink
              to="/admin/inventory-transaction"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                }`
              }
            >
              Tất cả giao dịch
            </NavLink>
            <NavLink
              to="/admin/inventory-transaction/export-list"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                }`
              }
            >
              Xuất/ Sử dụng/ Tiêu hủy
            </NavLink>
            <NavLink
              to="/admin/inventory-transaction/import-list"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                }`
              }
            >
              Nhập/ Mua hàng
            </NavLink>
            <NavLink
              to="/admin/inventory-transaction/deleted-list"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                }`
              }
            >
              Giao dịch đã xóa
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Header);