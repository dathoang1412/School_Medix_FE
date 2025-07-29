import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MedicineList from "./MedicineList";
import MedicalSupplyList from "./MedicalSupplyList";
import SupplierManagement from "./SupplierManagement";
import { Pill, Syringe, Users } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 w-full flex justify-center">
      <div className="max-w-7xl ">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center border-b border-gray-200 p-2">
              <button
                onClick={() => setActiveTab("MEDICATION")}
                className={`flex cursor-pointer items-center gap-2 px-6 py-2 text-sm font-medium transition-colors duration-200 ease-in-out mr-2 ${
                  activeTab === "MEDICATION"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-label="Xem danh sách thuốc"
              >
                <Pill className="w-5 h-5" />
                Thuốc
              </button>
              <button
                onClick={() => setActiveTab("MEDICAL_SUPPLY")}
                className={`flex cursor-pointer items-center gap-2 px-6 py-2 text-sm font-medium transition-colors duration-200 ease-in-out mr-2 ${
                  activeTab === "MEDICAL_SUPPLY"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-label="Xem danh sách vật tư y tế"
              >
                <Syringe className="w-5 h-5" />
                Vật tư
              </button>
              <button
                onClick={() => setActiveTab("SUPPLIER")}
                className={`flex cursor-pointer items-center gap-2 px-6 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                  activeTab === "SUPPLIER"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-label="Xem danh sách nhà cung cấp"
              >
                <Users className="w-5 h-5" />
                Nhà cung cấp
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
          {activeTab === "MEDICATION" ? (
            <MedicineList />
          ) : activeTab === "MEDICAL_SUPPLY" ? (
            <MedicalSupplyList />
          ) : (
            <SupplierManagement />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MedicalItemsManagement);
