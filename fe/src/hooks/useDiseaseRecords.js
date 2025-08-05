import { useState, useEffect, useMemo } from "react";
import axiosClient from "../config/axiosClient";

const useDiseaseRecords = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả bệnh");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        if (!categoryFilter) {
          setRecords([]);
          setLoading(false);
          return;
        }
        let endpoint;
        switch (categoryFilter) {
          case "Bệnh truyền nhiễm":
            endpoint = "/infectious-record";
            break;
          case "Bệnh mãn tính":
            endpoint = "/chronic-record";
            break;
          case "Tất cả bệnh":
            endpoint = "/disease-record";
        }
        const response = await axiosClient.get(endpoint);
        console.log("Disease record list: ",response.data.data);
        if (response.data.error === false || response.data.data) {
          setRecords(response.data.data || []);
        } else {
          setError(
            "Không thể tải hồ sơ: " +
              (response.data.message || "Lỗi không xác định")
          );
        }
      } catch (err) {
        setError("Lỗi server: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [categoryFilter]);

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          searchTerm === "" ||
          record.student_id.toString().includes(searchTerm) ||
          record.disease_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [records, searchTerm]
  );

  return {
    records: filteredRecords,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    loading,
    error,
  };
};

export default useDiseaseRecords;
