import { useState } from 'react';
import TabHeader from '../../components/TabHeader';

const SendDrugForm = () => {
  const [formData, setFormData] = useState({
    diseaseName: '',
    receiveDate: '',
    prescription_file_url: null,
    drugMethod: '',
    intakeDate: '',
    addDrug: '',
    note: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    alert('Đơn thuốc đã được gửi thành công!');
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Đơn dặn thuốc cho học sinh</h1>
          <p className="text-blue-100 text-lg">Vui lòng điền đầy đủ thông tin bên dưới</p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="space-y-8">
            {/* Thông tin bệnh */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-500 inline-block">
                Thông tin bệnh
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="diseaseName" className="block text-sm font-medium text-gray-700">
                    Chuẩn đoán bệnh: <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="diseaseName" 
                    name="diseaseName" 
                    required 
                    value={formData.diseaseName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    placeholder="Nhập chuẩn đoán bệnh..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="receiveDate" className="block text-sm font-medium text-gray-700">
                    Ngày nhận thuốc: <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    id="receiveDate" 
                    name="receiveDate" 
                    required 
                    value={formData.receiveDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Chi tiết thuốc */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-500 inline-block">
                Chi tiết thuốc
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="prescription_file_url" className="block text-sm font-medium text-gray-700">
                    File đơn thuốc: <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <input 
                      type="file" 
                      id="prescription_file_url" 
                      name="prescription_file_url" 
                      required 
                      onChange={handleInputChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-gray-500 text-sm mt-2">Chọn file PDF, JPG hoặc PNG</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="drugMethod" className="block text-sm font-medium text-gray-700">
                      Cách dùng và liều lượng: <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="drugMethod" 
                      name="drugMethod" 
                      required 
                      value={formData.drugMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="VD: Uống 1 viên sau ăn, ngày 2 lần"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="intakeDate" className="block text-sm font-medium text-gray-700">
                      Thời điểm uống thuốc: <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      id="intakeDate" 
                      name="intakeDate" 
                      required 
                      value={formData.intakeDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="addDrug" className="block text-sm font-medium text-gray-700">
                    Thêm thuốc:
                  </label>
                  <textarea 
                    id="addDrug" 
                    name="addDrug" 
                    rows="4"
                    value={formData.addDrug}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-vertical"
                    placeholder="Thông tin thuốc bổ sung (nếu có)..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Ghi chú:
                  </label>
                  <textarea 
                    id="note" 
                    name="note" 
                    rows="3"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-vertical"
                    placeholder="Ghi chú thêm (nếu có)..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button 
                type="submit" 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Gửi đơn thuốc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default SendDrugForm