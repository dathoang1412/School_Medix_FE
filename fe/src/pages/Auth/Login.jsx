import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { loginWithEmailAndPassword } from "../../config/Supabase";
import { saveUser } from "../../service/authService";
import { useState } from "react";
import { Loader2 } from "lucide-react"; // Import Loader2 from lucide-react
import axiosClient from '../../config/axiosClient';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { email, password } = formData;

    const { data, error } = await loginWithEmailAndPassword(email, password);

    if (error) {
      enqueueSnackbar(`Login failed: ${error.message}`, { variant: "error" });
    } else {
      const role = data.user.app_metadata?.role;
      const supabase_uid = data.user.id;
      const res = await axiosClient(`/user/${supabase_uid}/role/${role}/profile`);
      enqueueSnackbar("Login successful!", { variant: "success" });
      const user = res.data.data;
      saveUser(user);
      console.log(user);
      if (user?.email_confirmed === false) {
        console.log("EMAIL CONFIRMED FOR: ", email);
        await axiosClient.patch(`/role/${role}/user/${user.id}/confirm-email`);
      }
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM9 9V6h2v3h3v2h-3v3H9v-3H6V9h3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Đăng nhập vào tài khoản SchoolMedix của bạn.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium 
                transition-colors hover:underline cursor-pointer"
                onClick={() => {
                  navigate('/forgot-password');
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 
              px-4 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 transform hover:scale-[1.02] 
              transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Sign up
              </button>
            </p>
          </div> */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2025 Hospital Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;