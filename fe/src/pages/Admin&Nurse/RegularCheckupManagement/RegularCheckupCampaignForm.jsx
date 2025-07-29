import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, FileText, Plus, Check, ArrowLeft, Save } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { formatDate } from '../../../utils/campaignUtils';
import { enqueueSnackbar } from 'notistack';

const RegularCheckupCampaignForm = () => {
  const navigate = useNavigate();
  const { campaign_id } = useParams();
  const isEditMode = !!campaign_id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    specialist_exam_ids: [],
  });
  const [originalFormData, setOriginalFormData] = useState(null); // Store original data for reset in edit mode
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [specialistExams, setSpecialistExams] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Fetch specialist exams
  useEffect(() => {
    const fetchSpecialistExams = async () => {
      setExamLoading(true);
      try {
        const response = await axiosClient.get('/special-exam');
        if (response.data.error) {
          setExamError(response.data.message);
          enqueueSnackbar(response.data.message, { variant: 'error' });
        } else {
          setSpecialistExams(response.data.data);
        }
      } catch (error) {
        setExamError('Lỗi khi lấy danh sách loại khám chuyên khoa.');
        enqueueSnackbar('Lỗi khi lấy danh sách loại khám chuyên khoa.', { variant: 'error' });
      } finally {
        setExamLoading(false);
      }
    };

    fetchSpecialistExams();
  }, []);

  // Fetch campaign data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCampaign = async () => {
        setFetchLoading(true);
        try {
          const response = await axiosClient.get(`/checkup-campaign-detail/${campaign_id}`);
          if (response.data.error) {
            setFetchError(response.data.message);
            enqueueSnackbar(response.data.message, { variant: 'error' });
          } else {
            const campaign = response.data.data;
            const campaignData = {
              name: campaign.campaign_name,
              description: campaign.campaign_des,
              location: campaign.campaign_location,
              start_date: campaign.start_date.split('T')[0], // Convert to YYYY-MM-DD
              end_date: campaign.end_date.split('T')[0],
              specialist_exam_ids: campaign.specialist_exams?.map(exam => exam.id) || [],
            };
            setFormData(campaignData);
            setOriginalFormData(campaignData); // Store for reset
          }
        } catch (error) {
          setFetchError('Lỗi khi lấy thông tin chiến dịch.');
          enqueueSnackbar('Lỗi khi lấy thông tin chiến dịch.', { variant: 'error' });
        } finally {
          setFetchLoading(false);
        }
      };
      fetchCampaign();
    }
  }, [campaign_id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExamToggle = (examId) => {
    setFormData(prev => ({
      ...prev,
      specialist_exam_ids: prev.specialist_exam_ids.includes(examId)
        ? prev.specialist_exam_ids.filter(id => id !== examId)
        : [...prev.specialist_exam_ids, examId],
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Tên chiến dịch không được để trống";
    if (!formData.description.trim()) return "Mô tả không được để trống";
    if (!formData.location.trim()) return "Địa điểm không được để trống";
    if (!formData.start_date) return "Ngày bắt đầu không được để trống";
    if (!formData.end_date) return "Ngày kết thúc không được để trống";
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      return "Ngày kết thúc phải sau ngày bắt đầu";
    }
    // if (formData.specialist_exam_ids.length === 0) {
    //   return "Vui lòng chọn ít nhất một loại khám chuyên khoa";
    // }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      enqueueSnackbar(validationError, { variant: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = isEditMode ? `/checkup/${campaign_id}/update-info` : '/checkup-campaign';
      const method = isEditMode ? axiosClient.put : axiosClient.post;
      const response = await method(endpoint, formData);

      if (response.data.error) {
        setMessage({ type: 'error', text: response.data.message });
        enqueueSnackbar(response.data.message, { variant: 'error' });
      } else {
        setMessage({
          type: 'success',
          text: isEditMode ? 'Cập nhật chiến dịch thành công!' : 'Tạo chiến dịch khám sức khỏe thành công!',
        });
        enqueueSnackbar(isEditMode ? 'Cập nhật chiến dịch thành công!' : 'Tạo chiến dịch thành công!', { variant: 'success' });
        navigate('/admin/regular-checkup');
      }
    } catch (error) {
      const errorMsg = isEditMode
        ? 'Có lỗi xảy ra khi cập nhật chiến dịch. Vui lòng thử lại.'
        : 'Có lỗi xảy ra khi tạo chiến dịch. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errorMsg });
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải thông tin chiến dịch...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-700">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {fetchError}
          </div>
        </div>
        <button
          type="button"
          className="px-4 cursor-pointer py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          onClick={() => navigate('/admin/regular-checkup')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay Lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <button
          type="button"
          className="mb-4 px-4 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          onClick={() => navigate('/admin/regular-checkup')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay Lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Chỉnh Sửa Chiến Dịch Khám Sức Khỏe' : 'Tạo Chiến Dịch Khám Sức Khỏe'}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? 'Chỉnh sửa thông tin chiến dịch khám sức khỏe định kỳ cho học sinh'
            : 'Tạo chiến dịch khám sức khỏe định kỳ cho học sinh'}
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <FileText className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {examError && (
        <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-700">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {examError}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Thông Tin Cơ Bản
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Chiến Dịch *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên chiến dịch khám sức khỏe"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Địa Điểm *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập địa điểm tổ chức"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô Tả *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mô tả chi tiết về chiến dịch khám sức khỏe"
            />
          </div>
        </div>

        {/* Date Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Thời Gian Tổ Chức
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Bắt Đầu *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.start_date && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(formData.start_date)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Kết Thúc *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.end_date && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(formData.end_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Specialist Exams */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Loại Khám Chuyên Khoa *
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Chọn các loại khám chuyên khoa sẽ được thực hiện trong chiến dịch này
          </p>

          {examLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải danh sách loại khám...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialistExams.map((exam) => (
                <div
                  key={exam.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.specialist_exam_ids.includes(exam.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleExamToggle(exam.id)}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                      formData.specialist_exam_ids.includes(exam.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.specialist_exam_ids.includes(exam.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {exam.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {exam.description || 'Không có mô tả'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.specialist_exam_ids.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Đã chọn {formData.specialist_exam_ids.length} loại khám chuyên khoa
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 cursor-pointer border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => {
              if (isEditMode && originalFormData) {
                setFormData(originalFormData); // Revert to original data in edit mode
              } else {
                setFormData({
                  name: '',
                  description: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  specialist_exam_ids: [],
                });
              }
              setMessage({ type: '', text: '' });
            }}
          >
            {!isEditMode ? 'Hủy' : 'Đặt Lại'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? 'Đang Cập Nhật...' : 'Đang Tạo...'}
              </>
            ) : (
              <>
                {isEditMode ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {isEditMode ? 'Cập Nhật Chiến Dịch' : 'Tạo Chiến Dịch'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegularCheckupCampaignForm;