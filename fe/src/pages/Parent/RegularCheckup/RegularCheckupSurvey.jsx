import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Shield, Calendar, MapPin, AlertCircle, Loader2, ChevronLeft, FileText, CheckCircle } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { enqueueSnackbar } from "notistack";

const RegularCheckupSurvey = () => {
  const { student_id, campaign_id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExams, setSelectedExams] = useState([]);
  const [waitingExams, setWaitingExams] = useState([]); // New state for previously registered exams
  const [reason, setReason] = useState("");
  const [registerId, setRegisterId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy parent_id từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const parent_id = user ? user.id : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!campaign_id || isNaN(campaign_id) || !student_id || isNaN(student_id)) {
        setError("ID chiến dịch hoặc học sinh không hợp lệ.");
        enqueueSnackbar("ID chiến dịch hoặc học sinh không hợp lệ.", { variant: "error" });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch register ID
        const registerResponse = await axiosClient.get(
          `/checkup/campaign_id/${campaign_id}/student_id/${student_id}`
        );
        if (registerResponse.data.error) {
          setError(registerResponse.data.message || "Không tìm thấy Register ID.");
          enqueueSnackbar(registerResponse.data.message || "Không tìm thấy Register ID.", { variant: "error" });
        } else if (registerResponse.data.data && registerResponse.data.data.id) {
          setRegisterId(registerResponse.data.data.id);
        } else {
          setError("Không nhận được Register ID từ server.");
          enqueueSnackbar("Không nhận được Register ID từ server.", { variant: "error" });
        }

        // Fetch campaign details
        const campaignResponse = await axiosClient.get(`/checkup-campaign-detail/${campaign_id}`);
        if (campaignResponse.data.error) {
          setError(campaignResponse.data.message);
          enqueueSnackbar(campaignResponse.data.message, { variant: "error" });
        } else {
          const campaignData = campaignResponse.data.data;
          setCampaign({
            ...campaignData,
            campaign_id: campaignData.campaign_id || campaignData.id,
          });
          const initialExams = campaignData.specialist_exams.map((exam) => ({
            spe_exam_id: exam.id,
            status: "CANNOT_ATTACH",
          }));
          setSelectedExams(initialExams);
        }

        // Fetch previously registered (waiting) specialist exams
        const waitingExamsResponse = await axiosClient.get(
          `/checkup-register/${student_id}/${campaign_id}/specialist-exams/waiting`
        );
        if (waitingExamsResponse.data.error) {
          console.error("Error fetching waiting specialist exams:", waitingExamsResponse.data.message);
          setWaitingExams([]);
        } else {
          setWaitingExams(waitingExamsResponse.data.data || []);
        }
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.");
        enqueueSnackbar("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campaign_id, student_id]);

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
    if (!registerId) {
      enqueueSnackbar("Không tìm thấy Register ID. Vui lòng kiểm tra lại.", { variant: "error" });
      return;
    }
    if (!reason.trim()) {
      enqueueSnackbar("Vui lòng nhập lý do để tiếp tục.", { variant: "error" });
      return;
    }

    const selectedCount = selectedExams.filter(exam => exam.status === "WAITING").length;
    if (selectedCount === 0) {
      enqueueSnackbar("Vui lòng chọn ít nhất một hạng mục khám.", { variant: "error" });
      return;
    }

    const submitData = {
      parent_id,
      student_id,
      campaign_id,
      submit_time: new Date().toISOString(),
      reason,
      exams: selectedExams,
    };

    try {
      setSubmitting(true);
      const response = await axiosClient.patch(`/checkup-register/${registerId}/submit`, submitData);
      if (response.data.error) {
        enqueueSnackbar(response.data.message || "Không thể gửi đăng ký.", { variant: "error" });
      } else {
        enqueueSnackbar("Đăng ký kiểm tra sức khỏe thành công!", { variant: "success" });
        navigate(`/parent/edit/${student_id}/regular-checkup`, { state: { childId: student_id } });
      }
    } catch (err) {
      enqueueSnackbar("Không thể gửi đăng ký. Vui lòng thử lại.", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    const { from, childId } = location.state || {};
    const validFromRoutes = [
      "/parent/student-regular-checkup",
      `/parent/edit/${student_id}/regular-checkup`,
    ];

    // Try navigate(-1) if history stack exists
    if (window.history.length > 1) {
      navigate(-1);
    }
    // Fallback to state.from if valid
    else if (from && validFromRoutes.some((route) => from === route || from.startsWith("/parent/edit/"))) {
      navigate(from, { state: { childId: student_id } });
    }
    // Fallback to default route
    else {
      navigate(`/parent/edit/${student_id}/regular-checkup`, { state: { childId: student_id } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button
            onClick={handleBack}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const selectedCount = selectedExams.filter(exam => exam.status === "WAITING").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Đăng ký kiểm tra sức khỏe</h1>
                <p className="text-sm text-gray-500">Mã chiến dịch: {campaign?.campaign_id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Campaign Info */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {campaign?.campaign_name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Thời gian</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(campaign?.start_date)} - {formatDate(campaign?.end_date)}
                  </p>
                </div>
              </div>
              
              {campaign?.campaign_location && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Địa điểm</p>
                    <p className="text-sm text-gray-600">{campaign.campaign_location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Previously Registered Exams */}
          {waitingExams.length > 0 && (
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Các hạng mục khám đã đăng ký
              </h3>
              <div className="flex flex-wrap gap-2">
                {waitingExams.map((examName, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {examName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Exam Selection */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{campaign?.specialist_exams?.length > 0 ? 'Chọn lại': 'Chọn'} hạng mục cần khám</h3>
              <span className="text-sm text-gray-500">
                Đã chọn: {selectedCount}/{campaign?.specialist_exams?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {campaign?.specialist_exams?.map((exam) => {
                const selectedExam = selectedExams.find((e) => e.spe_exam_id === exam.id);
                const isSelected = selectedExam?.status === "WAITING";
                
                return (
                  <label
                    key={exam.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleExamSelection(exam.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{exam.name}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Reason Input */}
          <div className="p-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-900 mb-3">
              Lý do đăng ký <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              placeholder="Vui lòng nhập lý do đăng ký kiểm tra sức khỏe..."
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-gray-50 rounded-b-lg">
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason.trim() || selectedCount === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Gửi đăng ký
                  </>
                )}
              </button>
            </div>
            
            {selectedCount === 0 && (
              <p className="text-sm text-amber-600 mt-2 text-right">
                Vui lòng chọn ít nhất một hạng mục khám
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularCheckupSurvey;  