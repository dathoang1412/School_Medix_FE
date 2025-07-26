import React, { useState } from "react";
import MedicineList from "./MedicineList";
import MedicalSupplyList from "./MedicalSupplyList";
import { Pill, Syringe } from "lucide-react";

const MedicalItemsList = () => {
  const [activeTab, setActiveTab] = useState("MEDICATION");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("MEDICATION")}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 ease-in-out mr-2 ${
                  activeTab === "MEDICATION"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-label="Xem danh sách thuốc"
              >
                <Pill className="w-5 h-5" />
                Thuốc
              </button>
              <button
                onClick={() => setActiveTab("MEDICAL_SUPPLY")}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                  activeTab === "MEDICAL_SUPPLY"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-label="Xem danh sách vật tư y tế"
              >
                <Syringe className="w-5 h-5" />
                Vật tư
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {activeTab === "MEDICATION" ? <MedicineList /> : <MedicalSupplyList />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MedicalItemsList);