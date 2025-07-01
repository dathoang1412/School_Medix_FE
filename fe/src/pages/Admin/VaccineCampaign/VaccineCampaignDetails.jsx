import React, { useEffect, useState } from "react";
import { Activity, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../config/axiosClient";
import VaccineCampaignInfo from "./VaccineCampaignInfo";

const VaccineCampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/vaccination-campaign/");
        const campaigns = res.data.data || [];
        const campaign = campaigns.find((el) => el.campaign_id == id);

        if (campaign) {
          setDetails(campaign);
        } else {
          setError("Không tìm thấy thông tin chiến dịch tiêm chủng");
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/admin/vaccine-campaign")}
            className="mt-4 flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/vaccine-campaign")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Chi tiết Chiến dịch Tiêm chủng #{details.campaign_id}
          </h1>
          <p className="text-gray-600">Thông tin chi tiết về chiến dịch tiêm chủng</p>
        </div>

        {/* Main Content */}
        <VaccineCampaignInfo details={details} />
      </div>
    </div>
  );
};

export default VaccineCampaignDetails;