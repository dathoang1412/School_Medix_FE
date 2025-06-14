import { useState, useEffect } from "react";
import axiosClient from "../../config/axiosClient";
import { getUser } from "../../service/authService";
import { getChildClass } from "../../service/childenService";
import {
  handleAccept,
  handleRefuse,
  handleCancel,
  handleReceive,
  handleDone,
} from "../../utils/statusUpdateHandler";
import { useSnackbar } from "notistack";

const useSendDrugManagement = () => {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [error, setError] = useState(null);
  const [currChild, setCurrChild] = useState({});
  const [childClass, setChildClass] = useState(null);
  const enqueueSnackbar = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    const fetchDrugHistory = async () => {
      try {
        setError(null);
        const user = getUser();
        if (!user?.id) {
          setError("Vui lòng đăng nhập để xem lịch sử gửi thuốc");
          return;
        }
        const selectedChild = localStorage.getItem("selectedChild");
        if (!selectedChild) {
          setError("Vui lòng chọn một đứa trẻ để xem lịch sử gửi thuốc.");
          return;
        }
        const child = JSON.parse(selectedChild);
        setCurrChild(child);
        const [clas, res] = await Promise.all([
          getChildClass(child?.class_id),
          axiosClient.get(`/student/${child.id}/send-drug-request`),
        ]);
        setChildClass(clas || "Chưa có thông tin");
        const drugData = res.data.data || [];
        setDrugs(drugData);
        setFilteredDrugs(drugData);
      } catch (error) {
        console.error("Error fetching drug history or class:", error);
        setError("Không thể tải lịch sử gửi thuốc. Vui lòng thử lại sau.");
      }
    };
    fetchDrugHistory();
  }, []);

  useEffect(() => {
    let result = [...drugs];
    if (statusFilter === "Tất cả trạng thái") {
      result = result.map((drug) => drug);
    } else {
      result = result.filter((drug) => drug.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter((drug) =>
        drug.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredDrugs(result);
  }, [searchTerm, statusFilter, drugs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleView = (drug) => {
    alert(`Xem chi tiết đơn thuốc ${drug.id}`);
    //* Thêm logic xem chi tiết (ví dụ: mở modal hoặc redirect)*
  };


  return {
    drugs,
    filteredDrugs,
    searchTerm,
    statusFilter,
    error,
    currChild,
    childClass,
    handleSearch,
    handleFilterChange,
    handleView,
    handleAccept: (id) =>
      handleAccept(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleRefuse: (id) =>
      handleRefuse(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleCancel: (id) =>
      handleCancel(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleReceive: (id) =>
      handleReceive(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
    handleDone: (id) =>
      handleDone(id, setError, setDrugs, setFilteredDrugs, () => {}, enqueueSnackbar),
  };
};

export default useSendDrugManagement;