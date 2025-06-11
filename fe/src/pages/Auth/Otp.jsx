import React, { useState, useEffect } from "react";
import { ChevronLeft, Phone, Lock, Key } from "lucide-react";

const sendOtp = async (phone) => {
  console.log("Sending OTP to:", phone);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const verifyOtp = async (phone, otp) => {
  console.log("Verifying OTP:", phone, otp);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const Otp = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (stage === 1) {
      setPhone("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [stage]);

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await sendOtp(phone);
      setStage(2);
    } catch (err) {
      setError("Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await verifyOtp(phone, otp);
      setStage(3);
    } catch (err) {
      setError("Mã OTP không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    
    setLoading(true);
    setError("");
    
    // Simulate password reset
    setTimeout(() => {
      setLoading(false);
      alert("Đặt lại mật khẩu thành công!");
      setStage(1);
    }, 1000);
  };

  const BackButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute left-4 top-4 flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ChevronLeft size={20} />
      <span className="text-sm">Quay lại</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        {/* Stage 1: Phone Input */}
        {stage === 1 && (
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Phone className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực số điện thoại</h2>
            <p className="text-gray-600 mb-6">Nhập số điện thoại để nhận mã OTP</p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại (vd: 0901234567)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleSendOTP}
                disabled={loading || !phone}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: OTP Verification */}
        {stage === 2 && (
          <div className="text-center">
            <BackButton onClick={() => setStage(1)} />
            
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Key className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nhập mã OTP</h2>
            <p className="text-gray-600 mb-6">
              Mã OTP đã được gửi đến số <span className="font-medium">{phone}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Nhập mã OTP 6 chữ số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? "Đang xác thực..." : "Xác thực OTP"}
              </button>
              
              <button
                onClick={() => handleSendOTP()}
                className="w-full text-blue-600 hover:text-blue-700 py-2 font-medium transition-colors"
              >
                Gửi lại mã OTP
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: New Password */}
        {stage === 3 && (
          <div className="text-center">
            <BackButton onClick={() => setStage(2)} />
            
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Lock className="text-purple-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt mật khẩu mới</h2>
            <p className="text-gray-600 mb-6">Tạo mật khẩu mới cho tài khoản của bạn</p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Otp;