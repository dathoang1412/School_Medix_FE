import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Calendar, Package, ChevronDown, ChevronUp, Search, Plus, Users, Edit } from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";

const InventoryTransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [selectedPurpose, setSelectedPurpose] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const endpoint = selectedPurpose === "Tất cả" ? "/inventory-transaction" : `/inventory-transaction/purpose/${getPurposeId(selectedPurpose)}`;
        const response = await axiosClient.get(endpoint);
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
  }, [enqueueSnackbar, selectedPurpose]);

  useEffect(() => {
    let result = [...transactions];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (transaction) =>
          (transaction.supplier_name && transaction.supplier_name.toLowerCase().includes(lowerSearch)) ||
          (transaction.purpose_title && transaction.purpose_title.toLowerCase().includes(lowerSearch)) ||
          new Date(transaction.transaction_date).toLocaleDateString("vi-VN").toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredTransactions(result);
  }, [searchTerm, transactions]);

  const getPurposeId = (purposeText) => {
    const purposeMap = {
      "Sử dụng cho y tế hằng ngày": "1",
      "Nhập hàng từ nhà cung cấp": "2",
      "Mua hàng từ bên ngoài": "3",
      "Thuốc vật tư kém chất lượng": "4",
      "Thuốc vật tư đã hết hạn": "5",
      "Hoàn trả hàng": "6",
      "Đơn dặn thuốc từ phụ huynh": "7",
    };
    return purposeMap[purposeText] || null;
  };

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center border border-gray-200">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex ">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center border-b border-gray-200">
              {/* Tab navigation is managed by MedicalItemsManagement */}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Danh sách giao dịch kho</h1>
              <div className="flex gap-3 items-center">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    placeholder="Tìm kiếm giao dịch"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full text-gray-700"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <div className="relative w-1/4">
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700"
                  >
                    <option value="Tất cả">Tất cả</option>
                    <option value="Sử dụng cho y tế hằng ngày">Sử dụng cho y tế hằng ngày</option>
                    <option value="Nhập hàng từ nhà cung cấp">Nhập hàng từ nhà cung cấp</option>
                    <option value="Mua hàng từ bên ngoài">Mua hàng từ bên ngoài</option>
                    <option value="Thuốc vật tư kém chất lượng">Hủy thuốc vật tư kém chất lượng</option>
                    <option value="Thuốc vật tư đã hết hạn">Hủy thuốc vật tư đã hết hạn</option>
                    <option value="Hoàn trả hàng">Hoàn trả hàng</option>
                    <option value="Đơn dặn thuốc từ phụ huynh">Đơn dặn thuốc từ phụ huynh</option>
                  </select>
                </div>
                <button
                  onClick={() => navigate("/admin/medical-items-management/transaction-form")}
                  className="cursor-pointer inline-flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  Giao dịch mới
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
                          <Package size={40} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500 text-lg">Không có giao dịch</p>
                          <p className="text-gray-400 text-sm mt-2">Hãy kiểm tra lại hoặc thêm giao dịch mới</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <React.Fragment key={transaction.id}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                              <span className="text-sm text-gray-600">
                                {new Date(transaction.transaction_date).toLocaleDateString("vi-VN")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-[30%]">
                              <span className="text-sm text-gray-600">{transaction.purpose_title || "Không xác định"}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-[15%] text-center">
                              <span className="text-sm text-gray-600">{transaction.medical_items.length}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                              <span className="text-sm text-gray-600">{transaction.supplier_name ? transaction.supplier_name : "Đơn xuất"}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center w-[15%]">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => navigate(`/admin/medical-items-management/transaction-form/${transaction.id}`)}
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
                                >
                                  <Edit size={14} />
                                  Cập nhật
                                </button>
                                <button
                                  onClick={() => toggleDetails(index)}
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
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
                              </div>
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
                                    className="border-l-4 border-indigo-600 pl-4 w-full"
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
                                            Mô tả: {item.description || "Không có"} | Hết hạn: {item.exp_date || "Không có"} | Loại: {item.category === "MEDICATION" ? "Thuốc" : "Vật tư y tế"}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InventoryTransactionList);