import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Syringe,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
} from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { getStudentInfo } from "../../../service/childenService";
import { getSession } from "../../../config/Supabase";
import { useSnackbar } from "notistack";
import VaccineDetailsDropdown from "./VaccineDetailsDropdown";
import { getUserRole } from "../../../service/authService";

const VaccineRecordInfo = () => {
  const [records, setRecords] = useState([]);
  const [details, setDetails] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({});
  const [filterMode, setFilterMode] = useState("all"); // "all", "notEnough", "enough"
  const [currChild, setCurrChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { student_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data, error } = await getSession();
      if (error || !data.session) {
        enqueueSnackbar("Vui lòng đăng nhập để tiếp tục!", {
          variant: "error",
        });
        navigate("/login");
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [navigate, enqueueSnackbar]);

  // Fetch student info and completed doses
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !student_id) return;

      setLoading(true);
      try {
        // Fetch student info
        const child = await getStudentInfo(student_id);
        if (!child?.id) {
          throw new Error("Không tìm thấy thông tin học sinh");
        }
        setCurrChild(child);

        // Fetch completed doses
        const dosesRes = await axiosClient.get(
          `/student/${child.id}/vnvc/completed-doses`
        );
        const dosesData = dosesRes.data.diseases || [];
        setRecords(dosesData);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        enqueueSnackbar("Không thể tải dữ liệu!", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, student_id, enqueueSnackbar]);

  // Fetch vaccination details for a specific disease
  const fetchDetails = async (diseaseId) => {
    if (!details[diseaseId]) {
      try {
        console.log(diseaseId);
        setLoadingDetails((prev) => ({ ...prev, [diseaseId]: true }));
        const res = await axiosClient.get(
          `/student/${currChild.id}/disease/vaccination-record`,
          {
            params: { diseaseId },
          }
        );
        const allRecords = res.data.data || [];
        setDetails((prev) => ({ ...prev, [diseaseId]: allRecords }));
      } catch (error) {
        console.error("Error fetching vaccination details:", error);
        enqueueSnackbar("Không thể tải chi tiết tiêm chủng!", {
          variant: "error",
        });
      } finally {
        setLoadingDetails((prev) => ({ ...prev, [diseaseId]: false }));
      }
    }
  };

  const toggleDropdown = (diseaseId) => {
    const record = records.find((r) => r.disease_id === diseaseId);
    if (record?.completed_doses > 0) {
      const isCurrentlyOpen = openDropdown === diseaseId;
      setOpenDropdown(isCurrentlyOpen ? null : diseaseId);

      if (!isCurrentlyOpen && !details[diseaseId]) {
        fetchDetails(diseaseId);
      }
    }
  };

  // Filter records based on filterMode
  const filteredRecords = (() => {
    switch (filterMode) {
      case "notEnough":
        return records.filter(
          (record) =>
            record.completed_doses > 0 &&
            record.completed_doses < record.dose_quantity
        );
      case "enough":
        return records.filter(
          (record) => +record.completed_doses === record.dose_quantity
        );
      default:
        return records;
    }
  })();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-3">
      {/* Filters */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setFilterMode("all")}
          className={`px-4 py-2 cursor-pointer text-sm font-medium rounded-lg transition-colors ${
            filterMode === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilterMode("notEnough")}
          className={`px-4 cursor-pointer py-2 text-sm font-medium rounded-lg transition-colors ${
            filterMode === "notEnough"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Chưa đủ mũi
        </button>
        <button
          onClick={() => setFilterMode("enough")}
          className={`px-4 py-2 cursor-pointer text-sm font-medium rounded-lg transition-colors ${
            filterMode === "enough"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Đã đủ mũi
        </button>
      </div>

      {/* Information Note */}
      {getUserRole() === "parent" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                <strong>Ghi chú:</strong> Đây là danh sách các mũi tiêm khuyến
                nghị tham khảo từ{" "}
                <a
                  href="https://vnvc.vn/lich-tiem-chung-cho-be/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  lịch tiêm chủng cho bé của VNVC
                </a>
                .
              </p>
              <p>
                Đây chỉ là danh sách các mũi tiêm khuyến nghị được nhà trường
                tham khảo được và cung cấp cho phụ huynh, không có ý nghĩa ràng
                buộc y tế rằng học sinh phải tiêm đủ hết tất cả mũi.
                <br />
                Có thể học sinh đã được tiêm những mũi tiêm khác ngoài các mũi
                tiêm được liệt kê, xem đầy đủ lịch sử các mũi tiêm của học sinh
                ở phần <strong>Lịch sử tiêm chủng</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16">
          <Syringe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có lịch sử tiêm chủng
          </h3>
          <p className="text-gray-500">
            Hiện tại chưa có thông tin tiêm chủng nào được ghi nhận
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại bệnh
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số mũi đã tiêm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số mũi cần tiêm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record, index) => (
                  <React.Fragment key={record.disease_id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.disease_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.completed_doses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.dose_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.completed_doses === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Chưa tiêm
                          </span>
                        ) : +record.completed_doses === record.dose_quantity ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Đã tiêm đủ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Chưa tiêm đủ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.completed_doses > 0 ? (
                          <button
                            onClick={() => toggleDropdown(record.disease_id)}
                            className="inline-flex cursor-pointer items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            {loadingDetails[record.disease_id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : openDropdown === record.disease_id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <span className="cursor-pointer text-sm">
                              {openDropdown === record.disease_id
                                ? "Ẩn"
                                : "Xem"}
                            </span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                    {openDropdown === record.disease_id && (
                      <tr>
                        <td colSpan="7" className="px-0 py-0 bg-gray-50">
                          <div className="px-6 py-4 border-t border-gray-200">
                            <VaccineDetailsDropdown
                              diseaseId={record.disease_id}
                              details={details[record.disease_id] || []}
                              loading={loadingDetails[record.disease_id]}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineRecordInfo;
