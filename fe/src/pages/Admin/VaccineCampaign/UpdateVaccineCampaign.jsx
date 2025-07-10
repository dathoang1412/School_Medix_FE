import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { IoChevronBackOutline } from "react-icons/io5";
import axiosClient from "../../../config/axiosClient";

const UpdateVaccineCampaign = () => {
  const navigate = useNavigate();
  const { campaign_id } = useParams();

  const [campaignForm, setCampaignForm] = useState({
    vaccine_id: "",
    disease_id: "",
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vaccines, setVaccines] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);
  const [isFetchingCampaign, setIsFetchingCampaign] = useState(true);

  // Fetch vaccines
  useEffect(() => {
    const fetchVaccines = async () => {
      setIsLoading(true);
      try {
        const vaccineResponse = await axiosClient.get("/vaccines");
        if (vaccineResponse.data.error) {
          setError(vaccineResponse.data.message);
        } else {
          setVaccines(vaccineResponse.data.data || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể kết nối với server. Vui lòng kiểm tra backend."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchVaccines();
  }, []);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      setIsFetchingCampaign(true);
      try {
        const response = await axiosClient.get(`/vaccination-campaign/${campaign_id}`);
        console.log("Vaccine campaign detail: ", response.data.data);
        if (response.data.error) {
          setError(response.data.message);
        } else {
          const campaign = response.data.data;
          if (campaign.status !== "DRAFTED") {
            setError("Chỉ được cập nhật khi chiến dịch ở trạng thái DRAFTED");
            return;
          }
          const campaignData = {
            vaccine_id: campaign.vaccine_id?.toString() || "",
            disease_id: campaign.disease_id?.toString() || "",
            title: campaign.title || "",
            description: campaign.description || "",
            location: campaign.location || "",
            start_date: campaign.start_date ? campaign.start_date.split("T")[0] : "",
            end_date: campaign.end_date ? campaign.end_date.split("T")[0] : "",
          };
          setCampaignForm(campaignData);
          setOriginalFormData(campaignData);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Lỗi khi lấy thông tin chiến dịch."
        );
      } finally {
        setIsFetchingCampaign(false);
      }
    };
    fetchCampaign();
  }, [campaign_id]);

  // Fetch diseases based on selected vaccine
  useEffect(() => {
    const fetchDiseases = async () => {
      if (!campaignForm.vaccine_id) return;
      setIsLoadingDiseases(true);
      setDiseases([]);
      try {
        const res = await axiosClient.get(`/vaccines/${campaignForm.vaccine_id}/diseases`);
        setDiseases(res.data.data || []);
      } catch (err) {
        setError("Không thể tải danh sách bệnh. Vui lòng kiểm tra lại.");
      } finally {
        setIsLoadingDiseases(false);
      }
    };
    fetchDiseases();
  }, [campaignForm.vaccine_id]);

  // Set default vaccine_id or handle empty vaccine list
  useEffect(() => {
    if (vaccines.length > 0 && !campaignForm.vaccine_id && !isFetchingCampaign) {
      setCampaignForm((prev) => ({
        ...prev,
        vaccine_id: vaccines[0].id.toString(),
      }));
    }
  }, [vaccines, campaignForm.vaccine_id, isFetchingCampaign]);

  const handleCampaignChange = useCallback((e) => {
    const { name, value } = e.target;
    setCampaignForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "vaccine_id" ? { disease_id: "" } : {}),
    }));
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
      if (!campaignForm.disease_id) {
        setError("Vui lòng chọn bệnh");
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
        const response = await axiosClient.patch(`/vaccination-campaign/${campaign_id}`, campaignForm);
        setSuccess(response.data.message || "Cập nhật chiến dịch thành công");
        navigate("/admin/vaccine-campaign");
      } catch (err) {
        const errorMessage = err.response?.data?.message;
        const errorMap = {
          "Missing required fields": "Vui lòng điền đầy đủ các trường bắt buộc",
          "Vaccine not found or no associated disease": "Vaccine không tồn tại hoặc không liên kết với bệnh nào",
          "End date must be after start date": "Ngày kết thúc phải sau ngày bắt đầu",
          "Invalid vaccine_id": "Vaccine được chọn không hợp lệ",
          "Failed to update campaign": "Không thể cập nhật chiến dịch",
          "Internal server error": "Lỗi hệ thống. Vui lòng thử lại sau",
        };
        setError(errorMap[errorMessage] || errorMessage || "Lỗi hệ thống khi cập nhật chiến dịch");
      } finally {
        setIsLoading(false);
      }
    },
    [campaignForm, campaign_id, navigate]
  );

  if (isFetchingCampaign) {
    return (
      <div className="relative p-6 bg-gray-50 min-h-screen pt-20">
        <div className="flex items-center justify-center text-gray-600 text-sm">
          <Loader2 className="animate-spin mr-2" size={16} />
          Đang tải thông tin chiến dịch...
        </div>
      </div>
    );
  }

  if (error && campaignForm.title === "") {
    return (
      <div className="relative p-6 bg-gray-50 min-h-screen pt-20">
        <div
          onClick={() => navigate("/admin/vaccine-campaign")}
          className="flex items-center justify-center absolute top-4 cursor-pointer"
        >
          <IoChevronBackOutline /> Back
        </div>
        <div className="flex items-center text-red-600 text-sm mb-4 bg-white rounded-lg shadow-sm border p-6">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen pt-20">
      <div
        onClick={() => navigate("/admin/vaccine-campaign")}
        className="flex items-center justify-center absolute top-4 cursor-pointer"
      >
        <IoChevronBackOutline /> Back
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Cập Nhật Kế Hoạch Hoạt Động Y Tế
      </h1>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Cập Nhật Kế Hoạch</h2>
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
                  {vaccine.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bệnh</label>
            <select
              name="disease_id"
              value={campaignForm.disease_id}
              onChange={handleCampaignChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              disabled={isLoading || isLoadingDiseases || !campaignForm.vaccine_id}
            >
              <option value="">Chọn bệnh</option>
              {diseases.map((disease) => (
                <option key={disease.id} value={disease.id}>
                  {disease.name}
                </option>
              ))}
            </select>
            {isLoadingDiseases && (
              <div className="text-gray-500 text-sm mt-1">
                <Loader2 className="animate-spin inline-block mr-2" size={16} />
                Đang tải danh sách bệnh...
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
              disabled={isLoading}
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
              onClick={() => {
                setCampaignForm(originalFormData);
                setError("");
                setSuccess("");
              }}
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
              Cập Nhật Kế Hoạch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateVaccineCampaign;