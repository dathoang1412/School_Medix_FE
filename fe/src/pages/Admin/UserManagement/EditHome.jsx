import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Plus } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import axiosClient from "../../../config/axiosClient";
import { getUserRole } from "../../../service/authService";

const EditHome = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [home, setHome] = useState({
    mom_id: null,
    dad_id: null,
    student_ids: [],
    contact_phone_number: "",
    contact_email: "",
  });
  const [parentsWithoutHome, setParentsWithoutHome] = useState([]);
  const [studentsWithoutHome, setStudentsWithoutHome] = useState([]);
  const [searchParent, setSearchParent] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [loading, setLoading] = useState({
    formSubmit: false,
    fetchingHome: false,
    fetchingParents: false,
    fetchingStudents: false,
  });

  // Lấy thông tin hộ gia đình
  const fetchHome = async () => {
    setLoading((prev) => ({ ...prev, fetchingHome: true }));
    try {
      const response = await axiosClient.get(`/home/${id}`);
      console.log("Fetched home:", response.data.data);
      const homeData = response.data.data;
      setHome({
        mom_id: homeData.mom_id || null,
        dad_id: homeData.dad_id || null,
        student_ids: homeData.student_ids || [],
        contact_phone_number: homeData.contact_phone_number || "",
        contact_email: homeData.contact_email || "",
      });
      // Thêm phụ huynh hiện tại vào danh sách
      setParentsWithoutHome((prev) => [
        ...prev,
        ...(homeData.mom_id
          ? [
              {
                id: homeData.mom_id,
                name: homeData.mom_name || `Mẹ (ID: ${homeData.mom_id})`,
                ismale: false,
                email: null,
                phone_number: null,
              },
            ]
          : []),
        ...(homeData.dad_id
          ? [
              {
                id: homeData.dad_id,
                name: homeData.dad_name || `Bố (ID: ${homeData.dad_id})`,
                ismale: true,
                email: null,
                phone_number: null,
              },
            ]
          : []),
      ]);
      setStudentsWithoutHome((prev) => [
        ...prev,
        ...(homeData.students || []).map((s) => ({
          id: s.id,
          name: s.name || `Học sinh (ID: ${s.id})`,
          class_name: s.class_name || "Chưa xác định",
          phone_number: null,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching home:", error);
      enqueueSnackbar(
        `Lỗi tải thông tin hộ gia đình: ${
          error.response?.data?.message || error.message
        }`,
        { variant: "error" }
      );
      if (error.response?.status === 404) {
        navigate(`/${getUserRole()}/home-manage`);
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetchingHome: false }));
    }
  };

  // Lấy danh sách phụ huynh chưa có hộ gia đình
  const fetchParentsWithoutHome = async () => {
    setLoading((prev) => ({ ...prev, fetchingParents: true }));
    try {
      const response = await axiosClient.get("/parents/without-home");
      console.log("Fetched parents without home:", response.data.data);
      const validParents = response.data.data.map((parent) => ({
        ...parent,
        name: parent.name || `Phụ huynh (ID: ${parent.id})`,
      }));
      setParentsWithoutHome((prev) => [...prev, ...validParents]);
    } catch (error) {
      console.error("Error fetching parents without home:", error);
      enqueueSnackbar(
        `Lỗi tải danh sách phụ huynh: ${
          error.response?.data?.message || error.message
        }`,
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({ ...prev, fetchingParents: false }));
    }
  };

  // Lấy danh sách học sinh chưa có hộ gia đình
  const fetchStudentsWithoutHome = async () => {
    setLoading((prev) => ({ ...prev, fetchingStudents: true }));
    try {
      const response = await axiosClient.get("/students/without-home");
      console.log("Fetched students without home:", response.data.data);
      const validStudents = response.data.data.map((student) => ({
        ...student,
        name: student.name || `Học sinh (ID: ${student.id})`,
        class_name: student.class_name || "Chưa xác định",
      }));
      setStudentsWithoutHome((prev) => [...prev, ...validStudents]);
    } catch (error) {
      console.error("Error fetching students without home:", error);
      enqueueSnackbar(
        `Lỗi tải danh sách học sinh: ${
          error.response?.data?.message || error.message
        }`,
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({ ...prev, fetchingStudents: false }));
    }
  };

  useEffect(() => {
    fetchHome();
    fetchParentsWithoutHome();
    fetchStudentsWithoutHome();
  }, [id]);

  // Lọc danh sách phụ huynh theo tìm kiếm
  const filteredParents = parentsWithoutHome.filter((parent) =>
    parent.name.toLowerCase().includes(searchParent.toLowerCase())
  );

  // Lọc danh sách học sinh theo tìm kiếm
  const filteredStudents = studentsWithoutHome.filter((student) =>
    student.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  // Xử lý chọn/bỏ chọn học sinh
  const handleStudentToggle = (studentId) => {
    setHome((prev) => {
      const studentIds = prev.student_ids.includes(studentId)
        ? prev.student_ids.filter((id) => id !== studentId)
        : [...prev.student_ids, studentId];
      console.log("Selected student IDs:", studentIds);
      return { ...prev, student_ids: studentIds };
    });
  };

  const handleUpdateHome = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, formSubmit: true }));

    try {
      const payload = {
        mom_id: home.mom_id || null,
        dad_id: home.dad_id || null,
        student_ids: home.student_ids,
        contact_phone_number: home.contact_phone_number || null,
        contact_email: home.contact_email || null,
      };
      console.log("Update home payload:", payload);

      const response = await axiosClient.patch(`/home/${id}`, payload);

      if (!response.data.error) {
        enqueueSnackbar(
          response.data.message || "Cập nhật hộ gia đình thành công",
          { variant: "success" }
        );
        navigate(`/${getUserRole()}/home-manage`);
      } else {
        enqueueSnackbar(response.data.message || "Có lỗi xảy ra", {
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error updating home:", error);
      enqueueSnackbar(
        `Lỗi cập nhật hộ gia đình: ${
          error.response?.data?.message || error.message
        }`,
        { variant: "error" }
      );
    } finally {
      setLoading((prev) => ({ ...prev, formSubmit: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/${getUserRole()}/home-manage`)}
            className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 mb-4 ${
              loading.formSubmit || loading.fetchingHome
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={loading.formSubmit || loading.fetchingHome}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl font-medium text-gray-900">
              Chỉnh sửa hộ gia đình
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Cập nhật thông tin hộ gia đình trong hệ thống
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">
              Thông tin hộ gia đình
            </h2>
          </div>
          {loading.fetchingHome ? (
            <div className="p-6 flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
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
              <span className="text-sm text-gray-600">
                Đang tải thông tin...
              </span>
            </div>
          ) : (
            <form onSubmit={handleUpdateHome} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    value={home.contact_phone_number || ""}
                    onChange={(e) =>
                      setHome({ ...home, contact_phone_number: e.target.value })
                    }
                    disabled={loading.formSubmit}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      loading.formSubmit ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={home.contact_email || ""}
                    onChange={(e) =>
                      setHome({ ...home, contact_email: e.target.value })
                    }
                    disabled={loading.formSubmit}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      loading.formSubmit ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Mom Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mẹ
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                      <select
                        value={home.mom_id || ""}
                        onChange={(e) =>
                          setHome({ ...home, mom_id: e.target.value || null })
                        }
                        disabled={loading.formSubmit || loading.fetchingParents}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          loading.formSubmit || loading.fetchingParents
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="">Chọn phụ huynh (mẹ)</option>
                        {filteredParents
                          .filter((parent) => !parent.ismale)
                          .map((parent) => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name} (ID: {parent.id})
                            </option>
                          ))}
                      </select>
                      {loading.fetchingParents && (
                        <div className="flex items-center gap-2 mt-2">
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
                          <span className="text-sm text-gray-600">
                            Đang tải danh sách phụ huynh...
                          </span>
                        </div>
                      )}
                      {!loading.fetchingParents &&
                        filteredParents.filter((parent) => !parent.ismale)
                          .length === 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Không có phụ huynh (mẹ) nào để chọn
                          </p>
                        )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/${getUserRole()}/create/parent`)
                      }
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md bg-blue-600 hover:bg-blue-700 ${
                        loading.formSubmit
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={loading.formSubmit}
                    >
                      <Plus size={14} />
                      Tạo phụ huynh mới
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm phụ huynh (mẹ)..."
                    value={searchParent}
                    onChange={(e) => setSearchParent(e.target.value)}
                    disabled={loading.formSubmit || loading.fetchingParents}
                    className={`mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      loading.formSubmit || loading.fetchingParents
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>

                {/* Dad Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bố
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                      <select
                        value={home.dad_id || ""}
                        onChange={(e) =>
                          setHome({ ...home, dad_id: e.target.value || null })
                        }
                        disabled={loading.formSubmit || loading.fetchingParents}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          loading.formSubmit || loading.fetchingParents
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="">Chọn phụ huynh (bố)</option>
                        {filteredParents
                          .filter((parent) => parent.ismale)
                          .map((parent) => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name} (ID: {parent.id})
                            </option>
                          ))}
                      </select>
                      {loading.fetchingParents && (
                        <div className="flex items-center gap-2 mt-2">
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
                          <span className="text-sm text-gray-600">
                            Đang tải danh sách phụ huynh...
                          </span>
                        </div>
                      )}
                      {!loading.fetchingParents &&
                        filteredParents.filter((parent) => parent.ismale)
                          .length === 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Không có phụ huynh (bố) nào để chọn
                          </p>
                        )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/${getUserRole()}/create/parent`)
                      }
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md bg-blue-600 hover:bg-blue-700 ${
                        loading.formSubmit
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={loading.formSubmit}
                    >
                      <Plus size={14} />
                      Tạo phụ huynh mới
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm phụ huynh (bố)..."
                    value={searchParent}
                    onChange={(e) => setSearchParent(e.target.value)}
                    disabled={loading.formSubmit || loading.fetchingParents}
                    className={`mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      loading.formSubmit || loading.fetchingParents
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>

                {/* Student Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Học sinh
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto p-2">
                        {loading.fetchingStudents ? (
                          <div className="flex items-center gap-2">
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
                            <span className="text-sm text-gray-600">
                              Đang tải danh sách học sinh...
                            </span>
                          </div>
                        ) : filteredStudents.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            Không có học sinh nào để chọn
                          </p>
                        ) : (
                          filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center gap-2 py-1"
                            >
                              <input
                                type="checkbox"
                                checked={home.student_ids.includes(
                                  student.id.toString()
                                )}
                                onChange={() =>
                                  handleStudentToggle(student.id.toString())
                                }
                                disabled={
                                  loading.formSubmit || loading.fetchingStudents
                                }
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                              <span className="text-sm">
                                {student.name} (ID: {student.id}, Lớp:{" "}
                                {student.class_name})
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/${getUserRole()}/create/student`)
                      }
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md bg-blue-600 hover:bg-blue-700 ${
                        loading.formSubmit
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={loading.formSubmit}
                    >
                      <Plus size={14} />
                      Tạo học sinh mới
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm học sinh..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    disabled={loading.formSubmit || loading.fetchingStudents}
                    className={`mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      loading.formSubmit || loading.fetchingStudents
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/${getUserRole()}/home-manage`)}
                  className={`px-4 cursor-pointer py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${
                    loading.formSubmit ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading.formSubmit}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={`flex cursor-pointer items-center px-4 py-2 text-sm text-white rounded-md ${
                    loading.formSubmit
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={loading.formSubmit}
                >
                  {loading.formSubmit ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
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
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật hộ gia đình"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditHome;
