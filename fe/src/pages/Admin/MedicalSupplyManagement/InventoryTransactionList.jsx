import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Calendar, Users, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";

const InventoryTransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/inventory-transaction");
        if (response.data.error) throw new Error(response.data.message);
        setTransactions(response.data.data);
      } catch (err) {
        err && setError("Không thể tải danh sách giao dịch.");
        enqueueSnackbar("Không thể tải danh sách giao dịch.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [enqueueSnackbar]);

  const toggleDetails = (index) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
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
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
              <div className="flex items-center gap-2">
                <Users size={14} />
                Nhà cung cấp
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
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
              Chi tiết
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center">
                <Package size={40} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Không có giao dịch</p>
                <p className="text-gray-400 text-sm mt-2">Hãy kiểm tra lại hoặc thêm giao dịch mới</p>
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                    <span className="text-sm text-gray-600">
                      {new Date(transaction.transaction_date).toLocaleDateString("vi-VN")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                    <span className="text-sm text-gray-600">{transaction.supplier_name || "Không có"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                    <span className="text-sm text-gray-600">{transaction.purpose_title || "Không xác định"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                    <span className="text-sm text-gray-600">{transaction.medical_items.length}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center w-[15%]">
                    <button
                      onClick={() => toggleDetails(index)}
                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
                    >
                      {expanded.has(index) ? (
                        <>
                          <ChevronUp size={14} />
                          Ẩn
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          Xem
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                <AnimatePresence>
                  {expanded.has(index) && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="bg-gray-50"
                    >
                      <td colSpan="5" className="px-6 py-6">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="border-l-4 border-purple-600 pl-4 w-full"
                        >
                          <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2">
                            Danh sách vật tư y tế
                          </h4>
                          <ul className="space-y-2">
                            {transaction.medical_items.map((item, itemIndex) => (
                              <li key={itemIndex} className="text-sm text-gray-600">
                                <strong>{item.name}</strong> ({item.unit}) - Số lượng: {item.transaction_quantity}
                                <br />
                                <span className="text-xs text-gray-500">
                                  Mô tả: {item.description || "Không có"} | Hết hạn: {item.exp_date || "Không có"} | Loại: {item.category}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(InventoryTransactionList);