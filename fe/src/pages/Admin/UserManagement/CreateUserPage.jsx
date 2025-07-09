import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../config/axiosClient";
import { ArrowLeft } from "lucide-react";
import { enqueueSnackbar } from "notistack";

const CreateUserPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({});
  const [selectedImgFile, setSelectedImgFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState({
    imageUpload: false,
    formSubmit: false,
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, formSubmit: true }));
    try {
      let profile_img_url = "";
      if (selectedImgFile) {
        setLoading((prev) => ({ ...prev, imageUpload: true }));
        const formData = new FormData();
        formData.append("image", selectedImgFile);
        const imgUploadRes = await axiosClient.post("/profile-img", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        profile_img_url = imgUploadRes.data?.profile_img_url || "";
        if (!profile_img_url) throw new Error("Upload ảnh thất bại");
        setLoading((prev) => ({ ...prev, imageUpload: false }));
      }

      const endpointMap = {
        admin: "/admin",
        nurse: "/nurse",
        parent: "/parent",
        student: "/student",
      };
      const endpoint = endpointMap[role];
      if (!endpoint) throw new Error("Loại người dùng không hợp lệ");

      const payload = {
        ...newUser,
        profile_img_url,
        isMale: newUser.gender === "Nam",
      };
      const response = await axiosClient.post(endpoint, payload);

      if (!response.data.error) {
        enqueueSnackbar(response.data.message || "Tạo thành công", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(response.data.message || "Có lỗi xảy ra", {
          variant: "warning",
        });
      }
    } catch (error) {
      enqueueSnackbar(
        "Lỗi tạo người dùng: " +
          (error.response?.data?.message || error.message), {variant: "error"}
      );
    } finally {
      setLoading((prev) => ({ ...prev, formSubmit: false }));
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/user-manage")}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 mb-4 ${
              loading.formSubmit || loading.imageUpload
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={loading.formSubmit || loading.imageUpload}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl font-medium text-gray-900">
              Thêm {role} mới
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Tạo tài khoản người dùng trong hệ thống
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">
              Thông tin cá nhân
            </h2>
          </div>

          <form onSubmit={handleCreateUser} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Image */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="flex items-start gap-4">
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Ảnh đại diện"
                        className="w-20 h-20 rounded-md object-cover border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setSelectedImgFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setImagePreview(reader.result);
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      disabled={loading.imageUpload || loading.formSubmit}
                      className={`block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 ${
                        loading.imageUpload || loading.formSubmit
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF tối đa 10MB
                    </p>
                    {loading.imageUpload && (
                      <div className="flex items-center gap-2 mt-2">
                        <svg
                          className="animate-spin h-4 w-4 text-gray-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-sm text-gray-600">
                          Đang tải ảnh...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  disabled={loading.formSubmit || loading.imageUpload}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    loading.formSubmit || loading.imageUpload
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              {role !== "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    disabled={loading.formSubmit || loading.imageUpload}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      loading.formSubmit || loading.imageUpload
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newUser.dob || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, dob: e.target.value })
                  }
                  disabled={loading.formSubmit || loading.imageUpload}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    loading.formSubmit || loading.imageUpload
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newUser.gender || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, gender: e.target.value })
                  }
                  disabled={loading.formSubmit || loading.imageUpload}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    loading.formSubmit || loading.imageUpload
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.address || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                  disabled={loading.formSubmit || loading.imageUpload}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    loading.formSubmit || loading.imageUpload
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={newUser.phone_number || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone_number: e.target.value })
                  }
                  disabled={loading.formSubmit || loading.imageUpload}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    loading.formSubmit || loading.imageUpload
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              {/* Student specific fields */}
              {role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newUser.email || ""}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      disabled={loading.formSubmit || loading.imageUpload}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        loading.formSubmit || loading.imageUpload
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID lớp học <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.class_id || ""}
                      onChange={(e) =>
                        setNewUser({ ...newUser, class_id: e.target.value })
                      }
                      disabled={loading.formSubmit || loading.imageUpload}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        loading.formSubmit || loading.imageUpload
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm nhập học <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={newUser.year_of_enrollment || ""}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          year_of_enrollment: e.target.value,
                        })
                      }
                      disabled={loading.formSubmit || loading.imageUpload}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        loading.formSubmit || loading.imageUpload
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID mẹ
                    </label>
                    <input
                      type="text"
                      value={newUser.mom_id || ""}
                      onChange={(e) =>
                        setNewUser({ ...newUser, mom_id: e.target.value })
                      }
                      disabled={loading.formSubmit || loading.imageUpload}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        loading.formSubmit || loading.imageUpload
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID bố
                    </label>
                    <input
                      type="text"
                      value={newUser.dad_id || ""}
                      onChange={(e) =>
                        setNewUser({ ...newUser, dad_id: e.target.value })
                      }
                      disabled={loading.formSubmit || loading.imageUpload}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        loading.formSubmit || loading.imageUpload
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/user-manage")}
                className={`px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${
                  loading.formSubmit || loading.imageUpload
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={loading.formSubmit || loading.imageUpload}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className={`flex items-center px-4 py-2 text-sm text-white rounded-md ${
                  loading.formSubmit || loading.imageUpload
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={loading.formSubmit || loading.imageUpload}
              >
                {loading.formSubmit ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  "Tạo tài khoản"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;
