import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Users } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { enqueueSnackbar } from "notistack";
import { getUserRole } from "../../../service/authService";

const VaccineList = ({ vaccines, onEdit }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vaccine này?")) return;
    try {
      await axiosClient.delete(`/vaccine/${id}`);
      enqueueSnackbar("Xóa vaccine thành công", { variant: "success" });
      window.location.reload();
    } catch (error) {
      enqueueSnackbar("Lỗi khi xóa vaccine: " + (error.response?.data?.message || error.message), {
        variant: "error",
      });
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mũi Tiêm
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vaccine
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Số Mũi Tiêm
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {vaccines.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">Không tìm thấy vaccine nào</p>
                  <p className="text-gray-400 text-sm mt-2">Vui lòng thêm vaccine mới để bắt đầu</p>
                </td>
              </tr>
            ) : (
              vaccines.map((vaccine) => (
                <tr key={vaccine.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-800">{vaccine.diseases}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-800">
                      {vaccine.vaccines
                        ? vaccine.vaccines.map((v) => `#${v.id} - ${v.name}`).join(", ")
                        : `#${vaccine.id} - ${vaccine.name}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-800">{vaccine.dose_quantity || 1}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onEdit(vaccine)}
                        className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                        title="Sửa vaccine"
                      >
                        <Edit size={14} />
                        Sửa
                      </button>
                      {/* <button
                        onClick={() => handleDelete(vaccine.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                        title="Xóa vaccine"
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button> */}
                      <button
                        onClick={() => navigate(`/${getUserRole()}/vaccine/${vaccine.id}/students`)}
                        className="whitespace-nowrap cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 hover:text-green-800 text-sm font-medium transition-colors duration-200"
                        title="Xem danh sách học sinh"
                      >
                        <Users size={14} />
                        Xem học sinh
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VaccineList; 