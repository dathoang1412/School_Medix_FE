import React from "react";
import { X } from "lucide-react";

const SupplierDetailsPopup = ({ isOpen, onClose, supplier }) => {
  if (!isOpen || !supplier) return null;

  // Determine status text and color
  const getStatusDisplay = () => {
    if (supplier.status === "ACTIVE") {
      return { text: "Đang hoạt động", color: "text-green-600" };
    } else if (supplier.status === "INACTIVE") {
      return { text: "Đã ngừng hoạt động", color: "text-red-600" };
    } else {
      return { text: "Không xác định", color: "text-yellow-600" };
    }
  };

  const status = getStatusDisplay();

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-1/2 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold text-gray-900">Chi tiết nhà cung cấp</h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Đóng"
          >
            <X size={24} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Thông tin nhà cung cấp</h5>
            <dl className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Tên:</dt>
                <dd className="w-2/3">{supplier.name || "Không có"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Mô tả:</dt>
                <dd className="w-2/3">{supplier.description || "Không có"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Địa chỉ:</dt>
                <dd className="w-2/3">{supplier.address || "Không có"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Số điện thoại:</dt>
                <dd className="w-2/3">{supplier.phone || "Không có"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Email:</dt>
                <dd className="w-2/3">{supplier.email || "Không có"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Người liên hệ:</dt>
                <dd className="w-2/3">{supplier.contact_person || "Không có"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Mã số thuế:</dt>
                <dd className="w-2/3">{supplier.tax_code || "Không có"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="font-medium text-gray-900 w-1/3">Trạng thái:</dt>
                <dd className={`w-2/3 font-medium ${status.color}`}>{status.text}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailsPopup;