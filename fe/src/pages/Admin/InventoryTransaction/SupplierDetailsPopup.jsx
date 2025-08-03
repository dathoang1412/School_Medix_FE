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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Chi tiết nhà cung cấp</h4>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Thông tin nhà cung cấp</h5>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <div><span className="font-bold mr-2">Tên:</span> {supplier.name || "Không có"}</div>
              <div><span className="font-bold mr-2">Mô tả:</span> {supplier.description || "Không có"}</div>
              <div><span className="font-bold mr-2">Địa chỉ:</span> {supplier.address || "Không có"}</div>
              <div><span className="font-bold mr-2">Số điện thoại:</span> {supplier.phone || "Không có"}</div>
              <div><span className="font-bold mr-2">Email:</span> {supplier.email || "Không có"}</div>
              <div><span className="font-bold mr-2">Người liên hệ:</span> {supplier.contact_person || "Không có"}</div>
              <div><span className="font-bold mr-2">Mã số thuế:</span> {supplier.tax_code || "Không có"}</div>
              <div>
                <span className="font-bold mr-2">Trạng thái:</span>{" "}
                <span className={status.color}>{status.text}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailsPopup;