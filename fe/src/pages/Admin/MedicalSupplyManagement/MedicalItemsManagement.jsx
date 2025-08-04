import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MedicineList from "./MedicineList";
import MedicalSupplyList from "./MedicalSupplyList";
import { Pill, Syringe, Users } from "lucide-react";
import SupplierList from "./SupplierList";

const MedicalItemsManagement = () => {
  const [activeTab, setActiveTab] = useState("MEDICATION");
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (tab && ["MEDICATION", "MEDICAL_SUPPLY", "SUPPLIER"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Pill className="w-8 h-8 text-blue-600 p-2 bg-blue-50 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý vật tư y tế
              </h1>
              <p className="text-gray-600">
                Xem và quản lý danh sách thuốc, vật tư y tế và nhà cung cấp
              </p>
            </div>
          </div>
          <div className="flex w-full">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setActiveTab("MEDICATION")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === "MEDICATION"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Xem danh sách thuốc"
              >
                <Pill className="w-8 h-4" />
                Thuốc
              </button>
              <button
                onClick={() => setActiveTab("MEDICAL_SUPPLY")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === "MEDICAL_SUPPLY"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Xem danh sách vật tư y tế"
              >
                <Syringe className="w-8 h-4" />
                Vật tư
              </button>
              <button
                onClick={() => setActiveTab("SUPPLIER")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === "SUPPLIER"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Xem danh sách nhà cung cấp"
              >
                <Users className="w-8 h-4" />
                Nhà cung cấp
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === "MEDICATION" ? (
            <MedicineList />
          ) : activeTab === "MEDICAL_SUPPLY" ? (
            <MedicalSupplyList />
          ) : (
            <SupplierList />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MedicalItemsManagement);