import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Package, Edit, FileText, Search, Calendar, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import Modal from "./Modal"; // Adjust the import path based on your project structure

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/supplier");
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        setSuppliers(response.data.data);
        setFilteredSuppliers(response.data.data);
      } catch (err) {
        err && setError("Không thể tải danh sách nhà cung cấp.");
        enqueueSnackbar("Không thể tải danh sách nhà cung cấp.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  useEffect(() => {
    let result = suppliers;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(lowerSearch) ||
          (supplier.description && supplier.description.toLowerCase().includes(lowerSearch)) ||
          (supplier.address && supplier.address.toLowerCase().includes(lowerSearch)) ||
          (supplier.email && supplier.email.toLowerCase().includes(lowerSearch)) ||
          (supplier.phone && supplier.phone.toLowerCase().includes(lowerSearch)) ||
          (supplier.contact_person && supplier.contact_person.toLowerCase().includes(lowerSearch)) ||
          (supplier.tax_code && supplier.tax_code.toLowerCase().includes(lowerSearch)) ||
          (supplier.status && supplier.status.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredSuppliers(result);
  }, [search, suppliers]);

  const toggleDetails = (index) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  const openDeleteModal = (id, name) => {
    setSupplierToDelete({ id, name });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const response = await axiosClient.delete(`/supplier/${supplierToDelete.id}`);
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      // Update the suppliers state by filtering out the deleted supplier
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== supplierToDelete.id));
      setFilteredSuppliers((prev) => prev.filter((supplier) => supplier.id !== supplierToDelete.id));
      enqueueSnackbar("Xóa nhà cung cấp thành công.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err.message || "Lỗi khi xóa nhà cung cấp.", { variant: "error" });
    } finally {
      setIsModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-white-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Quản lý nhà cung cấp</h1>
          <div className="flex gap-3 items-center">
            <div className="relative w-1/2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, mô tả, địa chỉ, email, số điện thoại, người liên hệ, mã thuế, trạng thái..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => navigate("/admin/medical-items-management/supplier-form")}
              className="cursor-pointer inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium ml-auto"
            >
              <Package className="w-4 h-4" />
              Thêm nhà cung cấp
            </button>
          </div>
        </div>
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead className="bg-white-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                    <div className="flex items-center gap-2">
                      <Package size={14} />
                      Tên
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                    <div className="flex items-center gap-2">
                      <Package size={14} />
                      Người liên hệ
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                    <div className="flex items-center gap-2">
                      <Package size={14} />
                      Mã thuế
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Trạng thái
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <FileText size={40} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">Không tìm thấy nhà cung cấp</p>
                      <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh tìm kiếm hoặc thêm nhà cung cấp mới</p>
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier, index) => (
                    <React.Fragment key={supplier.id}>
                      <tr className="hover:bg-white-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{supplier.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">{supplier.contact_person || "Không có"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">{supplier.tax_code || "Không có"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[20%]">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              supplier.status === "ACTIVE"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : supplier.status === "INACTIVE"
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {supplier.status === "ACTIVE" ? "Đang hoạt động" : supplier.status === "INACTIVE" ? "Ngừng hoạt động" : "Không xác định"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center w-[20%]">
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => navigate(`/admin/medical-items-management/supplier-form/${supplier.id}`)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200"
                            >
                              <Edit size={14} />
                              Sửa
                            </button>
                            <button
                              onClick={() => openDeleteModal(supplier.id, supplier.name)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors duration-200"
                            >
                              <Trash2 size={14} />
                              Xóa
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
                            className="bg-white-50"
                          >
                            <td colSpan="5" className="px-6 py-6">
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
                                      <div><span className="font-medium">ID:</span> {supplier.id}</div>
                                      <div><span className="font-medium">Tên:</span> {supplier.name}</div>
                                      <div><span className="font-medium">Người liên hệ:</span> {supplier.contact_person || "Không có"}</div>
                                      <div><span className="font-medium">Mã thuế:</span> {supplier.tax_code || "Không có"}</div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                                      Chi tiết
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                      <div><span className="font-medium">Địa chỉ:</span> {supplier.address || "Không có"}</div>
                                      <div><span className="font-medium">Email:</span> {supplier.email || "Không có"}</div>
                                      <div><span className="font-medium">Số điện thoại:</span> {supplier.phone || "Không có"}</div>
                                      <div><span className="font-medium">Mô tả:</span> {supplier.description || "Không có mô tả"}</div>
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSupplierToDelete(null);
        }}
        title="Xác nhận xóa nhà cung cấp"
        onConfirm={handleDelete}
        confirmText="Xóa"
        cancelText="Hủy"
      >
        Bạn có chắc muốn xóa nhà cung cấp <strong>{supplierToDelete?.name}</strong>? Hành động này không thể hoàn tác.
      </Modal>
    </div>
  );
};

export default React.memo(SupplierList);