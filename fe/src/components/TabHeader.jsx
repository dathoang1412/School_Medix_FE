import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import TabHeader from "../components/TabHeader";
import { ChildContext } from "../context/ChildContext";

const ParentLayout = () => {
  const [selectedChild, setSelectedChild] = useState(
    JSON.parse(localStorage.getItem("selectedChild")) || null
  );
  const [renderKey, setRenderKey] = useState(0); // State phụ để kích hoạt render lại Outlet

  useEffect(() => {
    // Đảm bảo localStorage luôn đồng bộ với state
    if (selectedChild) {
      localStorage.setItem("selectedChild", JSON.stringify(selectedChild));
      setRenderKey(prev => prev + 1); // Cập nhật key để render lại Outlet
    } else {
      const savedChild = localStorage.getItem("selectedChild");
      if (savedChild) {
        setSelectedChild(JSON.parse(savedChild));
      }
    }
  }, [selectedChild]); // Phụ thuộc vào selectedChild thay vì localStorage

  return (
    <ChildContext.Provider value={{ selectedChild, setSelectedChild }}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <TabHeader />
        <main className="flex-1 p-4 max-w-7xl mx-auto">
          <Outlet key={renderKey} /> {/* Sử dụng key để buộc render lại */}
        </main>
      </div>
    </ChildContext.Provider>
  );
};

export default ParentLayout;