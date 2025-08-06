import React, { useState, useEffect } from 'react';
import axiosClient from '../../../config/axiosClient';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// Function to create a disease record
const createDiseaseRecord = async (studentId, data) => {
  try {
    const response = await axiosClient.post(`/student/${studentId}/disease-record`, {
      disease_id: data.disease_id,
      diagnosis: data.diagnosis,
      detect_date: data.detect_date,
      cure_date: data.cure_date || null, // Send null if cure_date is empty
      location_cure: data.location_cure,
      transferred_to: data.transferred_to,
      status: data.status
    });
    if (response.data.error) {
      throw new Error(response.data.message || 'Không thể thêm hồ sơ bệnh');
    }
    return {
      success: true,
      message: response.data.message || 'Thêm hồ sơ bệnh thành công',
      data: response.data.data
    };
  } catch (error) {
    console.error('Error creating disease record:', error);
    return {
      success: false,
      message: error.message || 'Lỗi server khi thêm hồ sơ bệnh'
    };
  }
};

// Function to update a disease record
const updateDiseaseRecord = async (id, data) => {
  try {
    const response = await axiosClient.patch(`admin/student/${id}/disease-record`, {
      diagnosis: data.diagnosis,
      detect_date: data.detect_date,
      cure_date: data.cure_date || null, // Send null if cure_date is empty
      location_cure: data.location_cure,
      transferred_to: data.transferred_to,
      status: data.status
    });
    if (response.data.error) {
      throw new Error(response.data.message || 'Không thể cập nhật hồ sơ bệnh');
    }
    return {
      success: true,
      message: response.data.message || 'Cập nhật hồ sơ bệnh thành công',
      data: response.data.data
    };
  } catch (error) {
    console.error('Error updating disease record:', error);
    return {
      success: false,
      message: error.message || 'Lỗi server khi cập nhật hồ sơ bệnh'
    };
  }
};

const AddDiseaseRecord = ({ onClose }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get disease record ID from URL for edit mode
  const isEditMode = !!id; // Determine if in edit mode
  const [formData, setFormData] = useState({
    student_id: '',
    disease_id: '',
    diagnosis: '',
    detect_date: '',
    cure_date: '',
    location_cure: '',
    transferred_to: '',
    status: ''
  });
  const [diseases, setDiseases] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState(null); // For cure_date warning

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axiosClient.get('/class');
        setClasses(response.data.data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Lỗi server khi tải danh sách lớp: ' + error.message);
      }
    };
    fetchClasses();
  }, []);

  // Fetch disease record and student class for edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchDiseaseRecordAndClass = async () => {
        try {
          // Fetch disease record
          const response = await axiosClient.get(`/disease-record/${id}`);
          if (response.data.error || !response.data.data[0]) {
            setError('Không tìm thấy hồ sơ bệnh');
            return;
          }
          const record = response.data.data[0];
          setFormData({
            student_id: record.student_id,
            disease_id: record.disease_id,
            diagnosis: record.diagnosis || '',
            detect_date: record.detect_date ? record.detect_date.split('T')[0] : '',
            cure_date: record.cure_date ? record.cure_date.split('T')[0] : '',
            location_cure: record.location_cure || '',
            transferred_to: record.transferred_to || '',
            status: record.status || ''
          });
          setSelectedStudent(record.student_id);

          // Fetch class ID for the student
          try {
            const classResponse = await axiosClient.get(`/student/${record.student_id}/class`);
            if (classResponse.data.error || !classResponse.data.data) {
              setError('Không tìm thấy thông tin lớp của học sinh');
              return;
            }
            const classId = classResponse.data.data.id;
            setSelectedClass(classId);

            // Fetch students for the class to populate the student dropdown
            try {
              const studentsResponse = await axiosClient.get(`/students/${classId}`);
              if (studentsResponse.data.error || !studentsResponse.data.data) {
                setError('Không tìm thấy danh sách học sinh trong lớp');
                return;
              }
              setStudents(studentsResponse.data.data);
              setSelectedStudent(record.student_id); // Ensure student is pre-selected
            } catch (error) {
              console.error('Error fetching students:', error);
              setError('Lỗi server khi tải danh sách học sinh: ' + error.message);
            }
          } catch (error) {
            console.error('Error fetching student class:', error);
            setError('Lỗi server khi tải thông tin lớp của học sinh: ' + error.message);
          }
        } catch (error) {
          console.error('Error fetching disease record:', error);
          setError('Lỗi server khi tải hồ sơ bệnh: ' + error.message);
        }
      };
      fetchDiseaseRecordAndClass();
    }
  }, [id, isEditMode]);

  // Fetch students when class is selected (for add mode)
  useEffect(() => {
    if (selectedClass && !isEditMode) {
      const fetchStudents = async () => {
        try {
          const response = await axiosClient.get(`/students/${selectedClass}`);
          setStudents(response.data.data || []);
          setSelectedStudent(''); // Reset student selection in add mode
          setFormData(prev => ({ ...prev, student_id: '' }));
        } catch (error) {
          console.error('Error fetching students:', error);
          setError('Lỗi server khi tải danh sách học sinh: ' + error.message);
        }
      };
      fetchStudents();
    } else if (!isEditMode) {
      setStudents([]);
      setSelectedStudent('');
      setFormData(prev => ({ ...prev, student_id: '' }));
    }
  }, [selectedClass, isEditMode]);

  // Fetch available diseases
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await axiosClient.get('/diseases');
        if (response.data.data && response.data.data.length > 0) {
          setDiseases(response.data.data);
        } else {
          setError('Không thể tải danh sách bệnh: Không có dữ liệu');
        }
      } catch (err) {
        setError('Lỗi server khi tải danh sách bệnh: ' + err.message);
      }
    };
    fetchDiseases();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'status' && value !== 'RECOVERED') {
      setFormData(prev => ({ ...prev, cure_date: '' })); // Clear cure_date if status is not RECOVERED
      setWarning(null); // Clear warning when status changes
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    setFormData(prev => ({ ...prev, student_id: studentId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.disease_id || !formData.detect_date) {
      setError('Vui lòng điền đầy đủ mã học sinh, mã bệnh và ngày phát hiện');
      return;
    }
    if (formData.status === 'RECOVERED' && !formData.cure_date) {
      setWarning('Vui lòng nhập ngày hồi phục khi trạng thái là "Đã khỏi"');
      return;
    }
    try {
      let result;
      if (isEditMode) {
        result = await updateDiseaseRecord(id, formData);
      } else {
        result = await createDiseaseRecord(formData.student_id, formData);
      }

      if (result.success) {
        setSuccess(result.message);
        setFormData({
          student_id: '',
          disease_id: '',
          diagnosis: '',
          detect_date: '',
          cure_date: '',
          location_cure: '',
          transferred_to: '',
          status: ''
        });
        setSelectedClass('');
        setSelectedStudent('');
        setWarning(null);
        setTimeout(onClose, 2000); // Close after 2 seconds
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Lỗi server khi ' + (isEditMode ? 'cập nhật' : 'thêm') + ' hồ sơ bệnh: ' + err.message);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Cập Nhật Hồ Sơ Bệnh' : 'Thêm Hồ Sơ Bệnh'}
            </h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Warning Message */}
        {warning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-500" />
            <p className="text-sm text-yellow-700">{warning}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Class and Student Selection Form */}
        <form className="bg-white rounded-lg shadow-md p-8 space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Lớp <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
                disabled={isEditMode} // Disable class selection in edit mode
              >
                <option value="">Chọn lớp</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Học Sinh <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudent}
                onChange={handleStudentChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
                disabled={isEditMode || !selectedClass} // Disable in edit mode or if no class selected
              >
                <option value="">Chọn học sinh</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã Học Sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="Mã học sinh sẽ tự động điền"
                readOnly
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Bệnh <span className="text-red-500">*</span>
              </label>
              <select
                name="disease_id"
                value={formData.disease_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
                disabled={isEditMode} // Disable disease selection in edit mode
              >
                <option value="">Chọn bệnh</option>
                {diseases.map((disease) => (
                  <option key={disease.id} value={disease.id}>
                    {disease.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chẩn Đoán</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                placeholder="Mô tả chi tiết chẩn đoán (nếu có)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Phát Hiện <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="detect_date"
                value={formData.detect_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>
            {formData.status === 'RECOVERED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Hồi Phục <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="cure_date"
                  value={formData.cure_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nơi Điều Trị</label>
              <input
                type="text"
                name="location_cure"
                value={formData.location_cure}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="Nhập nơi điều trị (nếu có)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chuyển Đến</label>
              <input
                type="text"
                name="transferred_to"
                value={formData.transferred_to}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="Tên bệnh viện hoặc phòng khám (nếu có chuyển viện)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình Trạng <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
              >
                <option value="">Chọn trạng thái</option>
                <option value="UNDER_TREATMENT">Đang điều trị</option>
                <option value="RECOVERED">Đã khỏi</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/disease')}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 cursor-pointer py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {isEditMode ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiseaseRecord;