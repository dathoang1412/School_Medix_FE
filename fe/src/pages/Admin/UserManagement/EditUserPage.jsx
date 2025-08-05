import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../config/axiosClient";
import { ArrowLeft } from "lucide-react";
import { useSnackbar } from "notistack";
import ChangeAccountConfirmModal from "../../../components/ChangeEmailConfirmModal";
import SendInviteConfirmModal from "../../../components/SendInviteConfirmModal";
import DeleteAccountModal from "../../../components/DeleteAccountModal";

const EditUserPage = () => {
  const { role, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [selectedImgFile, setSelectedImgFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State cho popup email
  const [showInviteModal, setShowInviteModal] = useState(false); // State cho popup invite
  const [isPersonalLoading, setIsPersonalLoading] = useState(false); // Loading cho personal submit
  const [isAccountLoading, setIsAccountLoading] = useState(false); // Loading cho account submit
  const [isInviteLoading, setIsInviteLoading] = useState(false); // Loading cho send invite
  const [showEmailInput, setShowEmailInput] = useState(false); // State để kiểm soát hiển thị ô input email
  const [isDeleteLoading, setIsDeleteLoading] = useState(false); // Loading cho xóa tài khoản
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State cho popup xóa tài khoản

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axiosClient.get(`/${role}/${id}`);
        if (!data.error) {
          console.log("User details: ", data.data);
          const formattedData = {
            ...data.data,
            dob: data.data.dob
              ? new Date(data.data.dob).toISOString().split("T")[0]
              : "",
            ismale: data.data.ismale !== undefined ? data.data.ismale : false, // Đảm bảo ismale có giá trị mặc định
          };
          setFormData(formattedData);
          setImagePreview(data.data.profile_img_url);
          setShowEmailInput(!!formattedData.email); // Hiển thị ô input nếu có email
        } else {
          setError("Không tìm thấy người dùng");
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [role, id]);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsPersonalLoading(true);
    try {
      let profile_img_url = formData.profile_img_url;

      if (selectedImgFile) {
        const formDataImg = new FormData();
        formDataImg.append("image", selectedImgFile);
        const imgUploadRes = await axiosClient.post(
          "/profile-img",
          formDataImg,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        profile_img_url = imgUploadRes.data.profile_img_url;
        if (!profile_img_url) throw new Error("Upload ảnh thất bại");
      }

      const updates = {
        profile_img_url,
        name: formData.name,
        dob: formData.dob,
        ismale: formData.ismale !== undefined ? formData.ismale : false, // Đảm bảo ismale luôn có giá trị
        address: formData.address,
        phone_number: formData.phone_number,
        ...(role === "student" && {
          class_id: formData.class_id,
          year_of_enrollment: formData.year_of_enrollment,
          mom_id: formData.mom_id,
          dad_id: formData.dad_id,
        }),
      };

      console.log("Updates sent: ", updates); // Kiểm tra giá trị gửi đi
      await axiosClient.patch("/admin/edit-user-profile", {
        id,
        role,
        updates,
      });

      enqueueSnackbar("Cập nhật thông tin cá nhân thành công!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(
        "Lỗi khi cập nhật thông tin cá nhân: " +
          (error.response?.data?.message || error.message),
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
    } finally {
      setIsPersonalLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (showDeleteModal) return; // Ngăn không mở modal nếu DeleteModal đã hiển thị
    setIsAccountLoading(true);
    setShowConfirmModal(true);
    setIsAccountLoading(false);
  };

  const handleConfirmChange = async () => {
    setIsAccountLoading(true);
    try {
      await axiosClient.patch("/admin/update-user-account", {
        role: formData.role,
        id: formData.id,
        name: formData.name,
        email: formData.email,
      });
      enqueueSnackbar("Cập nhật thông tin tài khoản thành công!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setShowEmailInput(true);
    } catch (error) {
      enqueueSnackbar(
        "Lỗi khi cập nhật thông tin tài khoản: " +
          (error.response?.data?.message || error.message),
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
    } finally {
      setShowConfirmModal(false);
      setIsAccountLoading(false);
    }
  };

  const handleAddEmail = () => {
    setShowEmailInput(true);
  };

  const handleDeleteEmail = () => {
    if (showConfirmModal) return; // Ngăn không mở modal nếu ConfirmModal đã hiển thị
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      const restrictedEmails = [
        "mndkhanh@gmail.com",
        "mndkhanh3@gmail.com",
        "coccamco.fpthcm@gmail.com",
        "thuandntse150361@fpt.edu.vn",
        "dinhviethieu2910@gmail.com",
        "toannangcao3000@gmail.com",
        "phamthanhqb2005@gmail.com",
        "dathtse196321@gmail.com",
        "mndkhanh.alt3@gmail.com",
        "mndkhanh.alt@gmail.com",
      ];

      if (restrictedEmails.includes(formData.email)) {
        enqueueSnackbar("Không thể xóa tài khoản có email: " + formData.email, {
          variant: "warning",
          autoHideDuration: 3000,
        });
        return;
      }

      await axiosClient.delete("/admin/delete-user-account", {
        data: { id, role },
      });
      setFormData({ ...formData, email: null });
      setShowEmailInput(false);
      enqueueSnackbar("Xóa tài khoản thành công!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(
        "Lỗi khi xóa tài khoản: " +
          (error.response?.data?.message || error.message),
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
    } finally {
      setShowDeleteModal(false);
      setIsDeleteLoading(false);
    }
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    setIsInviteLoading(true);
    setShowInviteModal(true);
    setIsInviteLoading(false);
  };

  const handleConfirmInvite = async () => {
    setIsInviteLoading(true);
    try {
      const response = await axiosClient.post(`/send-invites`, {
        users: [
          {
            id,
            role,
            email: formData.email,
          },
        ],
      });

      const { error, message } = response.data?.results[0];
      if (error === false) {
        enqueueSnackbar("Thư mời đã được gửi thành công!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } else {
        throw new Error(message || "Gửi thư mời thất bại");
      }
    } catch (error) {
      enqueueSnackbar(
        "Lỗi khi gửi thư mời: " +
          (error.response?.data?.message || error.message),
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
    } finally {
      setShowInviteModal(false);
      setIsInviteLoading(false);
    }
  };

  if (loading) {
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
            onClick={() => navigate("/users")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
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
            onClick={() => navigate("/admin/user-manage")}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 mb-4"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl font-medium text-gray-900">
              Chỉnh sửa thông tin {role}
            </h1>
            <p className="text-sm text-gray-600 mt-1">ID: {id}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-md">
          <form onSubmit={handlePersonalSubmit} className="p-6 space-y-8">
            {/* Personal Information */}
            <section>
              <div className="py-2 border-b border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-blue-600">
                  Thông tin cá nhân
                </h2>
              </div>
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
                          className="w-20 h-20 rounded-full object-cover border border-gray-200"
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
                          }
                        }}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-blue-700 hover:file:bg-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF tối đa 10MB
                      </p>
                    </div>
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
                        {formData.created_at
                          ? new Date(formData.created_at).toLocaleString(
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
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.ismale ? "true" : "false"} // Đảm bảo giá trị mặc định dựa trên ismale
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ismale: e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Student specific fields */}
                {role === "student" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID lớp học <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.class_id || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, class_id: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Năm nhập học <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.year_of_enrollment || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            year_of_enrollment: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID mẹ
                      </label>
                      <input
                        type="text"
                        value={formData.mom_profile?.id || "Không có"}
                        onChange={(e) =>
                          setFormData({ ...formData, mom_id: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID bố
                      </label>
                      <input
                        type="text"
                        value={formData.dad_profile?.id || "Không có"}
                        onChange={(e) =>
                          setFormData({ ...formData, dad_id: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Personal Update Button */}
                <div className="md:col-span-3 flex justify-start mt-2">
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                      isPersonalLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isPersonalLoading}
                  >
                    {isPersonalLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        Đang xử lý...
                      </span>
                    ) : (
                      "Cập nhật thông tin"
                    )}
                  </button>
                </div>
              </div>
            </section>
          </form>

          <form onSubmit={handleAccountSubmit} className="p-6 space-y-8">
            {/* Account Information */}
            <section>
              <div className="py-2 border-b border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-blue-600">
                  Tài khoản
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {/* Account Status */}
                <div className="md:col-span-3">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Đăng ký tài khoản:{" "}
                      </span>
                      <span className="text-sm text-gray-700">
                        {formData.supabase_uid ? "Đã đăng ký" : "Chưa đăng ký"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Mời tham gia gần nhất:{" "}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formData.last_invitation_at
                          ? new Date(
                              formData.last_invitation_at
                            ).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Xác thực email:{" "}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formData.email_confirmed
                          ? "Đã xác thực"
                          : "Chưa xác thực"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Email */}
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  {showEmailInput ? (
                    <div className="flex flex-row gap-4">
                      <div className="">
                        <input
                          type="email"
                          value={formData.email || ""}
                          required
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-[400px] px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                          isAccountLoading
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={isAccountLoading}
                      >
                        {isAccountLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            Đang xử lý...
                          </span>
                        ) : (
                          "Cập nhật"
                        )}
                      </button>
                      <button
                        onClick={handleDeleteEmail}
                        className={`px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 ${
                          isDeleteLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isDeleteLoading}
                      >
                        {isDeleteLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            Đang xử lý...
                          </span>
                        ) : (
                          "Xóa tài khoản"
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddEmail}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Thêm tài khoản
                    </button>
                  )}
                </div>
              </div>

              {/* Mail Invitation */}
              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Gửi thư mời tham gia
                </label>
                <button
                  onClick={handleSendInvite}
                  className={`block px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isInviteLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isInviteLoading || !formData.email}
                >
                  {isInviteLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Mời tham gia hệ thống"
                  )}
                </button>
              </div>
            </section>
          </form>
        </div>
        {showConfirmModal && (
          <ChangeAccountConfirmModal
            user={formData}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmChange}
          />
        )}
        {showInviteModal && (
          <SendInviteConfirmModal
            user={formData}
            onClose={() => setShowInviteModal(false)}
            onConfirm={handleConfirmInvite}
          />
        )}
        {showDeleteModal && (
          <DeleteAccountModal
            email={formData.email}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </div>
  );
};

export default EditUserPage;
