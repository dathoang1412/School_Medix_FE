import React, { createContext } from "react";
import {  Outlet } from "react-router-dom";
import Header from "../components/Header";
import TabHeader from "../components/TabHeader";

const ChildContext = createContext();



const ParentLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabHeader/>
      <main className="flex-1 p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ParentLayout;
