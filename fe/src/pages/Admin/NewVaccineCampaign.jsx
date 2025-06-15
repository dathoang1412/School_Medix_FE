
import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../config/axiosClient"; // Ensure path matches src/config/axiosClient.js
import { Plus, X, ChevronRight, Loader2, AlertCircle } from "lucide-react";

const NewVaccineCampaign = () => {
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
  const [isLoading, setIsLoading] = useState(false);

  // Fetch vaccines
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const vaccineResponse = await axiosClient.get("/vaccine");
        console.log("Vaccines response:", vaccineResponse.data);
        if (vaccineResponse.data.error) {
          setError(vaccineResponse.data.message);
        } else {
          setVaccines(vaccineResponse.data.data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Không thể kết nối với server. Vui lòng kiểm tra backend."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set default vaccine_id
  useEffect(() => {
    if (vaccines.length > 0 && !campaignForm.vaccine_id) {
      setCampaignForm((prev) => ({
        ...prev,
        vaccine_id: vaccines[0].id.toString(),
      }));
    }
  }, [vaccines]);

  const handleCampaignChange = useCallback((e) => {
    const { name, value } = e.target;
    setCampaignForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleVaccineChange = useCallback((e) => {
    const { name, value } = e.target;
    setVaccineForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCampaignSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);

      if (!campaignForm.vaccine_id) {
        setError("Vui lòng chọn vaccine");
        setIsLoading(false);
        return;
      }
      if (!campaignForm.description.trim()) {
        setError("Vui lòng nhập mô tả chiến dịch");
        setIsLoading(false);
        return;
      }
      if (!campaignForm.location.trim()) {
        setError("Vui lòng nhập địa điểm");
        setIsLoading(false);
        return;
      }
      if (!campaignForm.start_date || !campaignForm.end_date) {
        setError("Vui lòng chọn ngày bắt đầu và kết thúc");
        setIsLoading(false);
        return;
      }
      if (new Date(campaignForm.end_date) < new Date(campaignForm.start_date)) {
        setError("Ngày kết thúc phải sau ngày bắt đầu");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Submitting campaign:", campaignForm);
        const response = await axiosClient.post("/vaccination-campaign", campaignForm);
        setSuccess(response.data.message || "Tạo chiến dịch thành công");
        setCampaignForm({
          vaccine_id: vaccines.length > 0 ? vaccines[0].id.toString() : "",
          description: "",
          location: "",
          start_date: "",
          end_date: "",
        });
      } catch (err) {
        console.error("Campaign submit error:", err);
        setError(
          err.response?.data?.message ||
            "Lỗi hệ thống khi tạo chiến dịch. Vui lòng kiểm tra server."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [campaignForm, vaccines]
  );

  const handleVaccineSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);

      if (!vaccineForm.name.trim()) {
        setError("Vui lòng nhập tên vaccine");
        setIsLoading(false);
        return;
      }
      if (!vaccineForm.description.trim()) {
        setError("Vui lòng nhập mô tả vaccine");
        setIsLoading(false);
        return;
      }

      // Validate description format
      const descriptionRegex = /bệnh\s+(.+?)(?=\s+-)/i;
      const diseaseMatch = vaccineForm.description.match(descriptionRegex);
      if (!diseaseMatch || !diseaseMatch[1]) {
        setError(
          "Mô tả phải có định dạng: 'bệnh [Tên bệnh] - [Chi tiết]'. Ví dụ: 'Phòng bệnh Sởi - Vắc-xin cho trẻ em'"
        );
        setIsLoading(false);
        return;
      }

      const payload = {
        name: vaccineForm.name.trim(),
        description: vaccineForm.description.trim(),
      };

      try {
        console.log("Submitting vaccine:", payload);
        const response = await axiosClient.post("/vaccine", payload);
        setSuccess(response.data.message || "Tạo vaccine mới thành công");
        setVaccineForm({ name: "", description: "" });
        setShowVaccineModal(false);
        // Refresh vaccine list
        const vaccineResponse = await axiosClient.get("/vaccine");
        console.log("Refreshed vaccines:", vaccineResponse.data);
        if (!vaccineResponse.data.error) {
          setVaccines(vaccineResponse.data.data || []);
        }
      } catch (err) {
        console.error("Vaccine submit error:", err);
        const errorMessage = err.response?.data?.message;
        if (err.response?.status === 409) {
          setError(`Vaccine "${vaccineForm.name}" đã tồn tại`);
        } else if (err.response?.status === 400 && errorMessage?.includes("Cannot extract disease name")) {
          setError(
            "Không thể trích xuất tên bệnh từ mô tả. Vui lòng kiểm tra định dạng: 'bệnh [Tên bệnh] - [Chi tiết]'"
          );
        } else if (err.response?.status === 400 && errorMessage?.includes("Cannot find disease ID")) {
          setError(
            `Tên bệnh "${diseaseMatch[1].trim()}" không tồn tại trong cơ sở dữ liệu. Vui lòng kiểm tra lại.`
          );
        } else if (err.response?.status === 400 && errorMessage?.includes("Missing required fields")) {
          setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        } else {
          setError(errorMessage || "Lỗi hệ thống khi tạo vaccine. Vui lòng kiểm tra server.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [vaccineForm]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Thêm Kế Hoạch Hoạt Động Y Tế
      </h1>

      {/* Campaign Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Tạo Kế Hoạch Mới</h2>
        {error && (
          <div className="flex items-center text-red-600 text-sm mb-4">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center text-green-600 text-sm mb-4">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {success}
          </div>
        )}
        {isLoading && (
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <Loader2 className="animate-spin mr-2" size={16} />
            Đang xử lý...
          </div>
        )}
        <form onSubmit={handleCampaignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vaccine</label>
            <select
              name="vaccine_id"
              value={campaignForm.vaccine_id}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              disabled={isLoading}
            >
              <option value="">Chọn vaccine</option>
              {vaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.name} ({vaccine.disease_name})
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
              disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowVaccineModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
              disabled={isLoading}
            >
              <Plus size={16} />
              Thêm Vaccine Mới
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin inline-block mr-2" size={16} />
              ) : null}
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
              <button onClick={() => setShowVaccineModal(false)} disabled={isLoading}>
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
                  placeholder="Nhập tên vaccine (VD: Vắc-xin Sởi)"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={vaccineForm.description}
                  onChange={handleVaccineChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows="4"
                  required
                  placeholder="Phòng bệnh Sởi - Vắc-xin phòng ngừa bệnh sởi cho trẻ em"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mô tả phải có định dạng: "bệnh [Tên bệnh] - [Chi tiết]". Tên bệnh phải tồn tại (VD: Sởi, Quai bị).
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVaccineModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin inline-block mr-2" size={16} />
                  ) : null}
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

export default NewVaccineCampaign;
