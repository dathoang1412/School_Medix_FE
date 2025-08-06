import React, { useState, useEffect } from 'react';
import { FileText, Plus, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../config/axiosClient';

const VaccineAdd = () => {
  const { id } = useParams(); // Get vaccine ID for editing
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    description: '',
    dose_quantity: 0,
    disease_list: [],
  });
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch vaccine data for editing
  useEffect(() => {
    if (id) {
      const fetchVaccine = async () => {
        setLoading(true);
        try {
          const response = await axiosClient.get(`/vaccine/${id}`);
          console.log("Vaccine detail: ", response.data.data)
          const vaccineData = response.data.data[0]; // Adjust to array response
          if (vaccineData) {
            // Split diseases string into array and map to IDs
            const diseaseNames = vaccineData.diseases
              ? vaccineData.diseases.split(', ').map( name => name.trim())
              : [];
            // Fetch diseases to map names to IDs
            const diseasesResponse = await axiosClient.get('/diseases');
            const allDiseases = diseasesResponse.data.data || [];
            const diseaseIds = diseaseNames
              .map(name => {
                const disease = allDiseases.find(d => d.name === name);
                return disease ? disease.id : null;
              })
              .filter(id => id !== null);

            setFormData({
              name: vaccineData.name || '',
              origin: vaccineData.origin || '',
              description: vaccineData.description || '',
              dose_quantity: vaccineData.dose_quantity || 0,
              disease_list: diseaseIds,
            });
          } else {
            setMessage({ type: 'error', text: 'Không thể tải dữ liệu vaccine.' });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Lỗi khi tải vaccine: ' + error.message });
        } finally {
          setLoading(false);
        }
      };
      fetchVaccine();
    }
  }, [id]);

  // Fetch diseases for dropdown
  useEffect(() => {
    const fetchDiseases = async () => {
      setDiseaseLoading(true);
      try {
        const response = await axiosClient.get('/diseases');
        setDiseases(response.data.data || []);
      } catch (error) {
        setMessage({ type: 'error', text: 'Lỗi khi lấy danh sách bệnh.' });
      } finally {
        setDiseaseLoading(false);
      }
    };
    fetchDiseases();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'disease_list') {
      const selectedIds = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => parseInt(option.value));
      setFormData((prev) => ({
        ...prev,
        disease_list: selectedIds,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'dose_quantity' ? parseInt(value) || 0 : value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Tên vaccine không được để trống';
    if (!formData.origin.trim()) return 'Nguồn gốc không được để trống';
    if (!Array.isArray(formData.disease_list) || formData.disease_list.length === 0) {
      return 'Vui lòng chọn ít nhất một bệnh';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = id ? `/vaccine/${id}` : '/vaccine';
      const method = id ? 'put' : 'post';
      const response = await axiosClient[method](endpoint, formData);
      if (response.data.error) {
        setMessage({ type: 'error', text: response.data.message });
      } else {
        setMessage({
          type: 'success',
          text: id ? 'Cập nhật vaccine thành công!' : 'Tạo vaccine thành công!',
        });
        setTimeout(() => navigate('/vaccine'), 1500); // Navigate back after success
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: id
          ? 'Có lỗi xảy ra khi cập nhật vaccine. Vui lòng thử lại.'
          : 'Có lỗi xảy ra khi tạo vaccine. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {id ? 'Chỉnh sửa Vaccine' : 'Thêm Vaccine Mới'}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-md border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {message.text}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải dữ liệu vaccine...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Disease List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bệnh *
                </label>
                {diseaseLoading ? (
                  <div className="flex items-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Đang tải danh sách bệnh...</span>
                  </div>
                ) : diseases.length === 0 ? (
                  <div className="text-red-800">Không có bệnh nào được tìm thấy.</div>
                ) : (
                  <select
                    name="disease_list"
                    multiple
                    value={formData.disease_list}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 max-h-40"
                  >
                    {diseases.map((disease) => (
                      <option key={disease.id} value={disease.id}>
                        {disease.name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-1 text-xs text-gray-500">Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều bệnh.</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Vaccine *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  placeholder="Nhập tên vaccine"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  placeholder="Nhập mô tả chi tiết về vaccine"
                />
              </div>

              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nguồn Gốc *
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  placeholder="Nhập nguồn gốc vaccine"
                />
              </div>

              {/* Dose Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số Mũi Tiêm
                </label>
                <input
                  type="number"
                  name="dose_quantity"
                  value={formData.dose_quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  placeholder="Nhập số mũi tiêm (mặc định 0)"
                  min="0"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 cursor-pointer py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={loading || diseaseLoading}
                  onClick={handleSubmit}
                  className="flex cursor-pointer items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {id ? 'Cập nhật Vaccine' : 'Thêm Vaccine'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccineAdd;