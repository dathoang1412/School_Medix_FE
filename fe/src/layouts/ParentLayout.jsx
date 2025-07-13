import React, { createContext, useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import TabHeader from "../components/TabHeader";
import axiosClient from "../config/axiosClient";
import { getUser } from "../service/authService";

export const ChildContext = createContext();

const ParentLayout = () => {
  const [selectedChild, setSelectedChild] = useState(() => {
    const savedChild = localStorage.getItem("selectedChild");
    return savedChild ? JSON.parse(savedChild) : null;
  });
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Fetch children data
  useEffect(() => {
    const fetchChildren = async () => {
      const user = getUser();
      if (!user?.id) {
        setError("Vui lòng đăng nhập để xem thông tin");
        return;
      }

      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/parent/${user?.id}`);
        setChildren(res.data.data?.children || []);
      } catch (error) {
        console.error("Error fetching children:", error);
        setError("Không thể tải thông tin học sinh. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Sync selectedChild with URL
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const childIdFromUrl = pathSegments[3]; // e.g., "211003" in /parent/edit/211003/health-profile

    if (childIdFromUrl && children.length > 0) {
      const childFromUrl = children.find(
        (child) => child.id === childIdFromUrl
      );
      if (
        childFromUrl &&
        (!selectedChild || selectedChild.id !== childIdFromUrl)
      ) {
        setSelectedChild(childFromUrl);
        localStorage.setItem("selectedChild", JSON.stringify(childFromUrl));
      }
    }
  }, [location.pathname, children, selectedChild]);

  const handleSelectChild = useCallback((child) => {
    setSelectedChild(child);
    localStorage.setItem("selectedChild", JSON.stringify(child));
  }, []);

  return (
    <ChildContext.Provider
      value={{ children, selectedChild, handleSelectChild, isLoading, error }}
    >
      <div className="min-h-screen bg-gray-50">
        <Header />
        <TabHeader />
        <main className="flex-1 p-4 max-w-7xl mx-auto">
          <Outlet key={selectedChild?.id || "no-child"} />
        </main>
      </div>
    </ChildContext.Provider>
  );
};

export default ParentLayout;
