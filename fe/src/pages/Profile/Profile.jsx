import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../config/axiosClient";
import { getUser, getUserRole } from "../../service/authService";
import { ArrowLeft, Loader2 } from "lucide-react";
import Footer from "../../components/Footer";

const Profile = () => {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
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
        setDetail(res.data.data);
      } catch (err) {
        setError(
          "Lỗi khi tải thông tin hồ sơ: " + (err.message || "Vui lòng thử lại.")
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetail();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-700 text-sm">Đang tải dữ liệu...</p>
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
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 cursor-pointer"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700 text-sm">Không có dữ liệu hồ sơ.</p>
          </div>
          <button
            onClick={() => navigate("/")}
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
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer mb-4"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl font-medium text-gray-900">
              Hồ Sơ Người Dùng
            </h1>
            <p className="text-sm text-gray-600 mt-1">ID: {detail.id}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-md">
          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <section>
              <div className="py-2 border-b border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-blue-600">
                  Thông Tin Cá Nhân
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Image */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh Đại Diện
                  </label>
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        detail.profile_img_url ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Ảnh đại diện"
                      className="w-20 h-20 rounded-full object-cover border border-gray-200"
                    />
                  </div>
                </div>
                {/* User Status */}
                <div className="md:col-span-3">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Ngày tạo:{" "}
                      </span>
                      <span className="text-sm text-gray-600">
                        {detail.created_at
                          ? new Date(detail.created_at).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Chưa có dữ liệu"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Mời tham gia gần nhất:{" "}
                      </span>
                      <span className="text-sm text-gray-600">
                        {detail.last_invitation_at
                          ? new Date(detail.last_invitation_at).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Xác thực email:{" "}
                      </span>
                      <span className="text-sm text-gray-600">
                        {detail.email_confirmed
                          ? "Đã xác thực"
                          : "Chưa xác thực"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và Tên
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                    {detail.name || "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai Trò
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700 capitalize">
                    {detail.role || "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                    {detail.email || "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                    {detail.phone_number || "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày Sinh
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                    {detail.dob
                      ? new Date(detail.dob).toLocaleDateString("vi-VN")
                      : "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tuổi
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                    {detail.age || "Chưa có thông tin"}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa Chỉ
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                    {detail.address || "Chưa có thông tin"}
                  </p>
                </div>
              </div>
            </section>

            {/* Children Information (only for parent role) */}
            {detail.role === "parent" &&
              detail.children &&
              detail.children.length > 0 && (
                <section>
                  <div className="py-2 border-b border-gray-200 mb-6">
                    <h2 className="text-lg font-semibold text-blue-600">
                      Thông Tin Con
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {detail.children.map((child, index) => (
                      <div
                        key={child.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Con #{index + 1}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ảnh Đại Diện
                            </label>
                            <div className="flex items-start gap-4">
                              <img
                                src={
                                  child.profile_img_url ||
                                  "https://via.placeholder.com/150"
                                }
                                alt={`Profile of ${child.name}`}
                                className="w-20 h-20 rounded-full object-cover border border-gray-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Họ và Tên
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.name || "Chưa có thông tin"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lớp
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.class_name || "Chưa có thông tin"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.email || "Chưa có thông tin"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Số Điện Thoại
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.phone_number || "Chưa có thông tin"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ngày Sinh
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.dob
                                ? new Date(child.dob).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "Chưa có thông tin"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tuổi
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.age || "Chưa có thông tin"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Giới Tính
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.isMale
                                ? "Nam"
                                : child.isMale === false
                                ? "Nữ"
                                : "Chưa có thông tin"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Năm Nhập Học
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.year_of_enrollment || "Chưa có thông tin"}
                            </p>
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Địa Chỉ
                            </label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700">
                              {child.address || "Chưa có thông tin"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
