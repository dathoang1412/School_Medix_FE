import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import axiosClient from "../../config/axiosClient";
import { getUser, getUserRole } from "../../service/authService";
import { getSession } from "../../config/Supabase";
import UserSendResetLinkConfirmModal from "../../components/UserSendResetLinkConfirmModal";

const StudentSettings = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isShowResetModal, setIsShowResetModal] = useState(false);

  // Email change states
  const [emailData, setEmailData] = useState({
    currentEmail: "",
    newEmail: "",
    otp: "",
    isOtpSent: false,
    isOtpVerified: false,
    isEditEmail: false,
    isEmailValid: true,
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const { data, error } = await getSession();
        if (error || !data.session) {
          enqueueSnackbar("Vui lòng đăng nhập để tiếp tục!", {
            variant: "error",
          });
          navigate("/login");
          return;
        }

        const user = getUser();
        const role = getUserRole();
        
        if (role !== "student") {
          enqueueSnackbar("Bạn không có quyền truy cập trang này!", {
            variant: "error",
          });
          navigate("/");
          return;
        }

        // Fetch student profile
        const response = await axiosClient.get(`/student/${user.id}`);
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        
        const student = response.data.data;
        setStudentData(student);
        setEmailData(prev => ({
          ...prev,
          currentEmail: student.email || "",
          newEmail: student.email || "",
        }));

      } catch (error) {
        enqueueSnackbar("Không thể tải dữ liệu: " + error.message, {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate, enqueueSnackbar]);

  // Email change handlers
  const handleEmailChange = async (e) => {
    const { value } = e.target;
    setEmailData(prev => ({ ...prev, newEmail: value }));
    
    if (value && value !== emailData.currentEmail) {
      try {
        const response = await axiosClient.get(`/exist-email?email=${value}`);
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        if (response.data.email_existed) {
          setEmailData(prev => ({ ...prev, isEmailValid: false }));
          enqueueSnackbar("Email đã tồn tại trong hệ thống!", {
            variant: "error",
          });
        } else {
          setEmailData(prev => ({ ...prev, isEmailValid: true }));
        }
      } catch (error) {
        console.error("Error checking email:", error);
      }
    } else {
      setEmailData(prev => ({ ...prev, isEmailValid: true }));
    }
  };

  const handleOtpChange = async (e) => {
    const { value } = e.target;
    setEmailData(prev => ({ ...prev, otp: value }));
    
    if (value.length === 6) {
      try {
        const response = await axiosClient.post("/verify-otp", {
          email: emailData.newEmail,
          otp: value,
        });
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        setEmailData(prev => ({ ...prev, isOtpVerified: true }));
        enqueueSnackbar("Xác thực OTP thành công!", {
          variant: "success",
        });
      } catch (error) {
        enqueueSnackbar("Mã OTP không đúng!", {
          variant: "error",
        });
      }
    }
  };

  const startEditEmail = () => {
    setEmailData(prev => ({ ...prev, isEditEmail: true }));
  };

  const sendOtp = async () => {
    try {
      const response = await axiosClient.post("/send-otp", {
        email: emailData.newEmail,
      });
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      setEmailData(prev => ({ ...prev, isOtpSent: true }));
      enqueueSnackbar("Mã OTP đã được gửi đến email của bạn!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Lỗi khi gửi OTP: " + error.message, {
        variant: "error",
      });
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const user = getUser();
      const response = await axiosClient.patch("/user-update-email", {
        email: emailData.newEmail,
        otp: emailData.otp,
        role: "student",
        id: user.id,
      });
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      
      setEmailData(prev => ({
        ...prev,
        currentEmail: emailData.newEmail,
        isEditEmail: false,
        isOtpSent: false,
        isOtpVerified: false,
        otp: "",
      }));
      
      enqueueSnackbar("Cập nhật email thành công!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Lỗi khi cập nhật email: " + error.message, {
        variant: "error",
      });
    }
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar("Mật khẩu xác nhận không khớp!", {
        variant: "error",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      enqueueSnackbar("Mật khẩu phải có ít nhất 6 ký tự!", {
        variant: "error",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const user = getUser();
      const response = await axiosClient.patch("/user-change-password", {
        id: user.id,
        role: "student",
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      });
      
      enqueueSnackbar("Thay đổi mật khẩu thành công!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Lỗi khi thay đổi mật khẩu: " + error.message, {
        variant: "error",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendResetPasswordLink = async () => {
    setIsSendingResetLink(true);
    try {
      const response = await axiosClient.post("/send-reset-password-link", {
        email: emailData.currentEmail,
      });
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      enqueueSnackbar("Link đặt lại mật khẩu đã được gửi đến email của bạn!", {
        variant: "success",
      });
      setIsShowResetModal(false);
    } catch (error) {
      enqueueSnackbar("Lỗi khi gửi link: " + error.message, {
        variant: "error",
      });
    } finally {
      setIsSendingResetLink(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/student/dashboard")}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Cài đặt tài khoản
                </h1>
                <p className="text-sm text-gray-600">
                  Quản lý thông tin tài khoản và bảo mật
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Thay đổi Email
                </h2>
                <p className="text-sm text-gray-600">
                  Cập nhật địa chỉ email của bạn
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email hiện tại
                </label>
                <input
                  type="email"
                  value={emailData.currentEmail}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-500"
                />
              </div>

              {!emailData.isEditEmail ? (
                <button
                  onClick={startEditEmail}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Thay đổi Email
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email mới
                    </label>
                    <input
                      type="email"
                      value={emailData.newEmail}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập email mới"
                    />
                    {!emailData.isEmailValid && (
                      <p className="text-red-500 text-sm mt-1">
                        Email đã tồn tại trong hệ thống
                      </p>
                    )}
                  </div>

                  <button
                    onClick={sendOtp}
                    disabled={!emailData.newEmail || !emailData.isEmailValid || emailData.isOtpSent}
                    className={`px-4 py-2 text-sm rounded-md ${
                      !emailData.newEmail || !emailData.isEmailValid || emailData.isOtpSent
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {emailData.isOtpSent ? "Đã gửi OTP" : "Gửi OTP"}
                  </button>

                  {emailData.isOtpSent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã OTP
                      </label>
                      <input
                        type="text"
                        value={emailData.otp}
                        onChange={handleOtpChange}
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập mã OTP"
                      />
                    </div>
                  )}

                  {emailData.isOtpVerified && (
                    <button
                      onClick={handleUpdateEmail}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Cập nhật Email
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Thay đổi Mật khẩu
                </h2>
                <p className="text-sm text-gray-600">
                  Cập nhật mật khẩu tài khoản của bạn
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("showCurrentPassword")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {passwordData.showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("showNewPassword")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {passwordData.showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("showConfirmPassword")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {passwordData.showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 ${
                  isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isChangingPassword ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Thay đổi Mật khẩu
              </button>
            </div>
          </div>

          {/* Reset Password */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Đặt lại Mật khẩu
                </h2>
                <p className="text-sm text-gray-600">
                  Gửi link đặt lại mật khẩu qua email
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsShowResetModal(true)}
              disabled={isSendingResetLink}
              className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 ${
                isSendingResetLink
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {isSendingResetLink ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              Gửi Link Đặt Lại Mật Khẩu
            </button>
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Lưu ý bảo mật
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sử dụng mật khẩu mạnh với ít nhất 6 ký tự</li>
                  <li>• Không chia sẻ thông tin đăng nhập với người khác</li>
                  <li>• Đăng xuất khi sử dụng xong</li>
                  <li>• Liên hệ admin nếu có vấn đề về tài khoản</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default StudentSettings; 