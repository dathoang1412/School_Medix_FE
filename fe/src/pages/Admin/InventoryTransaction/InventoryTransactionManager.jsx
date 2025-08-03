import React, { useState } from "react";
import InventoryTransactionList from "./InventoryTransactionList";
import TransactionExportList from "./TransactionExportList";
import TransactionImportList from "./TransactionImportList";
import DeletedTransactionList from "./DeletedTransactionList";
import { Package, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

const InventoryTransactionManager = () => {
  const [selectedTab, setSelectedTab] = useState("Tất cả giao dịch");

  const tabs = [
    { name: "Tất cả giao dịch", icon: Package },
    { name: "Xuất/ Sử dụng/ Tiêu hủy", icon: ArrowUp },
    { name: "Nhập/ Mua hàng", icon: ArrowDown },
    { name: "Giao dịch đã xóa", icon: Trash2 },
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Package className="w-8 h-8 text-blue-600 p-2 bg-blue-50 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý giao dịch kho vật tư y tế
              </h1>
              <p className="text-gray-600">
                Xem và quản lý các giao dịch nhập, xuất, sử dụng, tiêu hủy và giao dịch đã xóa
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab.name)}
                  style={{borderRight: '1px solid #ccc'}}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                    selectedTab === tab.name
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-label={`Xem ${tab.name.toLowerCase()}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(InventoryTransactionManager);