import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Calendar,
  Package,
  Search,
  Plus,
  Users,
  Edit,
  X,
} from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import Modal from "../MedicalSupplyManagement/Modal"; // Adjust the import path
import SupplierDetailsPopup from "./SupplierDetailsPopup"; // Adjust the import path

const TransactionImportList = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isSupplierPopupOpen, setIsSupplierPopupOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/import-inventory-transaction");
        if (response.data.error) throw new Error(response.data.message);
        setTransactions(response.data.data);
        setFilteredTransactions(response.data.data);
      } catch (err) {
        err && setError("Không thể tải danh sách giao dịch nhập.");
        enqueueSnackbar("Không thể tải danh sách giao dịch nhập.", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [enqueueSnackbar]);

  useEffect(() => {
    let result = [...transactions];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (transaction) =>
          (transaction.supplier_name &&
            transaction.supplier_name.toLowerCase().includes(lowerSearch)) ||
          (transaction.purpose_title &&
            transaction.purpose_title.toLowerCase().includes(lowerSearch)) ||
          new Date(transaction.transaction_date)
            .toLocaleDateString("vi-VN")
            .toLowerCase()
            .includes(lowerSearch)
      );
    }
    setFilteredTransactions(result);
  }, [searchTerm, transactions]);

  const openModal = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
  };

  const openDeleteModal = (id, purpose_title, supplier_name) => {
    setTransactionToDelete({ id, purpose_title, supplier_name });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const response = await axiosClient.delete(
        `/inventory-transaction/${transactionToDelete.id}`
      );
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== transactionToDelete.id)
      );
      setFilteredTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== transactionToDelete.id)
      );
      enqueueSnackbar("Xóa giao dịch nhập thành công.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err.message || "Lỗi khi xóa giao dịch nhập.", {
        variant: "error",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleSupplierClick = async (supplierId, supplierName) => {
    if (!supplierId) {
      enqueueSnackbar("Không có thông tin nhà cung cấp để hiển thị.", {
        variant: "warning",
      });
      return;
    }

    try {
      const response = await axiosClient.get(`/supplier/${supplierId}`, {
        validateStatus: () => true,
      });
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      setSelectedSupplier(response.data.data);
      setIsSupplierPopupOpen(true);
    } catch (err) {
      enqueueSnackbar(err.message || "Lỗi khi lấy thông tin nhà cung cấp.", {
        variant: "error",
      });
    }
  };

  const closeSupplierPopup = () => {
    setIsSupplierPopupOpen(false);
    setSelectedSupplier(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center border border-gray-200">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex">
      <div className="w-full mx-auto">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col mb-6">
              <div className="flex gap-3 items-center">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    placeholder="Tìm kiếm giao dịch nhập"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-full text-gray-700"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <button
                  onClick={() =>
                    navigate("/admin/inventory-transaction/transaction-form")
                  }
                  className="cursor-pointer inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  Xuất/nhập vật tư
                </button>
              </div>
            </div>
            <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          Ngày giao dịch
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[30%]">
                        <div className="flex items-center gap-2">
                          <Package size={14} />
                          Mục đích
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
                        <div className="flex items-center gap-2">
                          <Package size={14} />
                          Số lượng vật tư
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          Nhà cung cấp
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <Package
                            size={40}
                            className="mx-auto text-gray-400 mb-4"
                          />
                          <p className="text-gray-500 text-lg">
                            Không có giao dịch nhập
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Hãy kiểm tra lại hoặc thêm giao dịch mới
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                            <span className="text-sm text-gray-600">
                              {new Date(
                                transaction.transaction_date
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-[30%]">
                            <span className="text-sm text-gray-600">
                              {transaction.purpose_title || "Không xác định"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-[15%] text-center">
                            <span className="text-sm text-gray-600">
                              {transaction.medical_items.length}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                            <span
                              className={`text-sm text-gray-600 ${
                                transaction.supplier_id
                                  ? "cursor-pointer hover:text-blue-600"
                                  : ""
                              }`}
                              onClick={() =>
                                transaction.supplier_id &&
                                handleSupplierClick(
                                  transaction.supplier_id,
                                  transaction.supplier_name
                                )
                              }
                            >
                              {transaction.supplier_name
                                ? transaction.supplier_name
                                : "Đơn nhập"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center w-[20%]">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/admin/inventory-transaction/transaction-form/${transaction.id}`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
                              >
                                <Edit size={14} />
                                Sửa
                              </button>
                              <button
                                onClick={() =>
                                  openDeleteModal(
                                    transaction.id,
                                    transaction.purpose_title,
                                    transaction.supplier_name
                                  )
                                }
                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
                              >
                                <X size={14} />
                                Xóa
                              </button>
                              <button
                                onClick={() => openModal(transaction)}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
                              >
                                <Search size={14} />
                                Xem
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Transaction Details */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Chi tiết giao dịch nhập
              </h4>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Thông tin giao dịch
                </h5>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Ngày giao dịch:</span>{" "}
                    {new Date(
                      selectedTransaction.transaction_date
                    ).toLocaleDateString("vi-VN")}
                  </div>
                  <div>
                    <span className="font-medium">Mục đích:</span>{" "}
                    {selectedTransaction.purpose_title || "Không xác định"}
                  </div>
                  <div>
                    <span className="font-medium">Nhà cung cấp:</span>{" "}
                    {selectedTransaction.supplier_name || "Đơn nhập"}
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Danh sách vật tư y tế
                </h5>
                <ul className="mt-2 space-y-2">
                  {selectedTransaction.medical_items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-600">
                      <strong>{item.name}</strong> ({item.unit}) - Số lượng:{" "}
                      {item.transaction_quantity}
                      <br />
                      <span className="text-xs text-gray-500">
                        Mô tả: {item.description || "Không có"} | Hết hạn:{" "}
                        {item.exp_date || "Không có"} | Loại:{" "}
                        {item.category === "MEDICATION"
                          ? "Thuốc"
                          : "Vật tư y tế"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        title="Xác nhận xóa giao dịch nhập"
        onConfirm={handleDelete}
        confirmText="Xóa"
        cancelText="Hủy"
      >
        Bạn có chắc muốn xóa giao dịch nhập từ{" "}
        <strong>{transactionToDelete?.supplier_name || "này"}</strong>? Hành
        động này không thể hoàn tác.
      </Modal>

      {/* Supplier Details Popup */}
      <SupplierDetailsPopup
        isOpen={isSupplierPopupOpen}
        onClose={closeSupplierPopup}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default React.memo(TransactionImportList);
