import React, { useState } from 'react';
// import axiosClient from '../../../config/axiosClient';
import { Loader2 } from 'lucide-react';


const EnterOTP = ({ email, onNext, onResend }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
  
    const handleVerifyOTP = () => {
      setError('');
      setLoading(true);
      
      if (otp.length !== 6) {
        setError('Mã OTP phải có 6 chữ số');
        setLoading(false);
        return;
      }
      
      setTimeout(() => {
        onNext();
        setLoading(false);
      }, 1000);
    };
  
    const handleResendOTP = () => {
      setResendLoading(true);
      setTimeout(() => {
        onResend();
        setResendLoading(false);
      }, 1000);
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleVerifyOTP();
      }
    };
  
    return (
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nhập OTP</h2>
          <p className="text-gray-600">
            Mã OTP đã được gửi đến <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Mã OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleKeyPress}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
              placeholder="123456"
              maxLength="6"
              required
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <button
            onClick={handleVerifyOTP}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium mb-4 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Đang xác thực...' : 'Xác thực OTP'}</span>
          </button>
          
          <div className="text-center">
            <span className="text-gray-600 text-sm">Chưa nhận được mã? </span>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="text-blue-500 hover:text-blue-600 font-medium text-sm disabled:text-gray-400 inline-flex items-center space-x-1"
            >
              {resendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>{resendLoading ? 'Đang gửi...' : 'Gửi lại'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };
export default EnterOTP;