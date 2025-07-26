import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Truck } from "lucide-react";

const MedicalDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Quản lý vật tư y tế và nhà cung cấp</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/medical/medical-items")}
            className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quản lý vật tư / thuốc</h2>
              <p className="text-sm text-gray-600">Xem, thêm, chỉnh sửa vật tư y tế và thuốc</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/medical/suppliers")}
            className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Truck className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quản lý nhà cung cấp</h2>
              <p className="text-sm text-gray-600">Xem, thêm, chỉnh sửa thông tin nhà cung cấp</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;