import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const ParentLayout = () => {
  return (
    <div>
      <Header />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ParentLayout;
