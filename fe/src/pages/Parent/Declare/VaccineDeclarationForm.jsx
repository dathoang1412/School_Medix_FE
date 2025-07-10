import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../config/axiosClient";
import { getStudentInfo } from "../../../service/childenService";
import { enqueueSnackbar } from "notistack";

const VaccineDeclarationForm = () => {
  const { student_id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: "",
    register_id: null,
    description: "",
    disease_id: "",
    vaccine_id: "",
    location: "",
    vaccination_date: "",
    status: "COMPLETED",
  });
  const [vaccines, setVaccines] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch student and vaccines data
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

      // Fetch vaccines
      try {
        const response = await axiosClient.get("/vaccines");
        console.log("Vaccines response:", response.data);
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        setVaccines(response.data.data);
      } catch (error) {
        console.error("Error fetching vaccines:", error);
        setError("Không thể tải danh sách vaccine. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [student_id]);

  // Fetch diseases when vaccine_id changes
  useEffect(() => {
    const fetchDiseases = async () => {
      if (formData.vaccine_id && !isNaN(formData.vaccine_id)) {
        console.log("Fetching diseases for vaccine_id:", formData.vaccine_id);
        try {
          const response = await axiosClient.get(
            `/vaccines/${formData.vaccine_id}/diseases`
          );
          console.log("Diseases response:", response.data);
          if (response.data.error) {
            throw new Error(response.data.message);
          }
          setDiseases(response.data.data);
          setFormData((prev) => ({ ...prev, disease_id: "" }));
        } catch (error) {
          console.error("Error fetching diseases:", error);
          setError(
            error.response?.data?.message ||
              "Không thể tải danh sách bệnh. Vui lòng thử lại sau."
          );
          setDiseases([]);
        }
      } else {
        setDiseases([]);
        setFormData((prev) => ({ ...prev, disease_id: "" }));
      }
    };
    fetchDiseases();
  }, [formData.vaccine_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("FORM DATA: ", formData);

    // Validate required fields
    if (
      !formData.student_id ||
      !formData.vaccination_date ||
      !formData.vaccine_id
    ) {
      enqueueSnackbar(
        "Vui lòng nhập đầy đủ các trường bắt buộc (trừ bệnh nếu không có).",
        { variant: "warning" }
      );
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      student_id: formData.student_id,
      register_id: formData.register_id,
      description: formData.description || null,
      disease_id: formData.disease_id
        ? parseInt(formData.disease_id, 10)
        : null,
      vaccine_id: parseInt(formData.vaccine_id, 10),
      location: formData.location || null,
      vaccination_date: formData.vaccination_date,
      status: formData.status,
      campaign_id: null, // Explicitly set to null as per requirement
    };

    console.log("Submitting data:", dataToSend);

    try {
      const response = await axiosClient.post(
        "/vaccination-record",
        dataToSend
      );
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      enqueueSnackbar("Khai báo tiêm chủng thành công.", {
        variant: "success",
      });
      navigate(`/parent/edit/${formData.student_id}/vaccine-declare`);
    } catch (error) {
      console.error("Error submitting vaccination record:", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi khai báo. Vui lòng thử lại sau.",
        { variant: "error" }
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
              Khai Báo Tiêm Chủng
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

            {/* Thông tin tiêm chủng */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin tiêm chủng
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vaccine <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vaccine_id"
                    value={formData.vaccine_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
                    required
                  >
                    <option value="" disabled>
                      Chọn vaccine
                    </option>
                    {vaccines.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.id}>
                        {vaccine.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bệnh{" "}
                    {diseases.length > 0 && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    name="disease_id"
                    value={formData.disease_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
                    disabled={!formData.vaccine_id || diseases.length === 0}
                    required={diseases.length > 0}
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
                    Ngày tiêm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="vaccination_date"
                    value={formData.vaccination_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm tiêm
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Nhập địa điểm tiêm..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả (nếu có)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                  />
                </div>

                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons and Success Message */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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

export default VaccineDeclarationForm;