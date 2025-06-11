import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="pt-4 pl-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
