import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Package, Edit, FileText, Pill, Search, Calendar, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";

const MedicineList = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/medication");
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        setItems(response.data.data);
        setFilteredItems(response.data.data);
      } catch (err) {
        err && setError("Không thể tải danh sách thuốc.");
        enqueueSnackbar("Không thể tải danh sách thuốc.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  useEffect(() => {
    let result = items;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          (item.description && item.description.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredItems(result);
  }, [search, items]);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa xác định";
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Danh sách thuốc</h1>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc mô tả..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => navigate("/admin/medicine-item-form")}
              className="inline-flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              <Pill className="w-4 h-4" />
              Thêm thuốc
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
                      <Package size={14} />
                      Tên
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
                    <div className="flex items-center gap-2">
                      <Package size={14} />
                      Đơn vị
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[10%]">
                    <div className="flex items-center gap-2">
                      <Package size={14} />
                      Số lượng
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Ngày hết hạn
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[10%]">
                    <div className="flex items-center gap-2">
                      <Package size={14} />
                      Loại
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-[25%]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText size={40} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">Không tìm thấy thuốc</p>
                      <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh tìm kiếm hoặc thêm thuốc mới</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">{item.quantity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">{formatDate(item.exp_date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                          <span className="px-2 py-1 bg-green-50 text-green-800 text-xs font-medium rounded border border-green-200">
                            Thuốc
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center w-[20%]">
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => navigate(`/admin/medicine-item-form/${item.id}`)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200"
                            >
                              <Edit size={14} />
                              Cập nhật
                            </button>
                            <button
                              onClick={() => toggleDetails(index)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
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
                            <td colSpan="6" className="px-6 py-6">
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="border-l-4 border-blue-600 pl-4 w-full"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                      Thông tin cơ bản
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                      <div><span className="font-medium">ID:</span> {item.id}</div>
                                      <div><span className="font-medium">Tên:</span> {item.name}</div>
                                      <div><span className="font-medium">Đơn vị:</span> {item.unit}</div>
                                      <div><span className="font-medium">Số lượng:</span> {item.quantity}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                      Chi tiết
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                      <div><span className="font-medium">Loại:</span> Thuốc</div>
                                      <div><span className="font-medium">Ngày hết hạn:</span> {formatDate(item.exp_date)}</div>
                                      <div><span className="font-medium">Mô tả:</span> {item.description || "Không có mô tả"}</div>
                                    </div>
                                  </div>
                                </div>
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
  );
};

export default React.memo(MedicineList);