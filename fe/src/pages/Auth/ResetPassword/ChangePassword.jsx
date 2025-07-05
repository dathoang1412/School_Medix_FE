import React, { useState } from 'react';
// import axiosClient from '../../../config/axiosClient';
import { Eye, EyeClosed, Loader2 } from 'lucide-react';

const ChangePassword = ({ email, onNext }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
  
    const handleChangePassword = () => {
      setError('');
      setLoading(true);
      
      if (password.length < 8) {
        setError('Mật khẩu phải có ít nhất 8 ký tự');
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Mật khẩu không khớp');
        setLoading(false);
        return;
      }
      
      setTimeout(() => {
        onNext();
        setLoading(false);
      }, 1000);
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleChangePassword();
      }
    };
  
    return (
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đổi Mật Khẩu</h2>
          <p className="text-gray-600">Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                placeholder="Nhập mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye/> : <EyeClosed/>}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Xác nhận mật khẩu"
              required
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Đang đổi...' : 'Đổi mật khẩu'}</span>
          </button>
        </div>
      </div>
    );
  };
export default ChangePassword;