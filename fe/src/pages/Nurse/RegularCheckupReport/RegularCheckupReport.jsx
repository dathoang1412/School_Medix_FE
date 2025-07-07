import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getSession } from "../../../config/Supabase";
import { ArrowLeft, Edit, X, ChevronDown } from "lucide-react";

const RegularCheckupReport = () => {
  const [generalHealthList, setGeneralHealthList] = useState([]);
  const [specialistList, setSpecialistList] = useState([]);
  const [tabs, setTabs] = useState(["Khám tổng quát"]);
  const [activeTab, setActiveTab] = useState("Khám tổng quát");
  const [loading, setLoading] = useState({
    general: false,
    specialist: false,
    tabs: false,
    update: {},
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    blood_pressure: "",
    left_eye: "",
    right_eye: "",
    ear: "",
    nose: "",
    throat: "",
    teeth: "",
    gums: "",
    skin_condition: "",
    heart: "",
    lungs: "",
    spine: "",
    posture: "",
    final_diagnosis: "",
  });

  const { campaign_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Danh sách lựa chọn cho các trường khám
  const dropdownOptions = [
    { value: "Bình thường", label: "Bình thường" },
    { value: "Bất thường", label: "Bất thường" },
    { value: "Cần theo dõi", label: "Cần theo dõi" },
    { value: "other", label: "Khác (nhập tùy chỉnh)" },
  ];

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuth = async () => {
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

  // Lấy danh sách các tab chuyên khoa
  const fetchTabs = async () => {
    setLoading((prev) => ({ ...prev, tabs: true }));
    try {
      const response = await axiosClient.get(
        `/campaign/${campaign_id}/specialist-exam/record`
      );
      const specialistTabs = response.data.data.map((el) => el.name);
      setTabs(["Khám tổng quát", ...specialistTabs]);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tab:", error);
      enqueueSnackbar("Không thể tải danh sách tab chuyên khoa!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, tabs: false }));
    }
  };

  // Lấy danh sách khám tổng quát
  const fetchGeneralList = async () => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      const res = await axiosClient.get(
        `/health-record/campaign/${campaign_id}`
      );
      setGeneralHealthList(res.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khám tổng quát:", error);
      enqueueSnackbar("Không thể tải danh sách khám tổng quát!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

  // Lấy danh sách khám chuyên khoa
  const fetchSpecialistList = async () => {
    setLoading((prev) => ({ ...prev, specialist: true }));
    try {
      const res = await axiosClient.get(
        `/campaign/${campaign_id}/specialist-exam/record`
      );
      setSpecialistList(res.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu chuyên khoa:", error);
      enqueueSnackbar("Không thể tải danh sách khám chuyên khoa!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, specialist: false }));
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Xử lý thay đổi trường khám (select hoặc input)
  const handleExamFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mở modal cập nhật
  const openUpdateModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      height: record.height || "",
      weight: record.weight || "",
      blood_pressure: record.blood_pressure || "",
      left_eye: record.left_eye || "",
      right_eye: record.right_eye || "",
      ear: record.ear || "",
      nose: record.nose || "",
      throat: record.throat || "",
      teeth: record.teeth || "",
      gums: record.gums || "",
      skin_condition: record.skin_condition || "",
      heart: record.heart || "",
      lungs: record.lungs || "",
      spine: record.spine || "",
      posture: record.posture || "",
      final_diagnosis: record.final_diagnosis || "",
    });
    setShowUpdateModal(true);
  };

  // Xử lý gửi form
  const handleFormSubmit = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để cập nhật!", { variant: "error" });
      navigate("/login");
      return;
    }

    const { register_id } = selectedRecord;
    const payload = {
      height: formData.height,
      weight: formData.weight,
      blood_pressure: formData.blood_pressure,
      left_eye: formData.left_eye,
      right_eye: formData.right_eye,
      ear: formData.ear,
      nose: formData.nose,
      throat: formData.throat,
      teeth: formData.teeth,
      gums: formData.gums,
      skin_condition: formData.skin_condition,
      heart: formData.heart,
      lungs: formData.lungs,
      spine: formData.spine,
      posture: formData.posture,
      final_diagnosis: formData.final_diagnosis,
    };

    // Validate các trường bắt buộc
    const mandatoryFields = [
      { field: "height", label: "Chiều cao" },
      { field: "weight", label: "Cân nặng" },
      { field: "blood_pressure", label: "Huyết áp" },
      { field: "left_eye", label: "Thị lực mắt trái" },
      { field: "right_eye", label: "Thị lực mắt phải" },
    ];

    const missingFields = mandatoryFields.filter(
      ({ field }) => !payload[field] || payload[field].toString().trim() === ""
    );

    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Vui lòng điền đầy đủ các chỉ số bắt buộc: ${missingFields
          .map(({ label }) => label)
          .join(", ")}`,
        { variant: "warning" }
      );
      return;
    }

    setLoading((prev) => ({
      ...prev,
      update: { ...prev.update, [register_id]: true },
    }));
    try {
      await axiosClient.patch(`/health-record/${register_id}/done`, payload);
      setGeneralHealthList((prev) =>
        prev.map((item) =>
          item.register_id === register_id
            ? { ...item, status: "DONE", ...payload }
            : item
        )
      );
      enqueueSnackbar("Cập nhật hồ sơ sức khỏe thành công!", {
        variant: "success",
      });
      setShowUpdateModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ sức khỏe:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Lỗi khi cập nhật hồ sơ!",
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        update: { ...prev.update, [register_id]: false },
      }));
    }
  };

  // Lấy tất cả dữ liệu khi component mount
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchTabs(),
          fetchGeneralList(),
          fetchSpecialistList(),
        ]);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchAllData();
  }, [isAuthenticated]);

  // Hiển thị badge trạng thái
  const getStatusBadge = (status) => {
    return status === "WAITING" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Chờ khám
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Hoàn thành
      </span>
    );
  };

  // Render bảng dữ liệu
  const renderHealthTable = (records, type) => (
    <div className="overflow-x-auto">
      {loading[type] ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
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
            <span className="text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đăng ký
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên học sinh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lớp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((item) => (
              <tr key={item.register_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{item.register_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.student_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.class_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => openUpdateModal(item)}
                    disabled={loading.update[item.register_id] || loading[type]}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      loading.update[item.register_id] || loading[type]
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                    }`}
                    title="Cập nhật hồ sơ sức khỏe"
                    aria-label="Cập nhật hồ sơ sức khỏe"
                  >
                    {loading.update[item.register_id] ? (
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
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Lấy dữ liệu cho tab hiện tại
  const tabData = useMemo(() => {
    if (activeTab === "Khám tổng quát") {
      return { records: generalHealthList, type: "general" };
    }
    const specialistData = specialistList.find(
      (item) => item.name === activeTab
    ) || {
      records: [],
    };
    return { records: specialistData.records || [], type: "specialist" };
  }, [activeTab, generalHealthList, specialistList]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-500">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/nurse/regular-checkup")}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Quay lại danh sách kiểm tra định kỳ"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </button>
      </div>

      {/* Tab Header */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{activeTab}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {tabData.records.length} học sinh
          </p>
        </div>
        {renderHealthTable(tabData.records, tabData.type)}
      </div>

      {/* Modal cập nhật hồ sơ sức khỏe */}
      {showUpdateModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Cập nhật kết quả khám sức khỏe
              </h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedRecord(null);
                }}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800">
                  Học sinh: {selectedRecord.student_name}
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Lớp: {selectedRecord.class_name} | Mã đăng ký: #{selectedRecord.register_id}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thông số cơ bản */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                    Thông số cơ bản <span className="text-red-500">*</span>
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chiều cao (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange(e, "height")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Nhập chiều cao"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cân nặng (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange(e, "weight")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Nhập cân nặng"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Huyết áp (mmHg)
                    </label>
                    <input
                      type="text"
                      value={formData.blood_pressure}
                      onChange={(e) => handleInputChange(e, "blood_pressure")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Ví dụ: 120/80"
                      required
                    />
                  </div>
                </div>

                {/* Thị lực */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                    Thị lực <span className="text-red-500">*</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mắt trái (/10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.left_eye}
                        onChange={(e) => handleInputChange(e, "left_eye")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mắt phải (/10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.right_eye}
                        onChange={(e) => handleInputChange(e, "right_eye")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Khám các bộ phận */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                  Khám các bộ phận
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { field: "ear", label: "Tai" },
                    { field: "nose", label: "Mũi" },
                    { field: "throat", label: "Họng" },
                    { field: "teeth", label: "Răng" },
                    { field: "gums", label: "Lợi" },
                    { field: "skin_condition", label: "Da" },
                    { field: "heart", label: "Tim" },
                    { field: "lungs", label: "Phổi" },
                    { field: "spine", label: "Cột sống" },
                    { field: "posture", label: "Tư thế" },
                  ].map(({ field, label }) => {
                    const isCustomValue = !dropdownOptions.some(
                      (opt) => opt.value === formData[field] && opt.value !== "other"
                    );

                    return (
                      <div key={field} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </label>
                        <div className="relative">
                          <select
                            value={
                              isCustomValue ? "other" : formData[field] || ""
                            }
                            onChange={(e) => {
                              if (e.target.value === "other") {
                                handleExamFieldChange(field, "");
                              } else {
                                handleExamFieldChange(field, e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                          >
                            <option value="">Chọn trạng thái</option>
                            {dropdownOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="h-4 w-4 absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                        </div>
                        {isCustomValue && (
                          <input
                            type="text"
                            value={formData[field] || ""}
                            onChange={(e) =>
                              handleExamFieldChange(field, e.target.value)
                            }
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder={`Nhập tình trạng ${label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chẩn đoán cuối cùng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chẩn đoán cuối cùng
                </label>
                <textarea
                  value={formData.final_diagnosis}
                  onChange={(e) => handleInputChange(e, "final_diagnosis")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows="3"
                  placeholder="Nhập chẩn đoán (nếu có)"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={loading.update[selectedRecord?.register_id]}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading.update[selectedRecord?.register_id]
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading.update[selectedRecord?.register_id] ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Đang lưu...
                  </span>
                ) : (
                  "Lưu kết quả"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegularCheckupReport;