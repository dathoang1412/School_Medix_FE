import React, { useState } from "react";
import axiosClient from "../../../config/axiosClient";
import { Loader2 } from "lucide-react";

const SendRecoveryLink = ({ email, otp, onNext }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSendRecoveryLink = async () => {
    setError("");
    setLoading(true);

    try {
      console.log(email, otp);
      const res = await axiosClient.post(
        "/forgot-password/send-recovery-link",
        {
          email,
          otp,
        }
      );

      console.log("✅ Gửi link thành công:", res.data.message);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("❌ Gửi link thất bại:", err);
      setError("Không thể gửi link đặt lại mật khẩu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleResendRecoveryLink = async () => {
    setResendLoading(true);
    setError("");

    try {
      const res = await axiosClient.post(
        "/forgot-password/send-recovery-link",
        {
          email,
          otp,
        }
      );

      console.log("✅ Gửi lại thành công:", res.data.message);
    } catch (err) {
      console.error("❌ Gửi lại thất bại:", err);
      setError("Không thể gửi lại liên kết. Vui lòng thử lại.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Gửi Link Đổi Mật Khẩu
        </h2>
        <p className="text-gray-600">
          Chúng tôi sẽ gửi liên kết đổi mật khẩu đến{" "}
          <span className="font-medium">{email}</span>
        </p>
      </div>

      <div>
        <button
          onClick={handleSendRecoveryLink}
          className="w-full cursor-pointer bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium mb-4 flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>
            {loading ? "Đang gửi liên kết..." : "Gửi link đổi mật khẩu"}
          </span>
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        <div className="text-center">
          <span className="text-gray-600 text-sm">
            Không nhận được liên kết?{" "}
          </span>
          <button
            onClick={handleResendRecoveryLink}
            disabled={resendLoading}
            className="text-blue-500 cursor-pointer hover:underline hover:text-blue-600 font-medium text-sm disabled:text-gray-400 inline-flex items-center space-x-1"
          >
            {resendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>{resendLoading ? "Đang gửi lại..." : "Gửi lại"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendRecoveryLink;
