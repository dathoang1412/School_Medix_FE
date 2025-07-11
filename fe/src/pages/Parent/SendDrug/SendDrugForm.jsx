import React, { useState, useEffect } from "react";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import axiosClient from "../../../config/axiosClient";
import { getUser } from "../../../service/authService";
import { useNavigate, useParams } from "react-router-dom";
import { getChildClass, getStudentInfo } from "../../../service/childenService";
import { enqueueSnackbar } from "notistack";

const SendDrugForm = () => {
  const navigate = useNavigate();
  const { student_id } = useParams();
  const [formData, setFormData] = useState({
    student_id: "",
    create_by: "",
    diagnosis: "",
    schedule_send_date: "",
    intake_date: "",
    note: "",
    status: "PROCESSING",
    request_items: [{ name: "", intake_template_time: [], dosage_usage: "" }],
    prescription_img_urls: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});
  const [currUser, setCurrUser] = useState({});
  const [childClass, setChildClass] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = getUser();
      if (!user?.id) {
        setError("Vui lòng đăng nhập để gửi đơn thuốc.");
        return;
      }
      setCurrUser(user);

      const child = await getStudentInfo(student_id);
      if (!child) {
        setError("Vui lòng chọn một học sinh để gửi đơn thuốc.");
        return;
      }
      setCurrChild(child);

      const clas = await getChildClass();
      setChildClass(clas);

      setFormData((prev) => ({
        ...prev,
        student_id: child.id || "",
        create_by: user?.id || "",
      }));
    };
    fetchData();
  }, [student_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Reset the input field to allow re-selecting the same file
    e.target.value = null;
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleRequestItemChange = (index, field, value) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[index][field] = value;
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleAddIntakeTime = (index) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[index].intake_template_time = [
      ...newRequestItems[index].intake_template_time,
      "",
    ];
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleRemoveIntakeTime = (itemIndex, timeIndex) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[itemIndex].intake_template_time = newRequestItems[
      itemIndex
    ].intake_template_time.filter((_, i) => i !== timeIndex);
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleIntakeTimeChange = (itemIndex, timeIndex, value) => {
    const newRequestItems = [...formData.request_items];
    newRequestItems[itemIndex].intake_template_time[timeIndex] = value;
    setFormData((prev) => ({ ...prev, request_items: newRequestItems }));
  };

  const handleAddRequestItem = () => {
    setFormData((prev) => ({
      ...prev,
      request_items: [
        ...prev.request_items,
        { name: "", intake_template_time: [], dosage_usage: "" },
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
    setIsLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.student_id || !formData.create_by) {
      setError("Thông tin học sinh hoặc người gửi không hợp lệ.");
      setIsLoading(false);
      return;
    }

    if (!formData.schedule_send_date || !formData.intake_date) {
      setError("Vui lòng nhập đầy đủ ngày hẹn gửi và ngày uống thuốc.");
      setIsLoading(false);
      return;
    }

    // Validate request items
    const validRequestItems = formData.request_items
      .filter((item) => item.name.trim() && item.intake_template_time.length > 0)
      .map((item) => ({
        name: item.name.trim(),
        intake_template_time: item.intake_template_time.filter((time) => time.trim()),
        dosage_usage: item.dosage_usage.trim() || "Chưa nhập",
      }));

    if (validRequestItems.length === 0) {
      setError("Vui lòng nhập ít nhất một loại thuốc hợp lệ với thời gian uống.");
      setIsLoading(false);
      return;
    }

    let prescriptionImgUrls = [];
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
        prescriptionImgUrls = uploadResponse.data.prescription_img_urls;
      } catch (error) {
        setError("Lỗi khi tải lên ảnh đơn thuốc: " + (error.message || "Vui lòng thử lại."));
        setIsLoading(false);
        return;
      }
    }

    const dataToSend = {
      student_id: formData.student_id,
      create_by: formData.create_by,
      diagnosis: formData.diagnosis || "Chưa nhập",
      schedule_send_date: formData.schedule_send_date,
      intake_date: formData.intake_date,
      note: formData.note || null,
      request_items: validRequestItems,
      prescription_img_urls: prescriptionImgUrls,
    };

    try {
      const response = await axiosClient.post("/send-drug-request", dataToSend);
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      enqueueSnackbar("Gửi đơn thuốc thành công!", { variant: "success" });
      navigate(`/parent/edit/${currChild.id}/drug-table`);
    } catch (error) {
      console.error("Error submitting drug request:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi đơn thuốc. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Đơn Thuốc Học Sinh</h1>
            <p className="text-sm text-gray-600 mt-1">Vui lòng điền đầy đủ thông tin dưới đây</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Thông tin học sinh */}
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
                    value={childClass?.class_name || "Chưa có thông tin"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Thông tin người gửi */}
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

            {/* Thông tin đơn thuốc */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 glam">
                      Ngày cho uống thuốc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="intake_date"
                      value={formData.intake_date}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:hover:bg-blue-100"
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
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

            {/* Danh sách thuốc */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Danh sách thuốc</h2>
                <button
                  type="button"
                  onClick={handleAddRequestItem}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
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
                          className="text-red-600 hover:text-red-800"
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
                          onChange={(e) => handleRequestItemChange(index, "dosage_usage", e.target.value)}
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
                          {item.intake_template_time.map((time, timeIndex) => (
                            <div key={timeIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={time}
                                onChange={(e) => handleIntakeTimeChange(index, timeIndex, e.target.value)}
                                placeholder="VD: Trước khi ăn sáng"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveIntakeTime(index, timeIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddIntakeTime(index)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/parent/edit/${currChild.id}/drug-table`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Đang gửi..." : "Gửi đơn thuốc"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendDrugForm;