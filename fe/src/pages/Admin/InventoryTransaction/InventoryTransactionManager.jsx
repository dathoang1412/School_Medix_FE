import React, { useState } from "react";

// Import the four existing components
import InventoryTransactionList from "./InventoryTransactionList";
import TransactionExportList from "./TransactionExportList";
import TransactionImportList from "./TransactionImportList";
import DeletedTransactionList from "./DeletedTransactionList";

const InventoryTransactionManager = () => {
  const [selectedTab, setSelectedTab] = useState("Tất cả giao dịch");


  const tabs = [
    "Tất cả giao dịch",
    "Xuất/ Sử dụng/ Tiêu hủy",
    "Nhập/ Mua hàng",
    "Giao dịch đã xóa",
  ];

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const renderComponent = () => {
    switch (selectedTab) {
      case "Tất cả giao dịch":
        return <InventoryTransactionList />;
      case "Xuất/ Sử dụng/ Tiêu hủy":
        return <TransactionExportList />;
      case "Nhập/ Mua hàng":
        return <TransactionImportList />;
      case "Giao dịch đã xóa":
        return <DeletedTransactionList />;
      default:
        return <InventoryTransactionList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex">
      <div className="w-full max-w-6xl mx-auto">
        {/* Unified Header with Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-full flex flex-col items-center border-b border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Quản lý giao dịch kho vật tư y tế
              </h1>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      selectedTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Render Selected Component */}
        {renderComponent()}
      </div>
    </div>
  );
};

export default React.memo(InventoryTransactionManager);