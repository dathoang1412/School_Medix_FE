import React, { useState } from 'react';
// import axiosClient from '../../../config/axiosClient';

const EnterEmail = ({ onNext }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSendOTP = () => {
      setError('');
      setLoading(true);
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Email không hợp lệ');
        setLoading(false);
        return;
      }
      
      setTimeout(() => {
        onNext(email);
        setLoading(false);
      }, 1000);
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSendOTP();
      }
    };
  
    return (
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nhập Email</h2>
          <p className="text-gray-600">Chúng tôi sẽ gửi mã OTP đến email của bạn</p>
        </div>
        
        <div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="example@email.com"
              required
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <button
            onClick={handleSendOTP}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi OTP'}
          </button>
        </div>
      </div>
    );
  };
  
export default EnterEmail;