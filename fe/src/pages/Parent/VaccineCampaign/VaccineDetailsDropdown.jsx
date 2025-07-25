import { useEffect } from "react";
import { Loader2, Calendar, MapPin, FileText, CheckCircle, Syringe } from "lucide-react";

const VaccineDetailsDropdown = ({ diseaseId, details, loading }) => {
  useEffect(() => {
    console.log(`Details for disease ${diseaseId}:`, details);
  }, [diseaseId, details]);

  if (loading) return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        <span className="text-sm text-gray-600">Đang tải chi tiết...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 rounded-t-lg">
        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span>Chi tiết lịch sử tiêm chủng</span>
        </h4>
      </div>

      {/* Content */}
      <div className="p-4">
        {details?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Syringe className="w-4 h-4 text-blue-500" />
                      <span>Mũi tiêm</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Syringe className="w-4 h-4 text-purple-500" />
                      <span>Tên Vaccine</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>Ngày tiêm</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>Địa điểm</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span>Chẩn đoán</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {details.map((detail, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      Mũi tiêm #{index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {detail.vaccine_name || (
                        <span className="text-gray-400">Không xác định</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {detail.vaccination_date ? new Date(detail.vaccination_date).toLocaleDateString("vi-VN") : (
                        <span className="text-gray-400">Chưa xác định</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {detail.location || (
                        <span className="text-gray-400">Chưa xác định</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {detail.description || (
                        <span className="text-gray-400">Không có chẩn đoán</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        detail.status === 'COMPLETED' || detail.status === 'Đã tiêm' 
                          ? 'bg-green-100 text-green-800' 
                          : detail.status === 'CANCELLED' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {detail.status || "Chưa xác định"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
              <CheckCircle className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Không có dữ liệu</h3>
            <p className="text-xs text-gray-500">Không tìm thấy chi tiết tiêm chủng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccineDetailsDropdown;