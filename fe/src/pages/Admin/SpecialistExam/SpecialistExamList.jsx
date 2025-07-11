import { Trash2 } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { enqueueSnackbar } from "notistack";

const SpecialistExamList = ({ exams, onEdit }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa chuyên khoa này?")) return;
    try {
      await axiosClient.delete(`/special-exam/${id}`);
      window.location.reload();
    } catch (error) {
      enqueueSnackbar("Lỗi khi xóa chuyên khoa: " + (error.response?.data?.message || error.message), {
        variant: "error",
      });
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mã Chuyên Khoa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tên Chuyên Khoa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Chi Tiết
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exams.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-400 mb-4"
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
                  <p className="text-gray-500 text-lg">Không tìm thấy chuyên khoa nào</p>
                  <p className="text-gray-400 text-sm mt-2">Thử thêm chuyên khoa mới</p>
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">#{exam.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{exam.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{exam.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => onEdit(exam)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
                      >
                        <Trash2 size={14} />
                        Xóa
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

export default SpecialistExamList;