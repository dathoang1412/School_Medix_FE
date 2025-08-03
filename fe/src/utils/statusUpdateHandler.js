import axiosClient from "../config/axiosClient";

const handleStatusUpdate = async (
  cb,
  status,
  url,
  id,
  setError,
  setDrugs,
  setFilteredDrugs,
  successMessage,
  enqueueSnackbar,
  payload = {}
) => {
  try {
    const res = await axiosClient.patch(`/send-drug-request/${id}/${url}`, payload);
    if (!res.data.error) {
      console.log("DRUG DATA:", res.data);
      const updatedFields = url === "receive" ? { status, receive_at: payload.receive_at } : { status };
      setDrugs((prev) =>
        prev.map((drug) =>
          drug.id === id ? { ...drug, ...updatedFields } : drug
        )
      );
      setFilteredDrugs((prev) =>
        prev.map((drug) =>
          drug.id === id ? { ...drug, ...updatedFields } : drug
        )
      );
      // enqueueSnackbar(successMessage, { variant: "success" });
      if (cb) cb();
    } else {
      throw new Error(res.data.message);
    }
  } catch (error) {
    console.error(`Error in ${url} drug request:`, error);
    const errorMessage = error.response?.data?.message || `Không thể thực hiện thao tác ${url}. Vui lòng thử lại.`;
    setError(errorMessage);
    enqueueSnackbar(errorMessage, { variant: "error" });
  }
};

export const handleAccept = (id, setError, setDrugs, setFilteredDrugs, cb, enqueueSnackbar) =>
  handleStatusUpdate(
    cb,
    "ACCEPTED",
    "accept",
    id,
    setError,
    setDrugs,
    setFilteredDrugs,
    "Đã chấp nhận đơn thuốc!",
    enqueueSnackbar
  );

export const handleRefuse = (id, setError, setDrugs, setFilteredDrugs, cb, enqueueSnackbar) =>
  handleStatusUpdate(
    cb,
    "REFUSED",
    "refuse",
    id,
    setError,
    setDrugs,
    setFilteredDrugs,
    "Đã từ chối đơn thuốc!",
    enqueueSnackbar
  );

export const handleCancel = (id, setError, setDrugs, setFilteredDrugs, cb, enqueueSnackbar) =>
  handleStatusUpdate(
    cb,
    "CANCELLED",
    "cancel",
    id,
    setError,
    setDrugs,
    setFilteredDrugs,
    "Đã hủy đơn thuốc!",
    enqueueSnackbar
  );

export const handleReceive = (id, setError, setDrugs, setFilteredDrugs, cb, enqueueSnackbar) =>
  handleStatusUpdate(
    cb,
    "RECEIVED",
    "receive",
    id,
    setError,
    setDrugs,
    setFilteredDrugs,
    "Đã xác nhận nhận thuốc!",
    enqueueSnackbar,
    { receive_at: new Date().toISOString() }
  );

export const handleDone = (id, setError, setDrugs, setFilteredDrugs, cb, enqueueSnackbar) =>
  handleStatusUpdate(
    cb,
    "DONE",
    "done",
    id,
    setError,
    setDrugs,
    setFilteredDrugs,
    "Đã xác nhận hoàn thành!",
    enqueueSnackbar
  );