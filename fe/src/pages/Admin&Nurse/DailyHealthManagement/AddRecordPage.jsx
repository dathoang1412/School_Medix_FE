import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, X } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getUserRole } from '../../../service/authService';

const AddRecordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    detect_time: '',
    diagnosis: '',
    on_site_treatment: '',
    transferred_to: '',
    medical_items: [], // Changed to array to store items
    status: ''
  });
  const [error, setError] = useState('');
  const [items, setItems] = useState([]); // Array to store selected items
  const [availableItems, setAvailableItems] = useState([]); // Fetch from DB
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [classes, setClasses] = useState([]); // List of classes
  const [selectedClass, setSelectedClass] = useState(''); // Selected class
  const [students, setStudents] = useState([]); // List of students in selected class
  const [selectedStudent, setSelectedStudent] = useState(''); // Selected student

  // Fetch available classes from database
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axiosClient.get('/class');
        setClasses(response.data.data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const response = await axiosClient.get(`/students/${selectedClass}`);
          setStudents(response.data.data || []);
          setSelectedStudent(''); // Reset selected student when class changes
          setFormData(prev => ({ ...prev, student_id: '' })); // Reset student_id
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudent('');
      setFormData(prev => ({ ...prev, student_id: '' }));
    }
  }, [selectedClass]);

  // Fetch available items from database
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosClient.get('/medical-item');
        setAvailableItems(response.data.data || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Update student_id when student is selected
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    setFormData(prev => ({ ...prev, student_id: studentId }));
  };

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle item selection and quantity change
  const handleItemChange = (e) => {
    const itemId = e.target.value;
    setSelectedItem(itemId);
    const item = availableItems.find(i => i.id === parseInt(itemId));
    if (item) {
      setQuantity(item.quantity > 0 ? item.quantity : 0);
    }
  };

  const handleQuantityChange = (e) => {
    const selectedItemObj = availableItems.find(i => i.id === parseInt(selectedItem));
    const maxQuantity = selectedItemObj ? selectedItemObj.quantity : 0;
    const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), maxQuantity);
    setQuantity(value);
  };

  // Handle adding item to items array and update availableItems
  const handleAddItem = () => {
    if (!selectedItem || quantity <= 0) {
      setError('Vui lòng chọn vật tư và nhập số lượng hợp lệ.');
      return;
    }
    const item = availableItems.find(i => i.id === parseInt(selectedItem));
    if (!item) return;

    // Check if item already exists in items array
    const existingItemIndex = items.findIndex(i => i.id === item.id);
    let updatedItems;
    
    if (existingItemIndex !== -1) {
      // Item exists, update its quantity
      updatedItems = items.map((i, index) =>
        index === existingItemIndex
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      // Item doesn't exist, create new entry
      const newItem = {
        id: item.id,
        name: item.name,
        quantity: quantity,
        unit: item.unit
      };
      updatedItems = [...items, newItem];
    }

    // Update availableItems by reducing the quantity
    const updatedAvailableItems = availableItems.map(i =>
      i.id === parseInt(selectedItem) ? { ...i, quantity: i.quantity - quantity } : i
    );
    setAvailableItems(updatedAvailableItems);

    // Update items array
    setItems(updatedItems);
    setSelectedItem('');
    setQuantity(0);
    setError('');
  };

  // Handle removing item from items array and restore quantity in availableItems
  const handleRemoveItem = (index) => {
    const removedItem = items[index];
    setItems(items.filter((_, i) => i !== index));

    // Restore quantity in availableItems
    const updatedAvailableItems = availableItems.map(i =>
      i.id === removedItem.id ? { ...i, quantity: i.quantity + removedItem.quantity } : i
    );
    setAvailableItems(updatedAvailableItems);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.detect_time) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc: Học Sinh và Ngày Phát Hiện.');
      return;
    }
    try {
      const payload = {
        ...formData,
        detect_time: formatDateForAPI(formData.detect_time),
        medical_items: items // Send items array to API
      };
      console.log("Health record POST: ", payload);
      await axiosClient.post('/daily-health-record', payload);
      navigate('/' + getUserRole() + '/daily-health', { state: { success: 'Hồ sơ y tế đã được tạo thành công!' } });
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể tạo hồ sơ y tế');
      console.error(error);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(`/${getUserRole()}/daily-health`);
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
            <h1 className="text-2xl font-bold text-gray-900">Thêm Hồ Sơ Y Tế Mới</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* New Form for Class and Student Selection */}
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
                disabled={!selectedClass}
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

        {/* Existing Form */}
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
                Ngày Phát Hiện <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="detect_time"
                value={formData.detect_time}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>
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
              Tình Trạng <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              <option value="">Chọn tình trạng</option>
              <option value="MILD">Nhẹ</option>
              <option value="SERIOUS">Nghiêm trọng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xử Lý Tại Chỗ</label>
            <textarea
              name="on_site_treatment"
              value={formData.on_site_treatment}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
              placeholder="Mô tả cách xử lý tại chỗ (nếu có)"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Vật Tư Sử Dụng</label>
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <select
                  value={selectedItem}
                  onChange={handleItemChange}
                  className="w-1/2 px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="">Chọn vật tư</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Còn: {item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={0}
                    max={availableItems.find(i => i.id === parseInt(selectedItem))?.quantity || 0}
                    className="w-20 px-2 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Số lượng"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Thêm
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-md p-2 bg-gray-50 min-h-[100px]">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1 border-b border-gray-300 last:border-b-0">
                    <span className="text-sm text-gray-800">{`${item.name} - ${item.quantity} ${item.unit}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 cursor-pointer py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Lưu Hồ Sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordPage;