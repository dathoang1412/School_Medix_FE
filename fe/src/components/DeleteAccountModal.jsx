import React from "react";

const DeleteAccountModal = ({ email, onClose, onConfirm }) => {
      const restrictedEmails = [
            "mndkhanh@gmail.com",
            "mndkhanh3@gmail.com",
            "coccamco.fpthcm@gmail.com",
            "thuandntse150361@fpt.edu.vn",
            "dinhviethieu2910@gmail.com",
            "toannangcao3000@gmail.com",
            "phamthanhqb2005@gmail.com",
            "dathtse196321@gmail.com",
            "mndkhanh.alt3@gmail.com",
            "mndkhanh.alt@gmail.com",
      ];

      return (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Xác nhận xóa</h2>
                        <p className="mb-4">
                              Bạn có chắc chắn muốn xóa tài khoản cho email <strong>{email || "không xác định"}</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                              <button
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                              >
                                    Hủy
                              </button>
                              <button
                                    onClick={onConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                    Xóa
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default DeleteAccountModal;