import React, { useState, useEffect } from "react";
import axiosClient from "../../config/axiosClient";

const VaccineAdd = ({ vaccine, onClose }) => {
  const [name, setName] = useState(vaccine?.name || "");
  const [description, setDescription] = useState(vaccine?.description || "");
  const [diseases, setDiseases] = useState([]);
  const [diseaseSelected, setDiseaseSelected] = useState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await axiosClient.get("/diseases");
        setDiseases(response.data || []); // Expecting [{ id, name }, ...]
      } catch (err) {
        {err && setError("Không thể tải danh sách bệnh")};
      }
    };
    fetchDiseases();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (vaccine) {
        // Update only name and description due to backend limitation
        await axiosClient.patch(`/vaccine/${vaccine.id}`, { name, description });
      } else {
        // Create new vaccine with disease_list
        await axiosClient.post("/vaccine", { name, description });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu vaccine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6">
        {vaccine ? "Sửa Vaccine" : "Thêm Vaccine Mới"}
      </h2>
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Tên vaccine</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
              placeholder="Nhập tên vaccine"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
              placeholder="Nhập mô tả vaccine"
              rows="4"
              required
            ></textarea>
          </div>
          {!vaccine && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Bệnh liên quan</label>
              <select
                value={diseaseSelected}
                onChange={(e) => setDiseaseSelected(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
                required
              >
                {diseases.map((disease) => (
                  <option key={disease.id} value={disease.id}>
                    {disease.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Giữ Ctrl để chọn nhiều bệnh</p>
            </div>
          )}
          {vaccine && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Bệnh liên quan</label>
              <p className="text-slate-700">{vaccine.disease_name || "Không có bệnh liên quan"}</p>
              <p className="text-xs text-slate-500 mt-1">Không thể chỉnh sửa bệnh liên quan</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Đang lưu..." : vaccine ? "Cập nhật" : "Thêm mới"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default VaccineAdd;