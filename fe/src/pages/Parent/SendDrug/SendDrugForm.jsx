import React, { useState, useEffect } from "react";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { getUser, getUserRole } from "../../../service/authService";
import { getStudentInfo } from "../../../service/childenService";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";

const SendDrugForm = () => {
  const navigate = useNavigate();
  const { student_id, request_id } = useParams();
  const [formData, setFormData] = useState({
    student_id: "",
    create_by: "",
    diagnosis: "",
    schedule_send_date: "",
    start_intake_date: "",
    end_intake_date: "",
    note: "",
    status: "PROCESSING",
    request_items: [
      { name: "", intake_templates: [], dosage_usage: "" },
    ],
    prescription_img_urls: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});
  const [currUser, setCurrUser] = useState({});
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isEditMode, setIsEditMode] = useState(!!request_id);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const role = getUserRole();
        if (!role) {
          setError("Vui lòng đăng nhập để gửi đơn thuốc.");
          setIsLoading(false);
          return;
        }
        setUserRole(role);

        const user = getUser();
        if (!user?.id) {
          setError("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
          setIsLoading(false);
          return;
        }
        setCurrUser({ id: user.id, name: user.name || "Người dùng" });

        const child = await getStudentInfo(student_id);
        if (!child) {
          setError("Vui lòng chọn một học sinh để gửi đơn thuốc.");
          setIsLoading(false);
          return;
        }
        setCurrChild(child);

        if (request_id) {
          try {
            const response = await axiosClient.get(`/send-drug-request/${request_id}`);
            if (response.data.error) {
              throw new Error(response.data.message);
            }
            const requestData = response.data.data;
            setFormData({
              student_id: requestData.student_id || "",
              create_by: user.id || requestData.create_by,
              diagnosis: requestData.diagnosis || "",
              schedule_send_date: requestData.schedule_send_date
                ? requestData.schedule_send_date.split("T")[0]
                : "",
              start_intake_date: requestData.start_intake_date
                ? requestData.start_intake_date.split("T")[0]
                : "",
              end_intake_date: requestData.end_intake_date
                ? requestData.end_intake_date.split("T")[0]
                : "",
              note: requestData.note || "",
              status: requestData.status || "PROCESSING",
              request_items: requestData.request_items.length > 0
                ? requestData.request_items.map((item) => ({
                    name: item.name || "",
                    intake_templates: Array.isArray(item.intake_templates)
                      ? item.intake_templates
                      : [],
                    dosage_usage: item.dosage_usage || "",
                  }))
                : [{ name: "", intake_templates: [], dosage_usage: "" }],
              prescription_img_urls: requestData.prescription_img_urls || [],
            });
            setPreviews(requestData.prescription_img_urls || []);
          } catch (error) {
            setError("Không thể tải dữ liệu đơn thuốc: " + (error.message || "Vui lòng thử lại."));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            student_id: child.id || "",
            create_by: user.id,
          }));
        }
      } catch (error) {
        setError("Lỗi khi tải dữ liệu: " + (error.message || "Vui lòng thử lại."));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [student_id, request_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews([...formData.prescription_img_urls, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    const isExistingUrl = index < formData.prescription_img_urls.length;
    if (isExistingUrl) {
      const newUrls = formData.prescription_img_urls.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, prescription_img_urls: newUrls }));
    } else {
      const fileIndex = index - formData.prescription_img_urls.length;
      const newFiles = files.filter((_, i) => i !== fileIndex);
      setFiles(newFiles);
    }
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleRequestItemChange = (index, field, value) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[index][field] = value;
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleAddIntakeTime = (index) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[index].intake_templates = [
      ...newRequestItems[index].intake_templates,
      "MORNING",
    ];
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleRemoveIntakeTime = (itemIndex, timeIndex) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[itemIndex].intake_templates = newRequestItems[
      itemIndex
    ].intake_templates.filter((_, i) => i !== timeIndex);
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleIntakeTimeChange = (itemIndex, timeIndex, value) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[itemIndex].intake_templates[timeIndex] = value;
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleAddRequestItem = () => {
    setFormData((prev) => ({
      ...prev,
      request_items: [
        ...prev.request_items,
        { name: "", intake_templates: [], dosage_usage: "" },
      ],
    }));
  };

  const handleRemoveRequestItem = (index) => {
    if (formData.request_items.length > 1) {
      const newRequestItems = formData.request_items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userRole !== "parent") {
      enqueueSnackbar("Chỉ phụ huynh mới có quyền gửi hoặc cập nhật đơn thuốc.", {
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    if (!formData.student_id || !formData.create_by) {
      setError("Thông tin học sinh hoặc người gửi không hợp lệ.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.schedule_send_date || !formData.start_intake_date || !formData.end_intake_date) {
      setError("Vui lòng nhập đầy đủ ngày hẹn gửi và khoảng thời gian uống thuốc.");
      setIsSubmitting(false);
      return;
    }

    const validRequestItems = formData.request_items
      .filter((item) => item.name.trim() && item.intake_templates.length > 0)
      .map((item) => ({
        name: item.name.trim(),
        intake_templates: item.intake_templates.filter((time) =>
          ["MORNING", "MIDDAY", "AFTERNOON"].includes(time)
        ),
        dosage_usage: item.dosage_usage.trim() || "Chưa nhập",
      }));

    if (validRequestItems.length === 0) {
      setError("Vui lòng nhập ít nhất một loại thuốc hợp lệ với thời gian uống.");
      setIsSubmitting(false);
      return;
    }

    let prescriptionImgUrls = formData.prescription_img_urls;
    if (files.length > 0) {
      try {
        const formDataFiles = new FormData();
        files.forEach((file) => formDataFiles.append("images", file));
        const uploadResponse = await axiosClient.post("/upload-prescription-imgs", formDataFiles, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (uploadResponse.data.error) {
          throw new Error(uploadResponse.data.message);
        }
        prescriptionImgUrls = [...prescriptionImgUrls, ...uploadResponse.data.prescription_img_urls];
      } catch (error) {
        setError("Lỗi khi tải lên ảnh đơn thuốc: " + (error.message || "Vui lòng thử lại."));
        setIsSubmitting(false);
        return;
      }
    }

    const dataToSend = {
      student_id: formData.student_id,
      create_by: formData.create_by,
      diagnosis: formData.diagnosis || "",
      schedule_send_date: formData.schedule_send_date,
      start_intake_date: formData.start_intake_date,
      end_intake_date: formData.end_intake_date,
      note: formData.note || null,
      request_items: validRequestItems,
      prescription_img_urls: prescriptionImgUrls,
    };

    try {
      const endpoint = isEditMode ? `/send-drug-request/${request_id}` : "/send-drug-request";
      const method = isEditMode ? "patch" : "post";
      const response = await axiosClient[method](endpoint, dataToSend);
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      enqueueSnackbar(isEditMode ? "Cập nhật đơn thuốc thành công!" : "Gửi đơn thuốc thành công!", {
        variant: "success",
      });
      navigate(`/parent/edit/${currChild.id}/drug-table`);
    } catch (error) {
      console.error("Error submitting drug request:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi/cập nhật đơn thuốc. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (!formData.prescription_img_urls.includes(preview)) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [previews, formData.prescription_img_urls]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? "Cập Nhật Đơn Thuốc" : "Đơn Thuốc Học Sinh"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Vui lòng điền đầy đủ thông tin dưới đây
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin học sinh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID học sinh
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên học sinh
                  </label>
                  <input
                    type="text"
                    value={currChild?.name || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lớp
                  </label>
                  <input
                    type="text"
                    value={currChild?.class_name || "Chưa có thông tin"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
              </div>
            </section>

            <section className="hidden">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin người gửi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID người gửi
                  </label>
                  <input
                    type="text"
                    name="create_by"
                    value={formData.create_by}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên người gửi
                  </label>
                  <input
                    type="text"
                    value={currUser?.name || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn thuốc</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chẩn đoán bệnh
                  </label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Nhập chẩn đoán bệnh..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày hẹn gửi thuốc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="schedule_send_date"
                      value={formData.schedule_send_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bắt đầu uống thuốc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_intake_date"
                      value={formData.start_intake_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kết thúc uống thuốc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_intake_date"
                      value={formData.end_intake_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tải lên ảnh đơn thuốc
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:hover:bg-blue-100 file:cursor-pointer"
                    />
                  </div>
                  {previews.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Xem trước ảnh</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                              title="Xóa ảnh"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ghi chú thêm..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Danh sách thuốc</h2>
                <button
                  type="button"
                  onClick={handleAddRequestItem}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thuốc
                </button>
              </div>

              <div className="space-y-4">
                {formData.request_items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Thuốc #{index + 1}</h3>
                      {formData.request_items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRequestItem(index)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên thuốc <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleRequestItemChange(index, "name", e.target.value)}
                          placeholder="Nhập tên thuốc"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cách sử dụng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.dosage_usage}
                          onChange={(e) =>
                            handleRequestItemChange(index, "dosage_usage", e.target.value)
                          }
                          placeholder="VD: Uống 1 viên/lần"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời gian uống <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {item.intake_templates.map((time, timeIndex) => (
                            <div key={timeIndex} className="flex items-center gap-2">
                              <select
                                value={time}
                                onChange={(e) =>
                                  handleIntakeTimeChange(index, timeIndex, e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                <option value="" disabled>
                                  Chọn thời gian uống
                                </option>
                                <option value="MORNING">Sáng</option>
                                <option value="MIDDAY">Trưa</option>
                                <option value="AFTERNOON">Chiều</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemoveIntakeTime(index, timeIndex)}
                                className="text-red-600 hover:text-red-800 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddIntakeTime(index)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 cursor-pointer"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm thời gian uống
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/parent/edit/${currChild.id}/drug-table`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || userRole !== "parent"}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md border border-transparent flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
                  isSubmitting || userRole !== "parent"
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={
                  userRole !== "parent"
                    ? "Chỉ phụ huynh mới có quyền gửi/cập nhật đơn thuốc"
                    : ""
                }
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditMode ? "Cập nhật đơn thuốc" : "Gửi đơn thuốc"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendDrugForm;