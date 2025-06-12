import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import axiosClient from "../../config/axiosClient";
import { getUser } from "../../service/authService";
import { useNavigate } from "react-router-dom";

const SendDrugForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    diagnosis: "",
    scheduleSendDate: "",
    intakeDate: "",
    note: "",
    requestItems: [{ name: "", intakeTemplateTime: [], dosageUsage: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});

  useEffect(() => {
    const fetchChildData = async () => {
      const user = getUser();
      if (!user?.id) {
        setError("Vui lòng đăng nhập để gửi đơn thuốc.");
        return;
      }

      const selectedChild = localStorage.getItem("selectedChild");
      if (!selectedChild) {
        setError("Vui lòng chọn một đứa trẻ để gửi đơn thuốc.");
        return;
      }

      const child = JSON.parse(selectedChild);
      setCurrChild(child);
    };

    fetchChildData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestItemChange = (index, e) => {
    const { name, value } = e.target;
    const newRequestItems = [...formData.requestItems];
    newRequestItems[index][name] = value;
    setFormData((prev) => ({ ...prev, requestItems: newRequestItems }));
  };

  const handleAddRequestItem = () => {
    setFormData((prev) => ({
      ...prev,
      requestItems: [...prev.requestItems, { name: "", intakeTemplateTime: [], dosageUsage: "" }],
    }));
  };

  const handleIntakeTimeChange = (index, e) => {
    const times = e.target.value.split(",").map((t) => t.trim());
    const newRequestItems = [...formData.requestItems];
    newRequestItems[index].intakeTemplateTime = times;
    setFormData((prev) => ({ ...prev, requestItems: newRequestItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const user = getUser();
    if (!currChild?.id || !user?.id) {
      setError("Thông tin người dùng hoặc học sinh không hợp lệ.");
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("student_id", currChild.id);
    formDataToSend.append("create_by", user.id);
    formDataToSend.append("diagnosis", formData.diagnosis);
    formDataToSend.append("schedule_send_date", formData.scheduleSendDate);
    formDataToSend.append("intake_date", formData.intakeDate);
    formDataToSend.append("note", formData.note);
    formDataToSend.append("status", "PROCESSING");
    formData.requestItems.forEach((item, index) => {
      formDataToSend.append(`request_items[${index}][name]`, item.name);
      formDataToSend.append(`request_items[${index}][intake_template_time]`, JSON.stringify(item.intakeTemplateTime));
      formDataToSend.append(`request_items[${index}][dosage_usage]`, item.dosageUsage);
    });

    try {
      const response = await axiosClient.post("/send-drug-request", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      alert("Gửi đơn thuốc thành công!");
      navigate("/drug-table");
    } catch (error) {
      console.error("Error submitting drug request:", error);
      setError(error.message || "Không thể gửi đơn thuốc. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Đơn Thuốc Học Sinh</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Vui lòng điền đầy đủ thông tin dưới đây</p>

        <form onSubmit={handleSubmit}>
          {/* Thông tin học sinh (đã disabled từ useEffect) */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Thông tin học sinh</h3>
            <div className="grid grid-cols-1 gap-4">
              <label className="block text-sm font-medium text-gray-700">Họ và tên học sinh</label>
              <input
                type="text"
                name="studentName"
                value={currChild?.name || ""}
                placeholder="Họ và tên học sinh"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <label className="block text-sm font-medium text-gray-700">Lớp</label>
              <input
                type="text"
                name="class"
                value={currChild?.class || "Chưa có thông tin"}
                placeholder="Lớp"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
          </div>

          {/* Thông tin gửi */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Thông tin gửi</h3>
            <div className="grid grid-cols-1 gap-4">
              <label className="block text-sm font-medium text-gray-700">Tên người gửi</label>
              <input
                type="text"
                name="parentName"
                value={getUser()?.user_metadata?.name || ""}
                placeholder="Tên gửi"
                className="w-full bg-gray-300 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <label className="block text-sm font-medium text-gray-700">Ngày hẹn gửi thuốc</label>
              <input
                type="date"
                name="scheduleSendDate"
                value={formData.scheduleSendDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <label className="block text-sm font-medium text-gray-700">Ngày cho uống thuốc</label>
              <input
                type="date"
                name="intakeDate"
                value={formData.intakeDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Ghi chú"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Chỉ thị thuốc */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Chỉ thị thuốc</h3>
            {formData.requestItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded-lg">
                <label className="block text-sm font-medium text-gray-700">Tên thuốc</label>
                <input
                  type="text"
                  name="name"
                  value={item.name}
                  onChange={(e) => handleRequestItemChange(index, e)}
                  placeholder="Tên thuốc"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">Cách sử dụng</label>
                <input
                  type="text"
                  name="dosageUsage"
                  value={item.dosageUsage}
                  onChange={(e) => handleRequestItemChange(index, e)}
                  placeholder="Cách sử dụng (VD: Uống 1 lần/ngày)"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">Thời gian uống (nhập nhiều thời gian cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  name="intakeTemplateTime"
                  value={item.intakeTemplateTime.join(", ")}
                  onChange={(e) => handleIntakeTimeChange(index, e)}
                  placeholder="VD: 8h, 12h, 18h"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddRequestItem}
              className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Thêm thuốc
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/drug-table")}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Đang gửi..." : "Gửi đơn thuốc"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SendDrugForm;