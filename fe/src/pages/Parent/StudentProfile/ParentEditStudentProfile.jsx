import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../config/axiosClient";
import { getStudentInfo } from "../../../service/childenService";
import { ArrowLeft, Loader2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";

const ParentEditStudentProfile = () => {
  const navigate = useNavigate();
  const { student_id } = useParams();
  const [formData, setFormData] = useState({
    address: "",
    phone_number: "",
    profile_img_url: "",
    name: "",
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
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getStudentInfo(student_id);
        console.log("Child Info: ", response);
        const studentData = response;
        setFormData({
          address: studentData.address || "",
          phone_number: studentData.phone_number || "",
          profile_img_url: studentData.profile_img_url || "",
          name: studentData.name || "",
        });
        setEmailData((prev) => ({
          ...prev,
          currentEmail: studentData.email || "",
          newEmail: studentData.email || "",
        }));
        setPreviewUrl(studentData.profile_img_url || "");
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setError(err.message || "Không thể tải thông tin học sinh");
        setIsLoading(false);
      }
    };
    fetchStudentProfile();
  }, [student_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        const response = await axiosClient.get(`/user-update-email/check-otp`, {
          params: {
            email: emailData.newEmail,
            otp: value,
          },
        });
        console.log("OTP verification response:", response.data);
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
        console.error("OTP verification error:", err.response?.data || err);
        enqueueSnackbar(
          "Lỗi khi xác thực OTP: " + (err.message || "Mã không đúng."),
          { variant: "error" }
        );
      }
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
      if (!emailData.newEmail || !emailData.isEmailValid) {
        throw new Error("Vui lòng nhập email hợp lệ.");
      }
      const response = await axiosClient.post(`/user-update-email/create-otp`, {
        email: emailData.newEmail,
      });
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      setEmailData((prev) => ({ ...prev, isOtpSent: true }));
      enqueueSnackbar("Mã OTP đã được gửi!", {
        variant: "success",
      });
    } catch (err) {
      enqueueSnackbar(
        "Lỗi khi gửi OTP: " + (err.message || "Vui lòng thử lại."),
        { variant: "error" }
      );
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    let uploadedProfileUrl = formData.profile_img_url;

    // Upload image if a file is selected
    if (selectedFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("image", selectedFile);
        const response = await axiosClient.post(
          "/profile-img",
          uploadFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
        setIsSubmittingProfile(false);
        return;
      }
    }

    try {
      // Update profile information
      const updateData = {
        address: formData.address,
        phone_number: formData.phone_number,
        profile_img_url: uploadedProfileUrl,
      };
      const hasProfileChanges =
        formData.address !== "" ||
        formData.phone_number !== "" ||
        uploadedProfileUrl !== formData.profile_img_url;

      if (hasProfileChanges) {
        console.log("Updating profile:", {
          id: student_id,
          role: "student",
          updates: updateData,
        });
        const response = await axiosClient.patch("/user-update-profile", {
          id: student_id,
          role: "student",
          updates: updateData,
        });
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        enqueueSnackbar("Cập nhật thông tin học sinh thành công!", {
          variant: "success",
        });
      }

      setFormData((prev) => ({ ...prev, profile_img_url: uploadedProfileUrl }));
      setSelectedFile(null);
      navigate(`/parent/edit/${student_id}/health-profile`);
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err);
      enqueueSnackbar(
        "Lỗi khi cập nhật thông tin: " + (err.message || "Vui lòng thử lại."),
        { variant: "error" }
      );
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingEmail(true);

    try {
      if (emailData.isOtpVerified && emailData.newEmail && formData.name) {
        console.log("Registering email for student:", {
          email: emailData.newEmail,
          otp: emailData.otp,
          role: "student",
          student_id,
          name: formData.name,
        });
        const emailResponse = await axiosClient.post(
          `/register-email-for-student`,
          {
            email: emailData.newEmail,
            otp: emailData.otp,
            role: "student",
            student_id,
            name: formData.name,
          }
        );
        if (emailResponse.data.error) {
          throw new Error(emailResponse.data.message);
        }
        enqueueSnackbar("Tạo tài khoản email thành công!", {
          variant: "success",
        });
        setEmailData((prev) => ({
          ...prev,
          currentEmail: emailData.newEmail,
          isEditEmail: false,
          isOtpSent: false,
          isOtpVerified: false,
          newEmail: emailData.newEmail,
          otp: "",
        }));
      } else {
        throw new Error("Thiếu thông tin email hoặc tên học sinh.");
      }
    } catch (err) {
      console.error("Email registration error:", err.response?.data || err);
      enqueueSnackbar(
        "Lỗi khi tạo tài khoản email: " + (err.message || "Vui lòng thử lại."),
        { variant: "error" }
      );
    } finally {
      setIsSubmittingEmail(false);
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
            onClick={() =>
              navigate(`/parent/edit/${student_id}/health-profile`)
            }
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
            onClick={() =>
              navigate(`/parent/edit/${student_id}/health-profile`)
            }
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer mb-4"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl font-medium text-gray-900">
              Chỉnh Sửa Thông Tin Học Sinh
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Cập nhật thông tin cá nhân của học sinh
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
              <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                      isSubmittingProfile ||
                      (!formData.address &&
                        !formData.phone_number &&
                        !formData.profile_img_url &&
                        !selectedFile)
                    }
                    className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 ${
                      isSubmittingProfile ||
                      (!formData.address &&
                        !formData.phone_number &&
                        !formData.profile_img_url &&
                        !selectedFile)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmittingProfile && (
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
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {emailData.currentEmail ? (
                      <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-50">
                        {emailData.currentEmail}
                      </p>
                    ) : (
                      <>
                        {!emailData.isEditEmail && (
                          <button
                            type="button"
                            onClick={startEditEmail}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            Tạo Tài Khoản
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
                        {emailData.isOtpSent && (
                          <div className="mt-4">
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
                        {emailData.isEditEmail && (
                          <div className="flex justify-end mt-6">
                            <button
                              type="submit"
                              disabled={
                                isSubmittingEmail ||
                                !emailData.isOtpVerified ||
                                !emailData.newEmail ||
                                !formData.name
                              }
                              className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 ${
                                isSubmittingEmail ||
                                !emailData.isOtpVerified ||
                                !emailData.newEmail ||
                                !formData.name
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {isSubmittingEmail && (
                                <Loader2 size={16} className="animate-spin" />
                              )}
                              Lưu
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentEditStudentProfile;
