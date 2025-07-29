import React, { useEffect, useState } from "react";
import axiosClient from "../../../config/axiosClient";
import { getUserRole } from "../../../service/authService";
import { IoChevronBackOutline } from "react-icons/io5";
import { X, FileText } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

const CompletedVaccineReport = () => {
  const { campaign_id } = useParams();
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingRecords, setUpdatingRecords] = useState(new Set());
  const [vaccinationStatus, setVaccinationStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [downloading, setDownloading] = useState(new Set());
  const [detailedRecord, setDetailedRecord] = useState(null);

  const navigate = useNavigate();

  const fetchStudentList = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `/vaccination-campaign/${campaign_id}/registered-record`
      );
      setStudentList(res.data.data);
      setLoading(false);
      const res2 = await axiosClient.get(`/vaccination-campaign/${campaign_id}`);
      setVaccinationStatus(res2.data.data.status);
    } catch (error) {
      console.error("Error fetching student list:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaign_id) {
      fetchStudentList();
    }
  }, [campaign_id]);

  const openModal = async (record) => {
    console.log('Modal for: ', record);
    setSelectedRecord(record);
    setDiagnosis(record.description || "");
    setModalOpen(true);
    setDownloading((prev) => new Set(prev).add(`details_${record.id}`));
    try {
      const response = await axiosClient.get(`/vaccination-record/${record.record_id}`);
      console.log("Detailed record:", response.data.data);
      setDetailedRecord(response.data.data);
    } catch (error) {
      console.error("Error fetching detailed record:", error);
      enqueueSnackbar("Không thể tải chi tiết hồ sơ!", { variant: "error" });
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(`details_${record.id}`);
        return next;
      });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
    setDiagnosis("");
    setDetailedRecord(null);
  };

  const closeModalNoSubmit = () => {
    setModalOpen(false);
    setSelectedRecord(null);
    setDiagnosis("");
    setDetailedRecord(null);
    window.location.reload();
  };

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim()) {
      enqueueSnackbar("Vui lòng điền chẩn đoán!", { variant: "error" });
      return;
    }

    try {
      setUpdatingRecords((prev) => new Set([...prev, selectedRecord.record_id]));
      const response = await axiosClient.patch(`/vaccination-record/${selectedRecord.record_id}/complete`, {
        description: diagnosis,
      });
      enqueueSnackbar(selectedRecord.status === 'COMPLETED' ? "Cập nhật thành công!" : "Xác nhận tiêm chủng và chẩn đoán thành công!", { variant: "success" });
      fetchStudentList();
      closeModal();
    } catch (error) {
      console.error("Error updating vaccination record:", error);
      enqueueSnackbar("Có lỗi xảy ra khi cập nhật trạng thái tiêm chủng!", { variant: "error" });
    } finally {
      setUpdatingRecords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRecord.record_id);
        return newSet;
      });
    }
  };

  const renderDetailModal = () => {
    if (!modalOpen || !selectedRecord) return null;

    // Sử dụng detailedRecord nếu có, nếu không dùng giá trị mặc định từ selectedRecord
    const vaccineName = detailedRecord?.vaccine_name || selectedRecord.vaccine?.name || "Chưa xác định";
    const diseaseList = detailedRecord?.disease_name || selectedRecord.disease_list?.join(", ") || "Chưa xác định";
    const doseNumber = detailedRecord?.dose_number || detailedRecord?.dose_quantity || selectedRecord.dose_number || selectedRecord.dose_quantity || 1;

    return (
      <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedRecord.status === 'COMPLETED' ? "Cập nhật" : "Xác nhận"} tiêm chủng cho {selectedRecord.student_profile?.name}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {downloading.has(`details_${selectedRecord.id}`) ? (
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
                  <span className="text-gray-600">Đang tải chi tiết...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800 uppercase">
                    Thông tin học sinh
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Mã học sinh: {selectedRecord.student_id} | Họ tên: {selectedRecord.student_profile?.name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 uppercase border-b border-gray-200 pb-2 mb-4">
                      Chi tiết y tế
                    </h4>
                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-gray-800">I. Thông tin tiêm chủng</h5>
                      {[
                        { label: "Tên vaccine", value: vaccineName },
                        { label: "Danh sách bệnh", value: diseaseList },
                        // { label: "Mũi tiêm thứ mấy", value: doseNumber },
                        { label: "Ngày tiêm (nếu có)", value: selectedRecord.vaccination_date ? new Date(selectedRecord.vaccination_date).toLocaleDateString("vi-VN") : "Chưa xác định" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-start">
                          <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                          <p className="flex-1 text-sm text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 mt-6">
                      <h5 className="text-sm font-bold text-gray-800">II. Chẩn đoán & Điều trị</h5>
                      {[
                        { label: "Theo dõi sau tiêm", value: selectedRecord.description || 'Chưa có chẩn đoán' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-start">
                          <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                          <p className="flex-1 text-sm text-gray-800">{value}</p>
                          
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              // onClick={handleSubmitDiagnosis}
              onClick={() => {navigate(`/${getUserRole()}/${selectedRecord.student_id}/vaccine-info/${selectedRecord.record_id}`)}}
              className="px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Xem chi tiết
            </button>
            {selectedRecord.status === 'COMPLETED' 
              ?
              <button
                onClick={
                  closeModal
                }
                className="px-4 py-2 cursor-pointer bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                Đóng
              </button>
              :
              <button
                onClick={
                  closeModalNoSubmit
                }
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                Đóng
              </button>
            }
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Đang tải danh sách học sinh...</div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-20 bg-white relative">
      <div
        onClick={() => {
          navigate(`/${getUserRole()}/vaccine-campaign`);
        }}
        className="flex items-center justify-center absolute top-4 cursor-pointer"
      >
        <IoChevronBackOutline /> Back
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Báo cáo tiêm chủng - Chiến dịch {campaign_id}
      </h2>

      {studentList.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Không có học sinh nào đăng ký trong chiến dịch này
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  ID Học sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Tên học sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Giới tính
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Đã tiêm chủng
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentList.map((student, index) => (
                <tr
                  key={student.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      to={`/${getUserRole()}/student-overview/${student.student_id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {student.student_profile?.name || "N/A"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.student_profile?.ismale ? "Nam" : "Nữ"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      {student.status === "PENDING" &&
                        vaccinationStatus !== "COMPLETED" && (
                          <input
                            type="checkbox"
                            checked={student.status === 'COMPLETED'}
                            disabled={
                              student.status === 'COMPLETED' ||
                              updatingRecords.has(student.id)
                            }
                            className={`h-4 w-4 rounded border-gray-300 ${
                              student.status === 'COMPLETED'
                                ? "text-green-600 bg-green-50 border-green-300 cursor-not-allowed"
                                : updatingRecords.has(student.id)
                                ? "text-blue-400 cursor-not-allowed animate-pulse"
                                : "text-blue-600 focus:ring-blue-500 cursor-pointer hover:border-blue-400"
                            }`}
                            onChange={() => openModal(student)}
                            title={
                              student.status === 'COMPLETED'
                                ? "Đã tiêm chủng"
                                : "Click để xác nhận tiêm chủng"
                            }
                          />
                        )}
                      {student.status === "COMPLETED" && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Đã tiêm
                        </span>
                      )}
                      {student.status === "PENDING" &&
                        vaccinationStatus === "COMPLETED" &&
                        !student.status === 'COMPLETED' && (
                          <span className="text-xs text-red-600 font-medium">
                            ✗ Chưa tiêm
                          </span>
                        )}
                      {updatingRecords.has(student.id) && (
                        <span className="ml-2 text-xs text-blue-600">
                          Đang cập nhật...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => {
                        setSelectedRecord(student);
                        setDiagnosis(student.description || "");
                        openModal(student);
                      }}
                      disabled={!student.status === 'COMPLETED' || updatingRecords.has(student.id)}
                      className={`px-2 cursor-pointer py-1 text-sm font-medium rounded ${
                        !student.status === 'COMPLETED' || updatingRecords.has(student.id)
                          ? "text-gray-400 cursor-not-allowed bg-gray-100"
                          : "text-blue-600 hover:text-blue-800 hover:underline bg-blue-50"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-sm text-gray-600">
            Tổng số học sinh: {studentList.length}
          </div>
        </div>
      )}

      {renderDetailModal()}
    </div>
  );
};

export default CompletedVaccineReport;