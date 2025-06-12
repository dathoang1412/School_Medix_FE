import axiosClient from "../config/axiosClient";
import { useNavigate } from "react-router-dom";
import { getUser } from "./authService";

export const submitDrugRequest = async (formData, currChild, setError, setIsLoading) => {
  const navigate = useNavigate();
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
  formDataToSend.append("receive_date", formData.receiveDate);
  formDataToSend.append("intake_date", formData.intakeDate);
  formDataToSend.append("note", formData.note);
  if (formData.prescriptionFile) {
    formDataToSend.append("prescription_file", formData.prescriptionFile);
  }
  formData.requestItems.forEach((item, index) => {
    formDataToSend.append(`request_items[${index}][name]`, item.name);
    formDataToSend.append(`request_items[${index}][intake_template_time]`, JSON.stringify(item.intakeTemplateTime));
    formDataToSend.append(`request_items[${index}][dosage_usage]`, item.dosageUsage);
  });

  try {
    const response = await axiosClient.post("http://localhost:3000/api/send-drug-request", formDataToSend, {
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