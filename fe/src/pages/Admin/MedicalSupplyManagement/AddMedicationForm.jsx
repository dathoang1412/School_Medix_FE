import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ChevronLeft, Pill } from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";

const AddMedicationForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    description: "",
    exp_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!id);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await axiosClient.get(`/medical-item/${id}`);
          if (response.data.error) throw new Error(response.data.message);
          const { name, unit, description, exp_date } = response.data.data;
          setFormData({ name, unit, description: description || "", exp_date });
        } catch (err) {
          enqueueSnackbar(err.message || "Lỗi khi tải thông tin thuốc.", { variant: "error" });
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit || !formData.exp_date) {
      enqueueSnackbar("Vui lòng nhập đầy đủ tên, đơn vị và ngày hết hạn.", { variant: "error" });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const date = new Date(formData.exp_date);
    if (isNaN(date) || date.toISOString().split("T")[0] !== formData.exp_date || formData.exp_date <= today) {
      enqueueSnackbar("Ngày hết hạn phải là ngày hợp lệ và trong tương lai.", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, category: "MEDICATION" };
      const response = await axiosClient[id ? "patch" : "post"](
        id ? `/medical-item/${id}` : "/medical-supply", // Adjust endpoint for medications if different
        payload
      );
      if (response.data.error) throw new Error(response.data.message);
      enqueueSnackbar(response.data.message || (id ? "Cập nhật thành công!" : "Tạo thuốc thành công!"), {
        variant: "success",
      });
      navigate("/admin/medical-items-management");
    } catch (err) {
      console.error("API Error:", err);
      enqueueSnackbar(
        err.response?.data?.message || (id ? "Lỗi khi cập nhật." : "Lỗi khi tạo thuốc."),
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center py-12">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/admin/medical-items-management")}
          className="flex cursor-pointer items-center gap-2 text-green-600 hover:text-green-800 hover:underline text-sm font-medium transition-colors duration-200 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Quay lại danh sách
        </button>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-green-100 to-white rounded-lg p-4">
            <Pill className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              {id ? "Cập nhật thuốc" : "Thêm thuốc mới"}
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Tên thuốc
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm placeholder-gray-400"
                placeholder="Nhập tên thuốc"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Đơn vị
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm placeholder-gray-400"
                placeholder="Nhập đơn vị (ví dụ: Viên, Hộp)"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Ngày hết hạn
              </label>
              <input
                type="date"
                name="exp_date"
                value={formData.exp_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm placeholder-gray-400"
                placeholder="Nhập mô tả (nếu có)"
                rows="5"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/medical-items-management")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {id ? "Cập nhật" : "Thêm thuốc"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AddMedicationForm);