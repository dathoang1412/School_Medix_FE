import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../config/axiosClient";
import { getStudentInfo } from "../../../service/childenService";

const DiseaseDeclarationForm = () => {
  const { student_id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: "",
    disease_id: "",
    diagnosis: "",
    detect_date: "",
    cure_date: "",
    location_cure: "",
    transferred_to: "",
    status: "",
  });
  const [diseases, setDiseases] = useState([]);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState(null); // For cure_date warning

  // Fetch student and diseases data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // Fetch student data
      try {
        if (!student_id) {
          setError("Không tìm thấy ID học sinh.");
          setIsLoading(false);
          return;
        }

        const studentData = await getStudentInfo(student_id);
        if (!studentData) {
          setError("Không thể tải thông tin học sinh. Vui lòng thử lại.");
          setIsLoading(false);
          return;
        }

        setStudent(studentData);
        setFormData((prev) => ({
          ...prev,
          student_id: studentData.id || "",
        }));
      } catch (error) {
        console.error("Error fetching student:", error);
        setError("Không thể tải thông tin học sinh. Vui lòng thử lại.");
      }

      // Fetch diseases
      try {
        const response = await axiosClient.get("/diseases");
        console.log("Diseases response:", response.data.data);
        setDiseases(response.data.data); // Response is an array of { id, name, description }
      } catch (error) {
        console.error("Error fetching diseases:", error);
        setError(
          error.response?.data?.message ||
            "Không thể tải danh sách bệnh. Vui lòng thử lại sau."
        );
        setDiseases([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [student_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "status" && value !== "RECOVERED") {
      setFormData((prev) => ({ ...prev, cure_date: "" })); // Clear cure_date if status is not RECOVERED
      setWarning(null); // Clear warning when status changes
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setWarning(null);

    // Validate required fields
    if (
      !formData.student_id ||
      !formData.disease_id ||
      !formData.detect_date ||
      !formData.status
    ) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc.");
      setIsLoading(false);
      return;
    }

    if (formData.status === "RECOVERED" && !formData.cure_date) {
      setWarning('Vui lòng nhập ngày khỏi bệnh khi trạng thái là "Đã khỏi"');
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      student_id: formData.student_id,
      disease_id: parseInt(formData.disease_id, 10),
      diagnosis: formData.diagnosis || null,
      detect_date: formData.detect_date,
      cure_date: formData.cure_date || null,
      location_cure: formData.location_cure || null,
      transferred_to: formData.transferred_to || null,
      status: formData.status,
    };

    console.log("Submitting data:", dataToSend);

    try {
      const response = await axiosClient.post(
        `/student/${formData.student_id}/disease-record`,
        dataToSend
      );
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(`/parent/edit/${formData.student_id}/disease-declare`);
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error("Error submitting disease record:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi khai báo bệnh. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Khai Báo Bệnh
            </h1>
            <p className="text-gray-600 mt-1">
              Vui lòng điền đầy đủ thông tin dưới đây
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
            {/* Thông tin học sinh */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin học sinh
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID học sinh
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên học sinh
                  </label>
                  <input
                    type="text"
                    value={student?.name || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Thông tin bệnh */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin bệnh
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bệnh <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="disease_id"
                    value={formData.disease_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
                    required
                  >
                    <option value="" disabled>
                      {diseases.length > 0 ? "Chọn bệnh" : "Không có bệnh nào"}
                    </option>
                    {diseases.map((disease) => (
                      <option key={disease.id} value={disease.id}>
                        {disease.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chẩn đoán
                  </label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Nhập chẩn đoán (nếu có)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày phát hiện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="detect_date"
                    value={formData.detect_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nơi điều trị
                  </label>
                  <input
                    type="text"
                    name="location_cure"
                    value={formData.location_cure}
                    onChange={handleChange}
                    placeholder="Nhập nơi điều trị..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chuyển đến
                  </label>
                  <input
                    type="text"
                    name="transferred_to"
                    value={formData.transferred_to}
                    onChange={handleChange}
                    placeholder="Nhập nơi chuyển đến (nếu có)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
                    required
                  >
                    <option value="" disabled>
                      Chọn trạng thái
                    </option>
                    <option value="RECOVERED">Đã khỏi</option>
                    <option value="UNDER_TREATMENT">Đang điều trị</option>
                  </select>
                </div>

                {formData.status === "RECOVERED" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày khỏi bệnh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="cure_date"
                      value={formData.cure_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Warning Message */}
            {warning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">{warning}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="textWr-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons and Success Message */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              {success && (
                <p className="text-sm font-medium text-green-600 flex items-center">
                  <span className="mr-1">✔</span> GHI NHẬN BỆNH CHO HỌC SINH
                  THÀNH CÔNG
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang gửi..." : "Gửi khai báo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDeclarationForm;
