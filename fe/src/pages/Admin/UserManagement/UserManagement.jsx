import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  Shield,
  Users,
  GraduationCap,
  Stethoscope,
  Loader2,
  Send,
} from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { getUserRole } from "../../../service/authService";

// UserInfo component remains unchanged
const UserInfo = ({ user, role, isDetailModal = false }) => (
  <div className="space-y-2 text-sm">
    {user.profile_img_url && (
      <img
        src={user.profile_img_url}
        alt="Avatar"
        className="w-20 h-20 rounded-full mx-auto mb-4"
      />
    )}
    <p>
      <b>Họ tên:</b> {user.name}
    </p>
    <p>
      <b>Email:</b> {user.email || "Chưa đăng ký tài khoản"}
    </p>
    <p>
      <b>Giới tính:</b> {user.isMale ? "Nam" : "Nữ"}
    </p>
    <p>
      <b>Ngày sinh:</b> {new Date(user.dob).toLocaleDateString()}
    </p>
    <p>
      <b>Địa chỉ:</b> {user.address}
    </p>
    <p>
      <b>SĐT:</b> {user.phone_number || "Không có"}
    </p>
    <p>
      <b>Email xác nhận:</b>{" "}
      {user.email_confirmed ? "Đã xác thực" : "Chưa xác thực"}
    </p>
    {role === "student" && (
      <>
        <p>
          <b>Năm nhập học:</b> {user.year_of_enrollment}
        </p>
        <p>
          <b>Lớp:</b> {user.class_name}
        </p>
        {isDetailModal && (
          <>
            <h3 className="font-medium mt-4">Phụ huynh:</h3>
            <div>
              {user.mom_profile && (
                <p>
                  <b>Mẹ:</b> {user.mom_profile.name}
                </p>
              )}
              {user.dad_profile && (
                <p>
                  <b>Bố:</b> {user.dad_profile.name}
                </p>
              )}
            </div>
          </>
        )}
      </>
    )}
    {role === "parent" && isDetailModal && (
      <>
        <h3 className="font-medium mt-4">Danh sách con:</h3>
        <ul className="list-disc pl-5">
          {user.students?.map((child) => (
            <li key={child.id}>
              {child.name} - {child.class_name}
            </li>
          ))}
        </ul>
      </>
    )}
  </div>
);

const UserManagement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState({
    activeTab: "admin",
    searchTerm: "",
    emailConfirmedFilter: "",
    users: { admin: [], nurse: [], parent: [], student: [] },
    loading: false,
    isRefreshing: false,
    showDeleteModal: false,
    showDetailModal: false,
    selectedUserDetail: null,
    selectedUsers: [],
    isSendingInvites: false,
  });

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const tabs = [
    {
      key: "admin",
      label: "Quản trị viên",
      icon: Shield,
      count: state.users.admin.length,
    },
    {
      key: "nurse",
      label: "Y tá",
      icon: Stethoscope,
      count: state.users.nurse.length,
    },
    {
      key: "parent",
      label: "Phụ huynh",
      icon: Users,
      count: state.users.parent.length,
    },
    {
      key: "student",
      label: "Học sinh",
      icon: GraduationCap,
      count: state.users.student.length,
    },
  ];

  const fetchUsers = useCallback(async () => {
    updateState({ loading: true, isRefreshing: true });
    try {
      const [adminRes, nurseRes, parentRes, studentRes] = await Promise.all([
        axiosClient.get("/admin"),
        axiosClient.get("/nurse"),
        axiosClient.get("/parent"),
        axiosClient.get("/student"),
      ]);
      updateState({
        users: {
          admin: adminRes.data.data,
          nurse: nurseRes.data.data,
          parent: parentRes.data.data,
          student: studentRes.data.data,
        },
        selectedUsers: [],
      });
    } catch (error) {
      enqueueSnackbar(
        `Lỗi tải dữ liệu: ${error.response?.data?.message || error.message}`,
        { variant: "error" }
      );
    } finally {
      updateState({ loading: false, isRefreshing: false });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const applyFilters = (users) =>
    users.filter((user) => {
      const matchesSearch =
        user?.name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        user?.phone_number?.includes(state.searchTerm);
      const matchesEmailConfirmed =
        state.emailConfirmedFilter === "" ||
        String(user.email_confirmed) === state.emailConfirmedFilter;
      return matchesSearch && matchesEmailConfirmed;
    });

  const filteredUsers = applyFilters(state.users[state.activeTab] || []);

  const handleCheckboxChange = (user) => {
    updateState({
      selectedUsers: state.selectedUsers.some((u) => u.id === user.id)
        ? state.selectedUsers.filter((u) => u.id !== user.id)
        : [...state.selectedUsers, { ...user, role: state.activeTab }],
    });
  };

  const handleSendInvites = async () => {
    if (state.selectedUsers.length === 0) return;
    const selected_users = state.selectedUsers.map(
      ({ id, name, email, role }) => ({
        id,
        name,
        email,
        role,
      })
    );
    updateState({ isSendingInvites: true });
    try {
      const response = await axiosClient.post("/send-invites", {
        users: selected_users,
      });

      console.log(response);
      enqueueSnackbar(response.data.message || "Đã gửi lời mời!", {
        variant: "success",
      });
      updateState({ selectedUsers: [], isSendingInvites: false });
    } catch (error) {
      enqueueSnackbar(
        `Lỗi khi gửi lời mời: ${
          error.response?.data?.message || error.message
        }`,
        { variant: "error" }
      );
      updateState({ isSendingInvites: false });
    }
  };

  const handleViewDetail = async (role, id) => {
    try {
      const { data } = await axiosClient.get(`/${role}/${id}`);
      if (!data.error) {
        updateState({
          selectedUserDetail: { role, ...data.data },
          showDetailModal: true,
        });
      }
    } catch (error) {
      enqueueSnackbar(
        `Lỗi lấy chi tiết: ${error.response?.data?.message || error.message}`,
        { variant: "error" }
      );
    }
  };

  const handleEditUser = (user) =>
    navigate(`/${getUserRole()}/edit/${state.activeTab}/${user.id}`);

  const handleDeleteUsers = async (deletedUserIds) => {
    try {
      await Promise.all(
        deletedUserIds.map(
          async (id) => await axiosClient.delete(`/${state.activeTab}/${id}`)
        )
      );
      updateState({
        users: {
          ...state.users,
          [state.activeTab]: state.users[state.activeTab].filter(
            (user) => !deletedUserIds.includes(user.id)
          ),
        },
        selectedUsers: state.selectedUsers.filter(
          (user) => !deletedUserIds.includes(user.id)
        ),
        showDeleteModal: false,
      });
      enqueueSnackbar("Xóa người dùng thành công!", { variant: "success" });
    } catch (error) {
      console.error("❌ Xóa người dùng thất bại:", error.message);
      enqueueSnackbar("Lỗi khi xóa người dùng!", { variant: "error" });
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email || "Chưa đăng ký tài khoản",
      phone_number: user.phone_number || "Không có",
      dob: user.dob,
      isMale: user.isMale ? "Nam" : "Nữ",
      address: user.address,
      email_confirmed: user.email_confirmed ? "Đã xác thực" : "Chưa xác thực",
      ...(state.activeTab === "student" && {
        class_name: user.class_name,
        year_of_enrollment: user.year_of_enrollment,
      }),
    }));
    const csv = Papa.unparse(csvData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `${state.activeTab}_users.csv`
    );
    enqueueSnackbar("Xuất CSV thành công!", { variant: "success" });
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const endpointMap = {
        admin: "/upload-admin-excel",
        nurse: "/upload-nurse-excel",
        parent: "/upload-parent-excel",
        student: "/upload-student-excel",
      };

      const endpoint = endpointMap[state.activeTab];

      const response = await axiosClient.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      enqueueSnackbar("Tải file lên và xử lý thành công!", {
        variant: "success",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${state.activeTab}_upload_result.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error uploading file:", error);
      enqueueSnackbar(
        `Lỗi khi tải file lên: ${
          error.response?.data?.message || error.message
        }`,
        { variant: "error" }
      );
    }
  };

  const handleGetImportSample = async () => {
    try {
      const response = await axiosClient.get(
        `/${state.activeTab}-import-sample`,
        {
          responseType: "blob",
        }
      );

      enqueueSnackbar("Tải file mẫu thành công!", { variant: "success" });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${state.activeTab}_import_sample.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Lỗi tải file mẫu:", err.message);
      enqueueSnackbar(
        `Lỗi tải file mẫu: ${err.response?.data?.message || err.message}`,
        { variant: "error" }
      );
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const renderTableHeader = () => {
    const headers = [
      { label: "", width: "w-12" }, // Checkbox
      { label: "ID", width: "w-16" },
      { label: "Họ tên", width: "w-1/3" },
      { label: "Email", width: "w-1/4" },
      { label: "SĐT", width: "w-20" },
      ...(state.activeTab === "parent"
        ? [{ label: "Số con", width: "w-20" }]
        : state.activeTab === "student"
        ? [{ label: "Lớp", width: "w-28" }]
        : []),
      { label: "Mời tham gia gần nhất", width: "w-20" },
      { label: "Trạng thái", width: "w-28" },
      { label: "Hành động", width: "w-1/5" },
    ];

    return (
      <thead>
        <tr className="bg-gray-100 text-gray-700 text-sm font-medium">
          {headers.map((header) => (
            <th
              key={header.label}
              className={`${header.width} p-2 text-left whitespace-nowrap`}
            >
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderTableRow = (user) => (
    <tr
      key={user.id}
      className="border-b border-gray-200 hover:bg-gray-50 text-sm"
    >
      <td className="p-2">
        <input
          type="checkbox"
          checked={state.selectedUsers.some((u) => u.id === user.id)}
          onChange={() => handleCheckboxChange(user)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
      </td>
      <td className="p-2 whitespace-nowrap">{user.id}</td>
      <td className="p-2 whitespace-nowrap">{user.name}</td>
      <td className="p-2 whitespace-nowrap">
        {user.email || "Chưa đăng ký tài khoản"}
      </td>
      <td className="p-2 whitespace-nowrap">
        {user.phone_number || "Không có"}
      </td>
      {state.activeTab === "parent" && (
        <td className="p-2 whitespace-nowrap">{user.students?.length || 0}</td>
      )}
      {state.activeTab === "student" && (
        <>
          <td className="p-2 whitespace-nowrap">{user.class_name}</td>
        </>
      )}
      <td className="p-2 whitespace-nowrap">
        {user.last_invitation_at
          ? new Date(user.last_invitation_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </td>
      <td className="p-2 whitespace-nowrap">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs ${
            user.email_confirmed
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.email_confirmed ? "Đã xác thực" : "Chưa xác thực"}
        </span>
      </td>
      <td className="p-2 whitespace-nowrap">
        <div className="flex gap-1">
          <button
            onClick={() => handleViewDetail(state.activeTab, user.id)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleEditUser(user)}
            className="p-1 text-gray-500 hover:text-green-600 rounded cursor-pointer"
            title="Chỉnh sửa"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => updateState({ showDeleteModal: [user] })}
            className="p-1 text-gray-500 hover:text-red-600 rounded cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  const activeTabData = tabs.find((tab) => tab.key === state.activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-600 text-sm">
            Quản lý thông tin người dùng trong hệ thống tiêm chủng
          </p>
        </div>

        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm cursor-pointer"
          >
            <Download size={14} /> Xuất CSV
          </button>
          <label
            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer text-sm"
          >
            <Upload size={14} /> Nhập CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
          <button
            onClick={handleGetImportSample}
            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm cursor-pointer"
          >
            <Download size={14} /> File nhập mẫu
          </button>
          <button
            onClick={handleRefresh}
            disabled={state.isRefreshing}
            className={`flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm cursor-pointer ${
              state.isRefreshing ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {state.isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Làm mới</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Làm mới</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => updateState({ activeTab: tab.key })}
              className={`p-3 bg-white border rounded-lg text-left cursor-pointer ${
                state.activeTab === tab.key
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="text-gray-600">
                  {tab.icon && <tab.icon size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {tab.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {tab.count} người dùng
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Tổng số</p>
            <p className="text-lg font-semibold text-gray-800">
              {filteredUsers.length}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Đã xác thực</p>
            <p className="text-lg font-semibold text-gray-800">
              {filteredUsers.filter((user) => user.email_confirmed).length}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Tìm kiếm ${activeTabData.label.toLowerCase()}...`}
              value={state.searchTerm}
              onChange={(e) => updateState({ searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <select
                value={state.emailConfirmedFilter}
                onChange={(e) =>
                  updateState({ emailConfirmedFilter: e.target.value })
                }
                className="w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đã xác thực</option>
                <option value="false">Chưa xác thực</option>
              </select>
            </div>
            {state.selectedUsers.length > 0 && (
              <button
                onClick={handleSendInvites}
                disabled={state.isSendingInvites}
                className={`flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm cursor-pointer ${
                  state.isSendingInvites ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {state.isSendingInvites ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Gửi lời mời</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={() =>
                navigate(`/${getUserRole()}/create/${state.activeTab}`)
              }
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
            >
              <Plus size={14} /> Thêm {activeTabData.label}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {state.loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>
                {state.searchTerm || state.emailConfirmedFilter
                  ? "Không tìm thấy kết quả"
                  : `Chưa có ${activeTabData.label.toLowerCase()}`}
              </p>
              <button
                onClick={() =>
                  navigate(`/${getUserRole()}/create/${state.activeTab}`)
                }
                className="mt-4 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
              >
                Thêm {activeTabData.label}
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[800px] table-auto">
              {renderTableHeader()}
              <tbody>{filteredUsers.map(renderTableRow)}</tbody>
            </table>
          )}
        </div>

        {state.showDeleteModal && (
          <DeleteConfirmModal
            users={state.showDeleteModal}
            role={state.activeTab}
            onClose={() => updateState({ showDeleteModal: false })}
            onDelete={handleDeleteUsers}
          />
        )}
        {state.showDetailModal && state.selectedUserDetail && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                Chi tiết {state.selectedUserDetail.role}
              </h2>
              <UserInfo
                user={state.selectedUserDetail}
                role={state.selectedUserDetail.role}
                isDetailModal={true}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => updateState({ showDetailModal: false })}
                  className="px-4 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-sm cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;