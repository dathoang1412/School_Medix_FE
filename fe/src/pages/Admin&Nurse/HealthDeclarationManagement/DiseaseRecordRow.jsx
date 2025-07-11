import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, AlertCircle, User, Pill, MapPin } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import RefuseModal from './RefuseModal';

const DiseaseRecordRow = ({ record, diseaseMap, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
  const [error, setError] = useState('');

  const formatDate = date => date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa xác định';
  const getStudentDisplay = id => `${String(id).padStart(6, '0')}`;

  const getBadge = (type, value) => {
    const config = {
      pending: {
        PENDING: { style: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock className="w-4 h-4" />, label: 'Đang chờ duyệt' },
        DONE: { style: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Đã duyệt' },
        CANCELLED: { style: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-4 h-4" />, label: 'Đã hủy' }
      },
      status: {
        UNDER_TREATMENT: { style: 'text-amber-700 border-amber-200', icon: <Clock className="w-4 h-4" />, label: 'Đang điều trị' },
        RECOVERED: { style: ' text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Đã khỏi' }
      }
    };
    const { style, icon, label } = config[type][value] || { style: 'bg-gray-50 text-gray-700 border-gray-200', icon: <AlertCircle className="w-4 h-4" />, label: 'Không xác định' };
    return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${style}`}>{icon}{label}</span>;
  };

  const handleAccept = async () => {
    try {
      const response = await axiosClient.patch(`/disease-record/${record.id}/accept`);
      console.log('Accept response:', response.status, response.data);
      if (response.data.error) {
        throw new Error(response.data.message || 'API returned an error');
      }
      setError('');
      onUpdate();
    } catch (err) {
      console.error('Accept error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setError('Không thể duyệt đơn: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
    }
  };

  const handleRefuse = async reason => {
    try {
      const response = await axiosClient.patch(`/disease-record/${record.id}/refuse`, { reason_by_nurse: reason });
      console.log('Refuse response:', response.status, response.data);
      if (response.data.error) {
        throw new Error(response.data.message || 'API returned an error');
      }
      setError('');
      onUpdate();
      setIsRefuseModalOpen(false);
    } catch (err) {
      console.error('Refuse error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setError('Không thể từ chối đơn: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
    }
  };

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="p-4 text-sm text-gray-700">{formatDate(record.created_at)}</td>
        <td className="p-4 text-sm text-gray-800 font-medium">{getStudentDisplay(record.student_id)}</td>
        <td className="p-4 text-sm text-gray-800 font-medium">{diseaseMap[record.disease_id] || 'Không xác định'}</td>
        <td className="p-4">{getBadge('status', record.status)}</td>
        <td className="p-4">{getBadge('pending', record.pending)}</td>
        <td className="p-4 text-center">
          <div className="flex items-center gap-2 justify-center">
            {record.pending === 'PENDING' && (
              <>
                <button
                  onClick={handleAccept}
                  className="px-3 py-1 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                >
                  Duyệt
                </button>
                <button
                  onClick={() => setIsRefuseModalOpen(true)}
                  className="px-3 py-1 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                >
                  Từ chối
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 px-3 py-1 text-blue-600 border border-gray-300 rounded-lg hover:bg-blue-50 text-sm"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Ẩn' : 'Xem'}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan="6" className="p-6 border-t border-gray-200">
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-blue-600" />Thông tin cơ bản</h4>
                <p><span className="font-medium">Họ và tên:</span> {record.student_name || 'Không xác định'}</p>
                <p><span className="font-medium">Ngày phát hiện:</span> {formatDate(record.detect_date)}</p>
                <p><span className="font-medium">Ngày tạo:</span> {formatDate(record.created_at)}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><Pill className="w-4 h-4 text-green-600" />Thông tin bệnh</h4>
                <p><span className="font-medium">Tên bệnh:</span> {diseaseMap[record.disease_id] || 'Không xác định'}</p>
                <p><span className="font-medium">Chẩn đoán:</span> {record.diagnosis || 'Chưa có chẩn đoán'}</p>
                <p><span className="font-medium">Trạng thái sức khỏe:</span> {getBadge('status', record.status)}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" />Điều trị & Trạng thái đơn</h4>
                <p><span className="font-medium">Ngày khỏi:</span> {formatDate(record.cure_date)}</p>
                <p><span className="font-medium">Nơi điều trị:</span> {record.location_cure || 'Không có'}</p>
                <p><span className="font-medium">Chuyển đến:</span> {record.transferred_to || 'Không chuyển viện'}</p>
              </div>
              {record.reason_by_nurse && <div>
                <h4 className="font-semibold flex items-center gap-2 text-red-700">Đơn đã bị hủy: </h4>
                <p>{record.reason_by_nurse || 'Không có ghi chú'}</p>
              </div>}
            </div>
          </td>
        </tr>
      )}
      <RefuseModal
        isOpen={isRefuseModalOpen}
        onClose={() => setIsRefuseModalOpen(false)}
        onSubmit={handleRefuse}
      />
    </>
  );
};

export default DiseaseRecordRow;