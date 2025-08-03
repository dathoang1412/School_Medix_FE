import React, { useState } from "react";
import { enqueueSnackbar } from "notistack";

const GeneralDeleteConfirmModal = ({ textMessage, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      await onDelete();
      enqueueSnackbar("Xóa thành công!", { variant: "success" });
      onClose();
    } catch (error) {
      enqueueSnackbar(
        `Lỗi khi xóa: ${error.response?.data?.message || error.message}`,
        { variant: "error" }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Xác nhận xóa</h2>
        <p className="mb-4 text-sm text-gray-600">{textMessage}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralDeleteConfirmModal;
