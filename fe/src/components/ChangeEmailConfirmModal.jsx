import React from 'react';

const ChangeAccountConfirmModal = ({ user, onClose, onConfirm }) => {
      const handleConfirm = () => {
            onConfirm();
            onClose();
      };

      return (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Xác nhận thay đổi tài khoản</h2>
                        <p className="mb-4">
                              Thay đổi email sẽ làm cho quá trình truy cập của người dùng thay đổi. Bạn có muốn tiếp tục?
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
                                    Xác nhận
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default ChangeAccountConfirmModal;