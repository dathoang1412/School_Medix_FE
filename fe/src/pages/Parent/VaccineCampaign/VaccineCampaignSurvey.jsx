import React, { useEffect, useState } from "react";
import axiosClient from "../../../config/axiosClient";
import { useParams, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

const VaccineCampaignSurvey = () => {
  const { student_id, campaign_id } = useParams();
  const navigate = useNavigate();

  const [register, setRegister] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showRefuseForm, setShowRefuseForm] = useState(false);
  const [refuseReason, setRefuseReason] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const fetchRegister = async () => {
      try {
        setLoading(true);
        setError(null); // Reset lỗi trước khi gọi API
        const res = await axiosClient.get(
          `/student/${student_id}/vaccination-campaign/${campaign_id}/register`
        );
        const registerData = res.data.data[0];
        if (!registerData) {
          throw new Error("Không tìm thấy thông tin đăng ký");
        }
        setRegister(registerData);
        // Đặt lại form từ chối và checkbox khi tải dữ liệu mới
        setShowRefuseForm(false);
        setRefuseReason("");
        setConsentChecked(false);
      } catch (err) {
        setError("Không thể tải thông tin đăng ký");
        console.error("Lỗi khi tải thông tin đăng ký:", err);
        enqueueSnackbar("Không thể tải thông tin đăng ký", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchRegister();
  }, [student_id, campaign_id]);

  const handleAccept = async () => {
    if (!consentChecked) {
      enqueueSnackbar("Vui lòng xác nhận đồng ý tiêm chủng", { variant: "error" });
      return;
    }

    if (!register?.id) {
      enqueueSnackbar("Không tìm thấy ID đăng ký", { variant: "error" });
      return;
    }

    if (register.is_registered === "ACCEPTED") {
      enqueueSnackbar("Đăng ký đã được chấp nhận trước đó", { variant: "warning" });
      return;
    }

    try {
      setProcessing(true);
      await axiosClient.patch(`/vaccination-register/${register.id}/accept`);
      enqueueSnackbar("Chấp nhận đăng ký thành công", { variant: "success" });
      navigate(-1);
    } catch (err) {
      setError("Không thể chấp nhận đăng ký");
      console.error("Lỗi khi chấp nhận đăng ký:", err);
      enqueueSnackbar(err.response?.data?.message || "Không thể chấp nhận đăng ký", {
        variant: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRefuseClick = () => {
    setShowRefuseForm(!showRefuseForm);
    if (showRefuseForm) {
      setRefuseReason("");
    }
  };

  const handleRefuseSubmit = async () => {
    if (!register?.id) {
      enqueueSnackbar("Không tìm thấy ID đăng ký", { variant: "error" });
      return;
    }

    if (register.is_registered === "REFUSED") {
      enqueueSnackbar("Đăng ký đã bị từ chối trước đó", { variant: "warning" });
      return;
    }

    if (!refuseReason.trim()) {
      enqueueSnackbar("Vui lòng cung cấp lý do từ chối", { variant: "error" });
      return;
    }

    try {
      setProcessing(true);
      await axiosClient.patch(`/vaccination-register/${register.id}/refuse`, {
        reason: refuseReason,
      });
      enqueueSnackbar("Từ chối đăng ký thành công", { variant: "success" });
      navigate(-1);
    } catch (err) {
      setError("Không thể từ chối đăng ký");
      console.error("Lỗi khi từ chối đăng ký:", err);
      enqueueSnackbar(err.response?.data?.message || "Không thể từ chối đăng ký", {
        variant: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span classNameerdade="text-gray-600 font-medium">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold">Lỗi</h3>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Quay lại trang trước</span>
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mẫu đồng ý tiêm chủng</h1>
              <p className="text-gray-600 mt-2">Vui lòng xem xét và xác nhận đăng ký tiêm chủng cho con bạn</p>
            </div>
          </div>
        </div>

        {/* Registration Details Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin học sinh</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mã học sinh</p>
                <p className="text-lg font-semibold text-gray-900">{student_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mã chiến dịch</p>
                <p className="text-lg font-semibold text-gray-900">{campaign_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Trạng thái đăng ký</p>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      register?.is_registered === "ACCEPTED"
                        ? "bg-green-100 text-green-800"
                        : register?.is_registered === "REFUSED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        register?.is_registered === "ACCEPTED"
                          ? "bg-green-400"
                          : register?.is_registered === "REFUSED"
                          ? "bg-red-400"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    {register?.is_registered === "ACCEPTED"
                      ? "Đã chấp nhận"
                      : register?.is_registered === "REFUSED"
                      ? "Đã từ chối"
                      : "Chưa đăng ký"}
                  </span>
                </div>
              </div>

              {register?.reason && (
                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lý do hiện tại</p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900">{register.reason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Consent Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Đồng ý của phụ huynh</h2>
          </div>
          <div className="p-6">
            <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin quan trọng</h3>
              <ul className="space-y-3 text-gray-700 list-disc pl-5">
                <li>Tôi xác nhận tôi là phụ huynh/người giám hộ hợp pháp của học sinh nêu trên</li>
                <li>Tôi đã đọc và hiểu thông tin về chương trình tiêm chủng</li>
                <li>Tôi nhận thức được lợi ích và rủi ro tiềm tàng của việc tiêm chủng</li>
                <li>Tôi đồng ý cho con tôi được tiêm vaccine trong chiến dịch này</li>
                <li>Tôi hiểu rằng tôi có thể rút lại sự đồng ý này bất kỳ lúc nào trước khi tiêm</li>
              </ul>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="consent-checkbox"
                  name="consent-checkbox"
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  disabled={register?.is_registered === "ACCEPTED" || register?.is_registered === "REFUSED"}
                  className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="consent-checkbox" className="font-medium text-gray-700">
                  Tôi xác nhận tất cả các nội dung trên và đồng ý cho con tôi tiêm chủng
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Bằng cách chọn ô này, bạn xác nhận và chấp nhận các điều khoản
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        {register?.is_registered !== "ACCEPTED" && register?.is_registered !== "REFUSED" && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Gửi quyết định của bạn</h2>
            </div>
            <div className="p-6">
              {/* Refuse Form */}
              {showRefuseForm && (
                <div className="mb-6 p-6 bg-red-50 rounded-lg border border-red-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lý do từ chối</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vui lòng nêu rõ lý do <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={refuseReason}
                    onChange={(e) => setRefuseReason(e.target.value)}
                    className="w-full p-4 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Ví dụ: Con tôi bị dị ứng với thành phần vaccine..."
                    required
                  />
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={handleRefuseClick}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleRefuseSubmit}
                      disabled={!refuseReason.trim() || processing}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Gửi từ chối</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={handleRefuseClick}
                  disabled={processing}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                    showRefuseForm
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      : "bg-red-600 text-white hover:bg-red-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{showRefuseForm ? "Hủy từ chối" : "Từ chối tiêm chủng"}</span>
                </button>

                <button
                  onClick={handleAccept}
                  disabled={!consentChecked || processing || register?.is_registered === "ACCEPTED"}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Chấp nhận tiêm chủng</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccineCampaignSurvey;