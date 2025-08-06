import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, X, ChevronLeft } from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";

const AddTransactionForm = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    purpose_id: "",
    transaction_date: "",
    note: "",
    medical_items: [{ id: "", quantity: "" }],
    supplier_id: "",
  });
  const [medicalItems, setMedicalItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const isUpdate = !!id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [medicalItemsResponse, suppliersResponse] = await Promise.all([
          axiosClient.get("/medical-item"),
          axiosClient.get("/supplier"),
        ]);

        if (medicalItemsResponse.data.error)
          throw new Error(medicalItemsResponse.data.message);
        setMedicalItems(medicalItemsResponse.data.data || []);

        if (suppliersResponse.data.error)
          throw new Error(suppliersResponse.data.message);
        setSuppliers(suppliersResponse.data.data || []);

        if (isUpdate) {
          const transactionResponse = await axiosClient.get(
            `/inventory-transaction/${id}`
          );
          if (transactionResponse.data.error)
            throw new Error(transactionResponse.data.message);
          const transaction = transactionResponse.data.data;

          const formattedDate = transaction.transaction_date
            ? new Date(transaction.transaction_date).toISOString().split("T")[0]
            : "";

          const formattedMedicalItems = transaction.medical_items.map(
            (item) => ({
              id: item.id,
              quantity: Math.abs(parseInt(item.transaction_quantity)) || "",
            })
          );

          setFormData({
            purpose_id: transaction.purpose_id || "",
            transaction_date: formattedDate,
            note: transaction.note || "",
            medical_items:
              formattedMedicalItems.length > 0
                ? formattedMedicalItems
                : [{ id: "", quantity: "" }],
            supplier_id: transaction.supplier_id || "",
          });
        }
      } catch (err) {
        enqueueSnackbar(err.message || "Không thể tải dữ liệu.", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar, isUpdate, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicalItemChange = (e, index) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedItems = [...prev.medical_items];
      if (name === "id") {
        if (updatedItems.some((item, i) => i !== index && item.id === value)) {
          enqueueSnackbar("Vật tư/thuốc này đã được chọn.", {
            variant: "warning",
          });
          return prev;
        }
        updatedItems[index] = { ...updatedItems[index], id: value, quantity: updatedItems[index].quantity || "" };
      } else if (name === "quantity") {
        updatedItems[index] = { ...updatedItems[index], quantity: value };
      }
      return { ...prev, medical_items: updatedItems };
    });
  };

  const addMedicalItem = () => {
    setFormData((prev) => ({
      ...prev,
      medical_items: [...prev.medical_items, { id: "", quantity: "" }],
    }));
  };

  const removeMedicalItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      medical_items: prev.medical_items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        purpose_id: formData.purpose_id,
        transaction_date: formData.transaction_date,
        note: formData.note,
        medical_items: formData.medical_items.map((item) => ({
          id: item.id,
          quantity: item.quantity || "",
        })),
        supplier_id: formData.supplier_id || null,
      };

      if (
        !payload.purpose_id ||
        !payload.transaction_date ||
        !payload.medical_items.length ||
        payload.medical_items.every((item) => !item.id)
      ) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      }

      let response;
      if (isUpdate) {
        response = await axiosClient.put(
          `/inventory-transaction/${id}`,
          payload
        );
      } else {
        response = await axiosClient.post("/inventory-transaction", payload);
      }

      if (response.data.error) {
        if (response.status === 400) {
          throw new Error(response.data.message || "Dữ liệu không hợp lệ.");
        }
        throw new Error(response.data.message);
      }
      enqueueSnackbar(
        response.data.message ||
          (isUpdate
            ? "Cập nhật giao dịch thành công."
            : "Tạo giao dịch thành công."),
        { variant: "success" }
      );
      navigate("/admin/inventory-transaction");
    } catch (err) {
      console.log(err);
      enqueueSnackbar(err.response.data.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center py-12">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/admin/inventory-transaction")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-blue-100 to-white rounded-lg p-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {isUpdate ? "Cập nhật giao dịch" : "Thêm giao dịch mới"}
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Ngày giao dịch
              </label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Mục đích
              </label>
              <select
                name="purpose_id"
                value={formData.purpose_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                required
              >
                <option value="">Chọn mục đích</option>
                <option value="1">Sử dụng cho y tế hằng ngày</option>
                <option value="2">Nhập hàng từ nhà cung cấp</option>
                <option value="3">Mua hàng từ bên ngoài</option>
                <option value="4">Thuốc vật tư kém chất lượng</option>
                <option value="5">Thuốc vật tư đã hết hạn</option>
                <option value="6">Hoàn trả hàng</option>
                <option value="7">Đơn dặn thuốc từ phụ huynh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Nhà cung cấp
              </label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Ghi chú
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Vật tư/Thuốc
              </label>
              {formData.medical_items.map((item, index) => {
                const selectedMedicalItem = medicalItems.find(
                  (mi) => mi.id === item.id
                );
                return (
                  <div key={index} className="flex gap-4 mb-4 items-center">
                    <select
                      name="id"
                      value={item.id}
                      onChange={(e) => handleMedicalItemChange(e, index)}
                      className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                    >
                      <option value="">Chọn vật tư/thuốc</option>
                      {medicalItems.map((mi) => (
                        <option key={mi.id} value={mi.id}>
                          {mi.name} ({mi.unit}) - Số lượng hiện tại:{" "}
                          {mi.quantity}
                        </option>
                      ))}
                    </select>
                    <div className="w-1/6">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleMedicalItemChange(e, index)}
                        placeholder="Số lượng"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                        min="0"
                        disabled={!item.id}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedicalItem(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addMedicalItem}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm font-medium transition-colors duration-200"
              >
                <Plus size={14} /> Thêm vật tư/thuốc
              </button>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/inventory-transaction")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdate ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AddTransactionForm);