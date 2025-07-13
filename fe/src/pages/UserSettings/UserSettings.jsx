import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../config/axiosClient";
import { getUser, getUserRole } from "../../service/authService";
import { ArrowLeft, Loader2 } from "lucide-react";
import Footer from "../../components/Footer";
import { enqueueSnackbar } from "notistack";
import UserSendResetLinkConfirmModal from "../../components/UserSendResetLinkConfirmModal";

const UserSettings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: "",
    phone_number: "",
    profile_img_url: "",
  });
  const [detail, setDetail] = useState({
    name: "",
    dob: "",
    age: "",
  });
  const [emailData, setEmailData] = useState({
    currentEmail: "",
    newEmail: "",
    otp: "",
    isOtpSent: false,
    isOtpVerified: false,
    isEditEmail: false,
    isEmailValid: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isShowResetModal, setIsShowResetModal] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      setIsLoading(true);
      try {
        const role = getUserRole();
        const userId = getUser()?.id;
        if (!role || !userId) {
          setError(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
          return;
        }
        const res = await axiosClient.get(`${role}/${userId}`);
        const userData = res.data.data;
        setFormData({
          address: userData.address || "",
          phone_number: userData.phone_number || "",
          profile_img_url: userData.profile_img_url || "",
        });
        setDetail({
          name: userData.name || "",
          dob: userData.dob || "",
          age: userData.age || "",
        });
        setPreviewUrl(userData.profile_img_url || "");
        setEmailData((prev) => ({
          ...prev,
          currentEmail: userData.email || "",
          newEmail: userData.email || "",
        }));
      } catch (err) {
        setError(
          "Lỗi khi tải thông tin cài đặt: " +
            (err.message || "Vui lòng thử lại.")
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = async (e) => {
    const { value } = e.target;
    setEmailData((prev) => ({ ...prev, newEmail: value }));
    if (value && value !== emailData.currentEmail) {
      try {
        const response = await axiosClient.get(`/exist-email?email=${value}`);
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        if (response.data.email_existed) {
          setEmailData((prev) => ({ ...prev, isEmailValid: false }));
          enqueueSnackbar("Email đã tồn tại trong hệ thống!", {
            variant: "error",
          });
        } else {
          setEmailData((prev) => ({ ...prev, isEmailValid: true }));
        }
      } catch (err) {
        enqueueSnackbar(
          "Lỗi khi kiểm tra email: " + (err.message || "Vui lòng thử lại."),
          { variant: "error" }
        );
      }
    } else if (value === emailData.currentEmail) {
      setEmailData((prev) => ({ ...prev, isEmailValid: true }));
    }
  };

  const handleOtpChange = async (e) => {
    const { value } = e.target;
    setEmailData((prev) => ({ ...prev, otp: value }));
    if (value.length === 6) {
      try {
        const role = getUserRole();
        const userId = getUser()?.id;
        const response = await axiosClient.get(
          `/user-update-email/check-otp?email=${emailData.newEmail}&otp=${value}`
        );
        if (response.data.error || !response.data.is_valid_otp) {
          setEmailData((prev) => ({ ...prev, isOtpVerified: false }));
          enqueueSnackbar(
            "Lỗi khi xác thực OTP: " +
              (response.data.message || "Mã không đúng."),
            { variant: "error" }
          );
        } else {
          setEmailData((prev) => ({ ...prev, isOtpVerified: true }));
          enqueueSnackbar("Mã OTP đã được xác thực!", { variant: "success" });
        }
      } catch (err) {
        enqueueSnackbar(
          "Lỗi khi xác thực OTP: " + (err.message || "Mã không đúng."),
          { variant: "error" }
        );
      }
    }
  };

  const handleSendResetPasswordLink = async () => {
    setIsSendingResetLink(true);
    try {
      const response = await axiosClient.post("/send-reset-pass-link", {
        email: emailData.currentEmail,
      });
      if (response.data.error) throw new Error(response.data.message);

      enqueueSnackbar("Link đổi mật khẩu đã được gửi tới email!", {
        variant: "success",
      });

      setIsShowResetModal(false);
    } catch (err) {
      enqueueSnackbar(
        "Gửi link thất bại: " + (err.message || "Vui lòng thử lại."),
        { variant: "error" }
      );
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditEmail = () => {
    setEmailData((prev) => ({
      ...prev,
      isEditEmail: true,
      newEmail: "",
      isOtpSent: false,
      isOtpVerified: false,
      isEmailValid: true,
    }));
  };

  const sendOtp = async () => {
    try {
      const role = getUserRole();
      const userId = getUser()?.id;
      if (!role || !userId || !emailData.newEmail || !emailData.isEmailValid) {
        throw new Error("Vui lòng nhập email hợp lệ.");
      }
      const response = await axiosClient.post(`/user-update-email/create-otp`, {
        email: emailData.newEmail,
      });
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      setEmailData((prev) => ({ ...prev, isOtpSent: true }));
      enqueueSnackbar("Mã OTP đã được gửi đến email của bạn!", {
        variant: "success",
      });
    } catch (err) {
      enqueueSnackbar(
        "Lỗi khi gửi OTP: " + (err.message || "Vui lòng thử lại."),
        { variant: "error" }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let uploadedProfileUrl = formData.profile_img_url;

    // Upload ảnh nếu có file được chọn
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const response = await axiosClient.post("/profile-img", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        uploadedProfileUrl = response.data.profile_img_url;
        enqueueSnackbar("Tải lên ảnh đại diện thành công!", {
          variant: "success",
        });
      } catch (err) {
        enqueueSnackbar(
          "Lỗi khi tải lên ảnh: " + (err.message || "Vui lòng thử lại."),
          { variant: "error" }
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const role = getUserRole();
      const userId = getUser()?.id;
      if (!role || !userId) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
      const updateData = {
        profile_img_url: uploadedProfileUrl,
        phone_number: formData.phone_number,
        address: formData.address,
      };
      if (emailData.isOtpVerified && emailData.newEmail) {
        const response = await axiosClient.patch("/user-update-email", {
          email: emailData.newEmail,
          otp: emailData.otp,
          role,
          id: userId,
        });
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        enqueueSnackbar("Cập nhật email thành công!", { variant: "success" });
      } else {
        const response = await axiosClient.patch("/user-update-profile", {
          id: userId,
          role,
          updates: updateData,
        });
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        enqueueSnackbar("Cập nhật thông tin cá nhân thành công!", {
          variant: "success",
        });
      }
      setFormData((prev) => ({ ...prev, profile_img_url: uploadedProfileUrl }));
      setSelectedFile(null); // Xóa file sau khi upload thành công
      navigate("/profile");
    } catch (err) {
      enqueueSnackbar(
        "Lỗi khi cập nhật cài đặt: " + (err.message || "Vui lòng thử lại."),
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 cursor-pointer"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer mb-4"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl font-medium text-gray-900">
              Cài Đặt Người Dùng
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Chỉnh sửa thông tin cá nhân của bạn
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-md">
          <div className="p-6">
            {/* Personal Information Section */}
            <section>
              <div className="py-2 border-b border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-blue-600">
                  Thông Tin Cá Nhân
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label
                      htmlFor="profile_img_url"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Ảnh Đại Diện
                    </label>
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          previewUrl || "https://via.placeholder.com/120x160"
                        }
                        alt="Ảnh đại diện"
                        className="w-[120px] h-[160px] object-cover border border-gray-200 rounded"
                      />
                      <input
                        type="file"
                        id="profile_img_url"
                        name="profile_img_url"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-48 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và Tên
                    </label>
                    <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 bg-gray-100">
                      {detail.name || "Chưa có thông tin"}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="phone_number"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Số Điện Thoại
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày Sinh
                    </label>
                    <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 bg-gray-100">
                      {detail.dob
                        ? new Date(detail.dob).toLocaleDateString("vi-VN")
                        : "Chưa có thông tin"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuổi
                    </label>
                    <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 bg-gray-100">
                      {detail.age || "Chưa có thông tin"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Địa Chỉ
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (!formData.address &&
                        !formData.phone_number &&
                        !formData.profile_img_url &&
                        !selectedFile)
                    }
                    className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 ${
                      isSubmitting ||
                      (!formData.address &&
                        !formData.phone_number &&
                        !formData.profile_img_url &&
                        !selectedFile)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Lưu
                  </button>
                </div>
              </form>
            </section>

            {/* Account Section */}
            <section className="mt-8">
              <div className="py-2 border-b border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-blue-600">
                  Tài Khoản
                </h2>
              </div>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Hiện Tại
                    </label>
                    <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-50">
                      {emailData.currentEmail}
                    </p>
                    {!emailData.isEditEmail && (
                      <button
                        type="button"
                        onClick={startEditEmail}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Đổi Email
                      </button>
                    )}
                    {emailData.isEditEmail && (
                      <>
                        <label
                          htmlFor="newEmail"
                          className="block mt-4 text-sm font-medium text-gray-700 mb-1"
                        >
                          Email Mới
                        </label>
                        <input
                          type="email"
                          id="newEmail"
                          name="newEmail"
                          value={emailData.newEmail}
                          onChange={handleEmailChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập email mới"
                        />
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={
                            !emailData.newEmail ||
                            !emailData.isEmailValid ||
                            emailData.isOtpSent
                          }
                          className={`mt-2 px-4 py-2 text-sm rounded-md ${
                            !emailData.newEmail ||
                            !emailData.isEmailValid ||
                            emailData.isOtpSent
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {emailData.isOtpSent ? "Đã Gửi OTP" : "Gửi OTP"}
                        </button>
                      </>
                    )}
                  </div>
                  {emailData.isOtpSent && (
                    <div className="md:col-span-3">
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mã OTP
                      </label>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={emailData.otp}
                        onChange={handleOtpChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập mã OTP"
                        maxLength="6"
                      />
                    </div>
                  )}
                </div>
                {emailData.isOtpVerified && (
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      Cập nhật Email
                    </button>
                  </div>
                )}
              </form>
            </section>

            {/* Change Password Section */}
            <section className="mt-8">
              <div className="flex justify-start">
                <button
                  onClick={() => setIsShowResetModal(true)}
                  disabled={isSendingResetLink}
                  className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-md flex items-center gap-2 ${
                    isSendingResetLink
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {isSendingResetLink && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isSendingResetLink ? "Đang gửi..." : "Đổi Mật Khẩu"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
      {isShowResetModal && (
        <UserSendResetLinkConfirmModal
          email={emailData.currentEmail}
          onClose={() => setIsShowResetModal(false)}
          onConfirm={handleSendResetPasswordLink}
        />
      )}
    </div>
  );
};

export default UserSettings;
