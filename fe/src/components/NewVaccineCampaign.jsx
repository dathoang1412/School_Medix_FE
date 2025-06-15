import React, { useState, useEffect } from "react";
import axiosClient from "../config/axiosClient";
import { Plus, X, ChevronRight } from "lucide-react";

const VaccinationCampaignManagement = () => {
  const [campaignForm, setCampaignForm] = useState({
    vaccine_id: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [vaccineForm, setVaccineForm] = useState({
    name: "",
    description: "",
  });
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vaccines, setVaccines] = useState([]);

  // Fetch vaccines from the database
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const response = await axiosClient.get("/vaccine/get-all");
        if (response.data.error) {
          setError(response.data.message);
        } else {
          setVaccines(response.data.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách vaccine");
      }
    };
    fetchVaccines();
  }, []);

  // Set default vaccine_id when vaccines are loaded
  useEffect(() => {
    if (vaccines.length > 0 && !campaignForm.vaccine_id) {
      setCampaignForm((prev) => ({
        ...prev,
        vaccine_id: vaccines[0].id.toString(),
      }));
    }
  }, [vaccines, campaignForm.vaccine_id]);

  const handleCampaignChange = (e) => {
    const { name, value } = e.target;
    setCampaignForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVaccineChange = (e) => {
    const { name, value } = e.target;
    setVaccineForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axiosClient.post("/campaign", campaignForm);
      setSuccess("Tạo chiến dịch thành công");
      setCampaignForm({
        vaccine_id: vaccines.length > 0 ? vaccines[0].id.toString() : "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const handleVaccineSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axiosClient.post("/vaccine", vaccineForm);
      setSuccess("Tạo vaccine mới thành công");
      setVaccineForm({ name: "", description: "" });
      setShowVaccineModal(false);
      // Refresh vaccine list
      const response = await axiosClient.get("/vaccine/get-all");
      if (!response.data.error) {
        setVaccines(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <span>🏠 Trang chủ</span>
        <ChevronRight size={16} className="mx-2" />
        <span>Quản lý chiến dịch tiêm chủng</span>
        <ChevronRight size={16} className="mx-2" />
        <span>Thêm kế hoạch mới</span>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Thêm Kế Hoạch Hoạt Động Y Tế
      </h1>

      {/* Campaign Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Tạo Kế Hoạch Mới</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
        <form onSubmit={handleCampaignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vaccine</label>
            <select
              name="vaccine_id"
              value={campaignForm.vaccine_id}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Chọn vaccine</option>
              {vaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={campaignForm.description}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="4"
              required
              placeholder="Nhập mô tả chiến dịch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Địa điểm</label>
            <input
              type="text"
              name="location"
              value={campaignForm.location}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              placeholder="Nhập địa điểm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                name="start_date"
                value={campaignForm.start_date}
                onChange={handleCampaignChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
              <input
                type="date"
                name="end_date"
                value={campaignForm.end_date}
                onChange={handleCampaignChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowVaccineModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={16} />
              Thêm Vaccine Mới
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Tạo Kế Hoạch
            </button>
          </div>
        </form>
      </div>

      {/* Vaccine Modal */}
      {showVaccineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thêm Vaccine Mới</h3>
              <button onClick={() => setShowVaccineModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleVaccineSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên Vaccine</label>
                <input
                  type="text"
                  name="name"
                  value={vaccineForm.name}
                  onChange={handleVaccineChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                  placeholder="Nhập tên vaccine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mô tả (bao gồm tên bệnh, ví dụ: 'Phòng bệnh Sởi - ...')
                </label>
                <textarea
                  name="description"
                  value={vaccineForm.description}
                  onChange={handleVaccineChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows="4"
                  required
                  placeholder="Nhập mô tả vaccine"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVaccineModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Thêm Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationCampaignManagement;