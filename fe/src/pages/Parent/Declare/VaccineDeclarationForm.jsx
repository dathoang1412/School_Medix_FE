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
  const [vaccineDiseases, setVaccineDiseases] = useState([]);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch student and vaccine_disease data
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

      // Fetch vaccine_disease
      try {
        const response = await axiosClient.get("/vaccine-disease");
        console.log("Vaccine diseases response:", response.data);
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        setVaccineDiseases(response.data.data || []);
      } catch (error) {
        console.error("Error fetching vaccine_diseases:", error);
        setError("Không thể tải danh sách cụm bệnh. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [student_id]);

  // Fetch vaccines based on disease_id
  useEffect(() => {
    const fetchVaccines = async () => {
      if (!formData.disease_id) {
        setVaccines([]);
        setFormData((prev) => ({ ...prev, vaccine_id: "" }));
        return;
      }
      try {
        const diseaseId = formData.disease_id.split(',').map(Number);
        const res = await axiosClient.get(`/diseases/vaccines`, {
          params: { diseaseId }
        });
        console.log("Vaccines response:", res.data);
        setVaccines(res.data.data || []);
      } catch (error) {
        console.error("Error fetching vaccines:", error);
        setError("Không thể tải danh sách vaccine. Vui lòng thử lại sau.");
        setVaccines([]);
      }
    };
    fetchVaccines();
  }, [formData.disease_id]);

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
        ? formData.disease_id.split(',').map(Number)
        : null,
      vaccine_id: parseInt(formData.vaccine_id, 10),
      location: formData.location || null,
      vaccination_date: formData.vaccination_date,
      status: formData.status,
      campaign_id: null,
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
      enqueueSnackbar("Đăng ký thành công!", {
        variant: "success",
      });
      navigate(`/parent/edit/${student_id}/history-declare-record`);
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

  const handleBack = () => {
    navigate(`/parent/edit/${student_id}/history-declare-record`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header and Back Button */}
          <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Khai Báo Tiêm Chủng
              </h1>
              <p className="text-gray-600 mt-1">
                Vui lòng điền đầy đủ thông tin dưới đây
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Quay lại
            </button>
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
                    Chọn Cụm Bệnh <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="disease_id"
                    value={formData.disease_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
                    required
                  >
                    <option value="" disabled>
                      Chọn cụm bệnh
                    </option>
                    {vaccineDiseases.map((vd) => (
                      <option key={vd.disease_id} value={vd.disease_id}>
                        {vd.disease_name}
                      </option>
                    ))}
                  </select>
                </div>

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
                    disabled={!formData.disease_id || vaccines.length === 0}
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
                    Ngày tiêm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="vaccination_date"
                    value={formData.vaccination_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading || !formData.vaccine_id}
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
                    disabled={isLoading || !formData.vaccine_id}
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
                    disabled={isLoading || !formData.vaccine_id}
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

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.vaccine_id}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
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