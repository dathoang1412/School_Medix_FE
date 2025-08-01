import React from 'react';

const SendInviteConfirmModal = ({ user, onClose, onConfirm }) => {
      const handleConfirm = () => {
            onConfirm();
            onClose();
      };

      return (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Xác nhận gửi thư mời</h2>
                        <p className="mb-4">
                              Bạn có chắc chắn muốn gửi thư mời đến email {user.email || 'N/A'} không?
                        </p>
                        <div className="flex justify-end gap-2">
                              <button
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                              >
                                    Hủy
                              </button>
                              <button
                                    onClick={handleConfirm}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                    Gửi
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default SendInviteConfirmModal;