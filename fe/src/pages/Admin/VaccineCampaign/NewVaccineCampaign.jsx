import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../../config/axiosClient";
import { Plus, X, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const NewVaccineCampaign = () => {
  const [campaignForm, setCampaignForm] = useState({
    disease_id: "",
    vaccine_id: "",
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [vaccineForm, setVaccineForm] = useState({
    name: "",
    description: "",
    disease_list: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vaccineDiseases, setVaccineDiseases] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVaccineDiseases, setIsLoadingVaccineDiseases] = useState(false);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);

  // Fetch vaccine_disease list
  useEffect(() => {
    const fetchVaccineDiseases = async () => {
      setIsLoadingVaccineDiseases(true);
      try {
        const response = await axiosClient.get("/vaccine-disease");
        if (response.data.error) {
          setError(response.data.message);
        } else {
          setVaccineDiseases(
            Array.isArray(response.data.data)
              ? response.data.data
              : []
          );
        }
      } catch (err) {
        console.error("Fetch vaccine_disease error:", err);
        setError(
          err.response?.data?.message ||
            "Không thể kết nối với server. Vui lòng kiểm tra backend."
        );
      } finally {
        setIsLoadingVaccineDiseases(false);
      }
    };
    fetchVaccineDiseases();
  }, []);

  // Fetch vaccines based on disease_id
  useEffect(() => {
    const fetchVaccines = async () => {
      if (!campaignForm.disease_id) {
        setVaccines([]);
        setCampaignForm((prev) => ({ ...prev, vaccine_id: "" }));
        return;
      }
      setIsLoadingVaccines(true);
      try {
        const diseaseId = campaignForm.disease_id.split(',').map(Number);
        const res = await axiosClient.get(`/diseases/vaccines`, {
          params: { diseaseId }
        });
        setVaccines(res.data.data || []);
      } catch (err) {
        console.error("Fetch vaccines error:", err);
        setError("Không thể tải danh sách vaccine. Vui lòng kiểm tra lại.");
      } finally {
        setIsLoadingVaccines(false);
      }
    };
    fetchVaccines();
  }, [campaignForm.disease_id]);

  const handleCampaignChange = useCallback((e) => {
    const { name, value } = e.target;
    setCampaignForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "disease_id" ? { vaccine_id: "" } : {}),
    }));
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

      if (!campaignForm.disease_id) {
        setError("Vui lòng chọn cụm bệnh");
        setIsLoading(false);
        return;
      }
      if (!campaignForm.vaccine_id) {
        setError("Vui lòng chọn vaccine");
        setIsLoading(false);
        return;
      }
      if (!campaignForm.title.trim()) {
        setError("Vui lòng nhập tiêu đề chiến dịch");
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
        console.log("Submitting campaign:", {
          ...campaignForm,
          disease_id: campaignForm.disease_id.split(',').map(Number),
          vaccine_id: parseInt(campaignForm.vaccine_id),
        });
        const response = await axiosClient.post("/vaccination-campaign", {
          ...campaignForm,
          disease_id: campaignForm.disease_id.split(',').map(Number),
          vaccine_id: parseInt(campaignForm.vaccine_id),
        });
        setSuccess(response.data.message || "Tạo chiến dịch thành công");
        setCampaignForm({
          disease_id: "",
          vaccine_id: "",
          title: "",
          description: "",
          location: "",
          start_date: "",
          end_date: "",
        });
        setVaccines([]);
      } catch (err) {
        console.error("Campaign submit error:", err);
        const errorMessage = err.response?.data?.message;
        const errorMap = {
          "Missing required fields": "Vui lòng điền đầy đủ các trường bắt buộc",
          "Vaccine not found or no associated disease": "Vaccine không tồn tại hoặc không liên kết với bệnh nào",
          "End date must be after start date": "Ngày kết thúc phải sau ngày bắt đầu",
          "Invalid vaccine_id": "Vaccine được chọn không hợp lệ",
          "Failed to create registration request": "Không thể tạo yêu cầu đăng ký",
          "Internal server error": "Lỗi hệ thống. Vui lòng thử lại sau",
        };
        setError(errorMap[errorMessage] || errorMessage || "Lỗi hệ thống khi tạo chiến dịch");
      } finally {
        setIsLoading(false);
      }
    },
    [campaignForm]
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
      if (!vaccineForm.disease_list.length) {
        setError("Vui lòng chọn ít nhất một bệnh");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Submitting vaccine:", vaccineForm);
        const response = await axiosClient.post("/vaccine", vaccineForm);
        setSuccess(response.data.message || "Tạo vaccine mới thành công");
        setVaccineForm({ name: "", description: "", disease_list: [] });
        const vaccineResponse = await axiosClient.get("/vaccine-disease");
        if (!vaccineResponse.data.error) {
          setVaccineDiseases(vaccineResponse.data.data || []);
        }
      } catch (err) {
        console.error("Vaccine submit error:", err);
        const errorMessage = err.response?.data?.message;
        if (err.response?.status === 409) {
          setError(`Vaccine "${vaccineForm.name}" đã tồn tại`);
        } else {
          setError(errorMessage || "Lỗi hệ thống khi tạo vaccine. Vui lòng kiểm tra server.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [vaccineForm]
  );

  const navigate = useNavigate();

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen pt-20">
      <div
        onClick={() => navigate("/admin/vaccine-campaign")}
        className="flex items-center justify-center absolute top-4 cursor-pointer"
      >
        <IoChevronBackOutline /> Back
      </div>
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
            <label className="block text-sm font-medium mb-1">Chọn Cụm Bệnh</label>
            <select
              name="disease_id"
              value={campaignForm.disease_id}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              disabled={isLoading || isLoadingVaccineDiseases}
            >
              <option value="">Chọn cụm bệnh</option>
              {vaccineDiseases.map((vd) => (
                <option key={vd.disease_id} value={vd.disease_id}>
                  {vd.disease_name}
                </option>
              ))}
            </select>
            {isLoadingVaccineDiseases && (
              <div className="text-gray-500 text-sm mt-1">
                <Loader2 className="animate-spin inline-block mr-2" size={16} />
                Đang tải danh sách...
              </div>
            )}
            {!isLoadingVaccineDiseases && vaccineDiseases.length === 0 && (
              <div className="text-red-600 text-sm mt-1">
                Không có dữ liệu cụm bệnh.
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chọn Vaccine</label>
            <select
              name="vaccine_id"
              value={campaignForm.vaccine_id}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              disabled={isLoading || isLoadingVaccines || !campaignForm.disease_id}
            >
              <option value="">Chọn vaccine</option>
              {vaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.name}
                </option>
              ))}
            </select>
            {isLoadingVaccines && (
              <div className="text-gray-500 text-sm mt-1">
                <Loader2 className="animate-spin inline-block mr-2" size={16} />
                Đang tải danh sách vaccine...
              </div>
            )}
            {!isLoadingVaccines && campaignForm.disease_id && vaccines.length === 0 && (
              <div className="text-red-600 text-sm mt-1">
                Không có vaccine nào liên quan đến bệnh đã chọn.
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
            <input
              type="text"
              name="title"
              value={campaignForm.title}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              placeholder="Nhập tiêu đề chiến dịch"
              disabled={isLoading || !campaignForm.vaccine_id}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={campaignForm.description}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows="4"
              placeholder="Nhập mô tả chiến dịch (không bắt buộc)"
              disabled={isLoading || !campaignForm.vaccine_id}
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
              disabled={isLoading || !campaignForm.vaccine_id}
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
                disabled={isLoading || !campaignForm.vaccine_id}
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
                disabled={isLoading || !campaignForm.vaccine_id}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              disabled={isLoading || !campaignForm.vaccine_id}
            >
              {isLoading ? (
                <Loader2 className="animate-spin inline-block mr-2" size={16} />
              ) : null}
              Tạo Kế Hoạch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewVaccineCampaign;