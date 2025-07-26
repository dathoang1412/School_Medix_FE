import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Plus, Edit, Trash2 } from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axiosClient.get("/supplier");
        if (response.data.error) throw new Error(response.data.message);
        setSuppliers(response.data.data);
      } catch (err) {
        enqueueSnackbar(err.message || "Lỗi khi tải danh sách nhà cung cấp.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      try {
        setLoading(true);
        const response = await axiosClient.delete(`/supplier/${id}`);
        if (response.data.error) throw new Error(response.data.message);
        setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
        enqueueSnackbar("Xóa nhà cung cấp thành công!", { variant: "success" });
      } catch (err) {
        enqueueSnackbar(err.response?.data?.message || "Lỗi khi xóa nhà cung cấp.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.description && supplier.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.address && supplier.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Quản lý nhà cung cấp</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên, mô tả, địa chỉ, email, số điện thoại..."
                  className="w-full sm:w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={() => navigate("/admin/supplier-form")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                Thêm mới
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Tên</th>
                    <th className="px-3 py-3">Mô tả</th>
                    <th className="px-3 py-3">Địa chỉ</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Số điện thoại</th>
                    <th className="px-3 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-3">{supplier.id}</td>
                      <td className="px-3 py-3">{supplier.name}</td>
                      <td className="px-3 py-3">{supplier.description || "Không có"}</td>
                      <td className="px-3 py-3">{supplier.address || "Không có"}</td>
                      <td className="px-3 py-3">{supplier.email || "Không có"}</td>
                      <td className="px-3 py-3">{supplier.phone || "Không có"}</td>
                      <td className="px-3 py-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/supplier-form/${supplier.id}`)}
                          className="flex items-center gap-1 px-2 py-1 text-blue-600  hover:text-blue-800 hover:underline  rounded transition-colors duration-200 text-xs"
                        >
                          <Edit className="w-4 h-4" />
                          Cập nhật
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="flex items-center gap-1 px-2 py-1 text-red-600  hover:text-red-800 hover:underline  rounded transition-colors duration-200 text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSuppliers.length === 0 && (
                <p className="text-center py-4 text-gray-500">Không tìm thấy nhà cung cấp.</p>
              )}
            </div>
          )}
        </div>
  );
};

export default React.memo(SupplierManagement);