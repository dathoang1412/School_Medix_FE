import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Home,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import GeneralDeleteConfirmModal from "../../../components/GeneralDeleteConfirmModal";
import { getUserRole } from "../../../service/authService";

// Component hiển thị thông tin chi tiết của hộ gia đình
const HomeInfo = ({ home, isDetailModal = false }) => (
  <div className="space-y-2 text-sm">
    <p>
      <b>ID hộ gia đình:</b> {home.id}
    </p>
    <p>
      <b>Số điện thoại liên hệ:</b> {home.contact_phone_number || "Không có"}
    </p>
    <p>
      <b>Email liên hệ:</b> {home.contact_email || "Không có"}
    </p>
    {isDetailModal && (
      <>
        <h3 className="font-medium mt-4">Phụ huynh:</h3>
        <div>
          {home.mom && (
            <p>
              <b>Mẹ:</b> {home.mom.name} (ID: {home.mom_id})
            </p>
          )}
          {home.dad && (
            <p>
              <b>Bố:</b> {home.dad.name} (ID: {home.dad_id})
            </p>
          )}
        </div>
        <h3 className="font-medium mt-4">Danh sách học sinh:</h3>
        <ul className="list-disc pl-5">
          {home.students?.map((student) => (
            <li key={student.id}>
              {student.name} - Lớp: {student.class_name} (ID: {student.id})
            </li>
          ))}
        </ul>
      </>
    )}
  </div>
);

const HomeManagement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState({
    searchTerm: "",
    sortOrder: "", // "" (none), "asc", "desc"
    homes: [],
    loading: false,
    isRefreshing: false,
    showDeleteModal: null, // Lưu một home duy nhất để xóa
    showDetailModal: false,
    selectedHomeDetail: null,
    isDeleting: false,
  });

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const fetchHomes = useCallback(async () => {
    updateState({ loading: true, isRefreshing: true });
    try {
      const response = await axiosClient.get("/home");
      console.log("Fetched homes:", response.data); // Log toàn bộ phản hồi
      if (!response.data.data) {
        console.warn("No data returned from /home API");
        enqueueSnackbar("Không có dữ liệu hộ gia đình từ server", {
          variant: "warning",
        });
        return;
      }
      updateState({
        homes: response.data.data,
      });
    } catch (error) {
      console.error("Error fetching homes:", error);
      enqueueSnackbar(
        `Lỗi tải dữ liệu: ${error.response?.data?.message || error.message}`,
        { variant: "error" }
      );
    } finally {
      updateState({ loading: false, isRefreshing: false });
    }
  }, []);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  const applyFilters = (homes) =>
    homes.filter((home) => {
      const matchesSearch =
        home.contact_phone_number?.includes(state.searchTerm) ||
        home.contact_email
          ?.toLowerCase()
          .includes(state.searchTerm.toLowerCase()) ||
        home.mom_name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        home.dad_name?.toLowerCase().includes(state.searchTerm.toLowerCase());
      return matchesSearch;
    });

  const sortHomes = (homes) => {
    if (!state.sortOrder) return homes;
    return [...homes].sort((a, b) => {
      const idA = a.id;
      const idB = b.id;
      return state.sortOrder === "asc" ? idA - idB : idB - idA;
    });
  };

  const filteredHomes = sortHomes(applyFilters(state.homes || []));

  const handleCheckboxChange = (home) => {
    console.log("Home data:", home); // Log dữ liệu home khi click checkbox
  };

  const handleViewDetail = async (id) => {
    try {
      const { data } = await axiosClient.get(`/home/${id}`);
      if (!data.error) {
        updateState({
          selectedHomeDetail: data.data,
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

  const handleEditHome = (home) =>
    navigate(`/${getUserRole()}/edit-home/${home.id}`);

  const handleDeleteHomes = useCallback(
    async (homeId) => {
      if (state.isDeleting || !homeId) return;
      console.log("Before delete - Current homes:", state.homes);
      console.log("Deleting home ID:", homeId);
      updateState({ isDeleting: true });

      try {
        await axiosClient.delete(`/home/${homeId}`);
        console.log("Delete successful, fetching new homes");
        await fetchHomes(); // Làm mới danh sách từ server
        updateState({
          showDeleteModal: null,
          isDeleting: false,
        });
      } catch (error) {
        console.error("❌ Xóa hộ gia đình thất bại:", error.message);
        updateState({ isDeleting: false });
        throw error; // Ném lỗi để GeneralDeleteConfirmModal xử lý
      }
    },
    [state.isDeleting, fetchHomes]
  );

  const handleRefresh = () => {
    fetchHomes();
    updateState({ searchTerm: "", sortOrder: "" });
  };

  const handleSortById = () => {
    updateState({
      sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const renderTableHeader = () => {
    const headers = [
      { label: "", width: "w-12" }, // Checkbox
      { label: "ID", width: "w-16" },
      { label: "Mẹ", width: "w-1/4" },
      { label: "Bố", width: "w-1/4" },
      { label: "SĐT liên hệ", width: "w-20" },
      { label: "Email liên hệ", width: "w-1/4" },
      { label: "Số học sinh", width: "w-20" },
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
              {header.label === "ID" ? (
                <button
                  onClick={handleSortById}
                  className="flex items-center gap-1"
                >
                  {header.label}
                  <ArrowUpDown
                    size={14}
                    className={
                      state.sortOrder ? "text-blue-600" : "text-gray-400"
                    }
                  />
                </button>
              ) : (
                header.label
              )}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderTableRow = (home) => (
    <tr
      key={home.id}
      className="border-b border-gray-200 hover:bg-gray-50 text-sm"
    >
      <td className="p-2">
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange(home)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
      </td>
      <td className="p-2 whitespace-nowrap">{home.id}</td>
      <td className="p-2 whitespace-nowrap">{home.mom_name || "Không có"}</td>
      <td className="p-2 whitespace-nowrap">{home.dad_name || "Không có"}</td>
      <td className="p-2 whitespace-nowrap">
        {home.contact_phone_number || "Không có"}
      </td>
      <td className="p-2 whitespace-nowrap">
        {home.contact_email || "Không có"}
      </td>
      <td className="p-2 whitespace-nowrap">{home.students || 0}</td>
      <td className="p-2 whitespace-nowrap">
        <div className="flex gap-1">
          <button
            onClick={() => handleViewDetail(home.id)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleEditHome(home)}
            className="p-1 text-gray-500 hover:text-green-600 rounded cursor-pointer"
            title="Chỉnh sửa"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => {
              console.log("Opening delete modal for home:", home.id);
              updateState({ showDeleteModal: home });
            }}
            className="p-1 text-gray-500 hover:text-red-600 rounded cursor-pointer"
            title="Xóa"
            disabled={state.isDeleting}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Quản Lý Hộ Gia Đình
          </h1>
          <p className="text-gray-600 text-sm">
            Quản lý thông tin các hộ gia đình trong hệ thống
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-gray-600" />
              <div>
                <h3 className="text-base font-medium text-gray-800">
                  Hộ gia đình
                </h3>
                <p className="text-sm text-gray-500">{state.homes.length} hộ</p>
              </div>
            </div>
          </div>
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

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm hộ gia đình..."
              value={state.searchTerm}
              onChange={(e) => updateState({ searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(`/${getUserRole()}/create-home`)}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
            >
              <Plus size={14} /> Thêm hộ gia đình
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {state.loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : filteredHomes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>
                {state.searchTerm
                  ? "Không tìm thấy kết quả"
                  : "Chưa có hộ gia đình"}
              </p>
              <button
                onClick={() => navigate(`/${getUserRole()}/create/home`)}
                className="mt-4 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
              >
                Thêm hộ gia đình
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[800px] table-auto">
              {renderTableHeader()}
              <tbody>{filteredHomes.map(renderTableRow)}</tbody>
            </table>
          )}
        </div>

        {state.showDeleteModal && (
          <GeneralDeleteConfirmModal
            textMessage={`Bạn có chắc chắn muốn xóa hộ gia đình với ID: ${state.showDeleteModal.id}?`}
            onClose={() => updateState({ showDeleteModal: null })}
            onDelete={() => handleDeleteHomes(state.showDeleteModal.id)}
          />
        )}
        {state.showDetailModal && state.selectedHomeDetail && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                Chi tiết hộ gia đình
              </h2>
              <HomeInfo home={state.selectedHomeDetail} isDetailModal={true} />
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

export default HomeManagement;
