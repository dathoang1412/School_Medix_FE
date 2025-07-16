import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom"; // Added Link
import { useSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getSession } from "../../../config/Supabase";
import { ArrowLeft, Edit, X, ChevronDown, Upload } from "lucide-react";
import { getUserRole } from "../../../service/authService";

const RegularCheckupReport = () => {
  const [generalHealthList, setGeneralHealthList] = useState([]);
  const [specialistList, setSpecialistList] = useState([]);
  const [mainTabs, setMainTabs] = useState(["Khám tổng quát", "Chuyên khoa"]);
  const [activeMainTab, setActiveMainTab] = useState("Khám tổng quát");
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [loading, setLoading] = useState({
    general: false,
    specialist: false,
    tabs: false,
    update: {},
    upload: {},
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
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
  const [formErrors, setFormErrors] = useState({});
  const [specialistFormData, setSpecialistFormData] = useState({
    result: "",
    diagnosis: "",
    diagnosis_paper_urls: [],
  });
  const [files, setFiles] = useState([]);
  const { campaign_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const dropdownOptions = [
    { value: "Bình thường", label: "Bình thường" },
    { value: "Bất thường", label: "Bất thường" },
    { value: "Cần theo dõi", label: "Cần theo dõi" },
    { value: "other", label: "Khác (nhập tùy chỉnh)" },
  ];

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

  const fetchTabs = async () => {
    setLoading((prev) => ({ ...prev, tabs: true }));
    try {
      const response = await axiosClient.get(
        `/campaign/${campaign_id}/specialist-exam/record`
      );
      const specialistTabs = response.data.data.map((el) => el.name);
      setMainTabs(["Khám tổng quát", "Chuyên khoa"]);
      setActiveSubTab(specialistTabs[0] || null);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tab:", error);
      enqueueSnackbar("Không thể tải danh sách tab chuyên khoa!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, tabs: false }));
    }
  };

  const fetchGeneralList = async () => {
    setLoading((prev) => ({ ...prev, general: true }));
    try {
      const res = await axiosClient.get(
        `/health-record/campaign/${campaign_id}`
      );
      setGeneralHealthList(res.data.data);
      console.log("General List: ", res.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khám tổng quát:", error);
      enqueueSnackbar("Không thể tải danh sách khám tổng quát!", {
        variant: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, general: false }));
    }
  };

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

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleExamFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSpecialistInputChange = (e, field) => {
    setSpecialistFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

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
    setFormErrors({});
    setShowUpdateModal(true);
  };

  const openSpecialistUpdateModal = (record) => {
    setSelectedRecord(record);
    setSpecialistFormData({
      result: record.result || "",
      diagnosis: record.diagnosis || "",
      diagnosis_paper_urls: record.diagnosis_paper_urls || [],
    });
    setFiles([]);
    setShowSpecialistModal(true);
  };

  const validateField = (field, value) => {
    switch (field) {
      case "height":
        if (!value || isNaN(value) || value <= 0 || value > 250) {
          return "Chiều cao phải là số từ 0 đến 250 cm";
        }
        break;
      case "weight":
        if (!value || isNaN(value) || value <= 0 || value > 200) {
          return "Cân nặng phải là số từ 0 đến 200 kg";
        }
        break;
      case "blood_pressure":
        if (!value || !/^\d{1,3}\/\d{1,3}$/.test(value)) {
          return "Huyết áp phải có định dạng ví dụ: 120/80";
        }
        break;
      case "left_eye":
      case "right_eye":
        if (!value || isNaN(value) || value < 0 || value > 10) {
          return "Thị lực phải là số từ 0 đến 10";
        }
        break;
      case "ear":
      case "nose":
      case "throat":
      case "teeth":
      case "gums":
      case "skin_condition":
      case "heart":
      case "lungs":
      case "spine":
      case "posture":
        if (!value) {
          return `Vui lòng chọn hoặc nhập trạng thái cho ${field}`;
        }
        break;
      default:
        return "";
    }
    return "";
  };

  const validateForm = () => {
    const errors = {};
    const mandatoryFields = [
      { field: "height", label: "Chiều cao" },
      { field: "weight", label: "Cân nặng" },
      { field: "blood_pressure", label: "Huyết áp" },
      { field: "left_eye", label: "Thị lực mắt trái" },
      { field: "right_eye", label: "Thị lực mắt phải" },
      { field: "ear", label: "Tai" },
      { field: "nose", label: "Mũi" },
    ];

    mandatoryFields.forEach(({ field }) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {

    if (!validateForm()) {
      enqueueSnackbar("Vui lòng điền đầy đủ và đúng định dạng các chỉ số bắt buộc!", {
        variant: "warning",
      });
      return;
    }

    const { register_id } = selectedRecord;
    const payload = { ...formData };

    setLoading((prev) => ({
      ...prev,
      update: { ...prev.update, [register_id]: true },
    }));

    try {
      const updateResponse = await axiosClient.patch(`/checkup/${register_id}/record`, payload);
      setGeneralHealthList((prev) =>
        prev.map((item) =>
          item.register_id === register_id
            ? { ...item, ...payload }
            : item
        )
      );
      enqueueSnackbar("Cập nhật chỉ số sức khỏe thành công!", {
        variant: "success",
      });

      const completeResponse = await axiosClient.patch(`/health-record/${register_id}/done`);
      setGeneralHealthList((prev) =>
        prev.map((item) =>
          item.register_id === register_id
            ? { ...item, status: "DONE", ...payload }
            : item
        )
      );
      enqueueSnackbar("Hoàn tất hồ sơ sức khỏe thành công!", {
        variant: "success",
      });

      setShowUpdateModal(false);
      setSelectedRecord(null);
      setFormErrors({});
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ sức khỏe:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Lỗi khi cập nhật hồ sơ sức khỏe!",
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        update: { ...prev.update, [register_id]: false },
      }));
    }
  };

  const handleSpecialistFormSubmit = async () => {

    const { register_id, spe_exam_id } = selectedRecord;
    let diagnosisUrls = specialistFormData.diagnosis_paper_urls;

    if (files.length > 0) {
      setLoading((prev) => ({
        ...prev,
        upload: { ...prev.upload, [register_id]: true },
      }));
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const uploadResponse = await axiosClient.post(
          `/upload-diagnosis_url/${register_id}/${spe_exam_id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        diagnosisUrls = [...diagnosisUrls, ...uploadResponse.data.urls];
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        enqueueSnackbar(
          error.response?.data?.message || "Lỗi khi upload ảnh!",
          { variant: "error" }
        );
        setLoading((prev) => ({
          ...prev,
          upload: { ...prev.upload, [register_id]: false },
        }));
        return;
      } finally {
        setLoading((prev) => ({
          ...prev,
          upload: { ...prev.upload, [register_id]: false },
        }));
      }
    }

    const payload = {
      result: specialistFormData.result,
      diagnosis: specialistFormData.diagnosis,
      diagnosis_url: diagnosisUrls,
    };

    const mandatoryFields = [
      { field: "result", label: "Kết quả khám" },
      { field: "diagnosis", label: "Chẩn đoán" },
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
      const updateResponse = await axiosClient.put(
        `/special-exam-record/${register_id}/${spe_exam_id}`,
        payload
      );

      const completeResponse = await axiosClient.patch(
        `/checkup-register/${register_id}/specialist-exam/${spe_exam_id}/done`
      );

      setSpecialistList((prev) =>
        prev.map((specialist) =>
          specialist.name === activeSubTab
            ? {
                ...specialist,
                records: specialist.records.map((record) =>
                  record.register_id === register_id &&
                  record.spe_exam_id === spe_exam_id
                    ? {
                        ...record,
                        ...updateResponse.data.data,
                        status: completeResponse.data.data.status,
                      }
                    : record
                ),
              }
            : specialist
        )
      );

      enqueueSnackbar("Cập nhật kết quả khám chuyên khoa thành công!", {
        variant: "success",
      });
      setShowSpecialistModal(false);
      setSelectedRecord(null);
      setFiles([]);
    } catch (error) {
      console.error("Lỗi khi cập nhật kết quả khám chuyên khoa:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Lỗi khi cập nhật kết quả khám!",
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        update: { ...prev.update, [register_id]: false },
      }));
    }
  };

  useEffect(() => {
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
  }, []);

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
              {type === "specialist" && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kết quả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chẩn đoán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                </>
              )}
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
                  <Link
                    to={`/${getUserRole()}/student-overview/${item.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {item.student_name || "N/A"}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.class_name}
                </td>
                {type === "specialist" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.result || "Chưa cập nhật"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.diagnosis || "Chưa cập nhật"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.diagnosis_paper_urls?.length > 0 ? (
                        <div className="flex space-x-2">
                          {item.diagnosis_paper_urls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Hình {index + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        "Chưa có hình"
                      )}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() =>
                      type === "general"
                        ? openUpdateModal(item)
                        : openSpecialistUpdateModal(item)
                    }
                    disabled={loading.update[item.register_id] || loading[type]}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      loading.update[item.register_id] || loading[type]
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                    }`}
                    title={
                      type === "general"
                        ? "Cập nhật hồ sơ sức khỏe"
                        : "Cập nhật kết quả khám chuyên khoa"
                    }
                    aria-label={
                      type === "general"
                        ? "Cập nhật hồ sơ sức khỏe"
                        : "Cập nhật kết quả khám chuyên khoa"
                    }
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

  const tabData = useMemo(() => {
    if (activeMainTab === "Khám tổng quát") {
      return { records: generalHealthList, type: "general" };
    }
    const specialistData = specialistList.find(
      (item) => item.name === activeSubTab
    ) || {
      records: [],
    };
    return { records: specialistData.records || [], type: "specialist" };
  }, [activeMainTab, activeSubTab, generalHealthList, specialistList]);



  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/${getUserRole()}/regular-checkup`)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Quay lại danh sách kiểm tra định kỳ"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </button>
      </div>

      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Main Tabs">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`${
                activeMainTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              aria-current={activeMainTab === tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeMainTab === "Chuyên khoa" && (
        <div className="border-b border-gray-200 mb-4">
          <nav
            className="-mb-px flex space-x-4 overflow-x-auto"
            aria-label="Sub Tabs"
          >
            {specialistList.map((specialist) => (
              <button
                key={specialist.name}
                onClick={() => setActiveSubTab(specialist.name)}
                className={`${
                  activeSubTab === specialist.name
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm transition-colors`}
                aria-current={
                  activeSubTab === specialist.name ? "page" : undefined
                }
              >
                {specialist.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeMainTab === "Khám tổng quát"
              ? "Khám tổng quát"
              : activeSubTab || "Chuyên khoa"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {tabData.records.length} học sinh
          </p>
        </div>
        {renderHealthTable(tabData.records, tabData.type)}
      </div>

      {showUpdateModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Cập nhật kết quả khám sức khỏe
              </h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedRecord(null);
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-800">
                  Học sinh: {selectedRecord.student_name}
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Lớp: {selectedRecord.class_name} | Mã đăng ký: #
                  {selectedRecord.register_id}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                    Thông số cơ bản <span className="text-red-500">*</span>
                  </h4>
                  {[
                    {
                      field: "height",
                      label: "Chiều cao (cm)",
                      type: "number",
                      placeholder: "Nhập chiều cao (cm)",
                    },
                    {
                      field: "weight",
                      label: "Cân nặng (kg)",
                      type: "number",
                      placeholder: "Nhập cân nặng (kg)",
                    },
                    {
                      field: "blood_pressure",
                      label: "Huyết áp (mmHg)",
                      type: "text",
                      placeholder: "Ví dụ: 120/80",
                    },
                  ].map(({ field, label, type, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) => handleInputChange(e, field)}
                        className={`w-full px-3 py-2 border ${
                          formErrors[field] ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm`}
                        placeholder={placeholder}
                        required
                      />
                      {formErrors[field] && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors[field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                    Thị lực <span className="text-red-500">*</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { field: "left_eye", label: "Mắt trái (/10)" },
                      { field: "right_eye", label: "Mắt phải (/10)" },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formData[field]}
                          onChange={(e) => handleInputChange(e, field)}
                          className={`w-full px-3 py-2 border ${
                            formErrors[field] ? "border-red-500" : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm`}
                          required
                        />
                        {formErrors[field] && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors[field]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                  Khám các bộ phận <span className="text-red-500">*</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                            value={isCustomValue ? "other" : formData[field] || ""}
                            onChange={(e) => {
                              if (e.target.value === "other") {
                                handleExamFieldChange(field, "");
                              } else {
                                handleExamFieldChange(field, e.target.value);
                              }
                            }}
                            className={`w-full px-3 py-2 border ${
                              formErrors[field] ? "border-red-500" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none`}
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
                            onChange={(e) => handleExamFieldChange(field, e.target.value)}
                            className={`mt-2 w-full px-3 py-2 border ${
                              formErrors[field] ? "border-red-500" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm`}
                            placeholder={`Nhập tình trạng ${label.toLowerCase()}`}
                          />
                        )}
                        {formErrors[field] && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors[field]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

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

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedRecord(null);
                  setFormErrors({});
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

      {showSpecialistModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Cập nhật kết quả khám chuyên khoa
              </h3>
              <button
                onClick={() => {
                  setShowSpecialistModal(false);
                  setSelectedRecord(null);
                  setFiles([]);
                }}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-800">
                  Học sinh: {selectedRecord.student_name}
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Lớp: {selectedRecord.class_name} | Mã đăng ký: #
                  {selectedRecord.register_id} | Chuyên khoa: {activeSubTab}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kết quả khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={specialistFormData.result}
                    onChange={(e) => handleSpecialistInputChange(e, "result")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Nhập kết quả khám"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chẩn đoán <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={specialistFormData.diagnosis}
                    onChange={(e) => handleSpecialistInputChange(e, "diagnosis")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows="3"
                    placeholder="Nhập chẩn đoán"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tải lên hình ảnh chẩn đoán
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Đã chọn: {files.length} tệp</p>
                      <ul className="list-disc pl-5">
                        {files.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {specialistFormData.diagnosis_paper_urls.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh đã tải lên
                    </label>
                    <div className="flex space-x-2 flex-wrap">
                      {specialistFormData.diagnosis_paper_urls.map((url, index) => (
                        <div key={index} className="relative">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Hình {index + 1}
                          </a>
                          <button
                            onClick={() =>
                              setSpecialistFormData((prev) => ({
                                ...prev,
                                diagnosis_paper_urls: prev.diagnosis_paper_urls.filter(
                                  (_, i) => i !== index
                                ),
                              }))
                            }
                            className="ml-2 text-red-500 hover:text-red-700"
                            aria-label="Xóa hình ảnh"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSpecialistModal(false);
                  setSelectedRecord(null);
                  setFiles([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSpecialistFormSubmit}
                disabled={
                  loading.update[selectedRecord?.register_id] ||
                  loading.upload[selectedRecord?.register_id]
                }
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading.update[selectedRecord?.register_id] ||
                  loading.upload[selectedRecord?.register_id]
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading.update[selectedRecord?.register_id] ||
                loading.upload[selectedRecord?.register_id] ? (
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