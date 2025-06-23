import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, Calendar, MapPin, AlertCircle, Loader2 } from "lucide-react";
import axiosClient from "../../config/axiosClient";

const RegularCheckupSurvey = () => {
  const { student_id, campaign_id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExams, setSelectedExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaignDetail = async () => {
      if (!campaign_id || isNaN(campaign_id)) {
        setError("ID chiến dịch không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosClient.get(`/checkup-campaign-detail/${campaign_id}`);
        if (response.data.error) {
          setError(response.data.message);
        } else {
          setCampaign(response.data.data);
          // Khởi tạo selectedExams với trạng thái mặc định "CANNOT_ATTACH"
          const initialExams = response.data.data.specialist_exams.map((exam) => ({
            spe_exam_id: exam.id,
            status: "CANNOT_ATTACH",
          }));
          setSelectedExams(initialExams);
        }
      } catch (err) {
        setError("Không thể tải chi tiết chiến dịch.");
        console.error("Error fetching campaign details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaignDetail();
  }, [campaign_id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa xác định";
    }
  };

  const handleExamSelection = (speExamId) => {
    setSelectedExams((prev) =>
      prev.map((exam) =>
        exam.spe_exam_id === speExamId
          ? { ...exam, status: exam.status === "CANNOT_ATTACH" ? "WAITING" : "CANNOT_ATTACH" }
          : exam
      )
    );
  };

  const handleSubmit = async () => {
    const registerId = "some_register_id"; // Thay bằng ID đăng ký thực tế (cần lấy từ context hoặc state)
    const submitData = {
      parent_id: "some_parent_id", // Thay bằng ID phụ huynh thực tế (cần lấy từ context hoặc state)
      submit_time: new Date().toISOString(),
      reason: "Đăng ký kiểm tra sức khỏe", // Có thể thêm input để phụ huynh nhập lý do
      exams: selectedExams,
    };

    try {
      const response = await axiosClient.patch(`/checkup-register/${registerId}/submit`, submitData);
      if (response.data.error) {
        setError(response.data.message);
      } else {
        alert("Đăng ký thành công!");
        navigate(`/parent/edit/${student_id}`);
      }
    } catch (err) {
      setError("Không thể gửi đăng ký.");
      console.error("Error submitting registration:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Đang tải chi tiết chiến dịch...</p>
          <p className="text-sm text-gray-700 mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border border-red-300 rounded-xl p-8 max-w-lg w-full text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/parent/edit/${student_id}`)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-300 shadow-md">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Shield className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết chiến dịch kiểm tra sức khỏe</h1>
              <p className="text-gray-700 mt-1">Thông tin chi tiết về chiến dịch và khảo sát</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pt-10">
        <div className="bg-white border border-gray-300 rounded-xl p-8 shadow-md">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {campaign.campaign_name || `Kiểm tra sức khỏe #${campaign.campaign_id}`}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">Mã chiến dịch: {campaign.campaign_id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar className="w-5 h-5 text-gray-700" />
              <div>
                <p className="text-sm font-medium text-gray-900">Thời gian</p>
                <p className="text-sm text-gray-700">
                  {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                </p>
              </div>
            </div>

            {campaign.campaign_location && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <MapPin className="w-5 h-5 text-gray-700" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Địa điểm</p>
                  <p className="text-sm text-gray-700">{campaign.campaign_location}</p>
                </div>
              </div>
            )}
          </div>

          {campaign.campaign_des && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Mô tả</h4>
              <p className="text-gray-800 leading-relaxed">{campaign.campaign_des}</p>
            </div>
          )}

          {campaign.specialist_exams?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Chọn khám chuyên sâu</h4>
              <ul className="list-disc list-inside text-gray-800">
                {campaign.specialist_exams.map((exam) => {
                  const selectedExam = selectedExams.find((e) => e.spe_exam_id === exam.id);
                  return (
                    <li key={exam.id} className="mb-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedExam?.status === "WAITING"}
                        onChange={() => handleExamSelection(exam.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="font-medium">{exam.name}</span>
                      {exam.description && `: ${exam.description}`}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Gửi đăng ký
            </button>
            <button
              onClick={() => navigate(`/parent/edit/${student_id}`)}
              className="ml-4 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularCheckupSurvey;