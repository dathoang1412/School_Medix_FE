import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Activity, MapPin, Pill, Loader2, XCircle, Stethoscope } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { getUserRole } from '../../../service/authService';

const DetailHealthRecord = () => {
    const { student_id, record_id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userRole = getUserRole();

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa xác định';
        try {
        return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
        return 'Chưa xác định';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        setError(''); 
        try {
            const response = await axiosClient.get(`/daily-health-record/${record_id}`);
            const fetchedRecord = response.data.data;
            if (!fetchedRecord) {
                setError('Không tìm thấy hồ sơ y tế.');
                setLoading(false);
                return;
            }
            if (fetchedRecord.student_id !== student_id) {
                setError('Không tìm thấy hồ sơ y tế.');
                setLoading(false);
                setTimeout(
                    navigate(`/parent/edit/${student_id}/health-record`),
                    2000
                )
                return;
            }
            setRecord(fetchedRecord);
        } catch (error) {
            setError('Không thể tải chi tiết hồ sơ y tế.');
            console.error('Error fetching record:', error);
        } finally {
            setLoading(false);
        }
        };
        fetchData();
    }, [student_id, record_id]);

    const handleBack = () => {
        navigate(`/parent/edit/${student_id}/health-record`);
    };

    if (loading) {
        return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        </div>
        );
    }

    if (error) {
        return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
            </div>
            <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
            <FileText className="w-4 h-4" />
            Quay lại
            </button>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto">
            <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors"
            >
            <FileText className="w-5 h-5" />
            Quay lại danh sách
            </button>
            <div className="bg-white shadow-md border border-gray-300 p-6 h-230">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Hồ sơ tai nạn y tế tại trường</h1>
            </div>
            <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-800 uppercase border-b border-gray-200 pb-2 mb-4">
                            Thông tin cơ bản
                        </h4>
                        {[
                        { label: "Mã học sinh", value: record?.student_id || 'N/A' },
                        { label: "Họ tên", value: record?.name || 'N/A' },
                        ].map(({ label, value }) => (
                        <div key={label} className="flex items-start">
                            <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                            <p className="flex-1 text-sm text-gray-800">{value}</p>
                        </div>
                        ))}
                    </div>
                    {userRole === 'parent' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-medium text-gray-800 uppercase border-b border-gray-200 pb-2 mb-4">
                                Chi tiết y tế
                                </h4>
                                <div className="space-y-4">
                                    <h5 className="text-sm font-bold text-gray-800">I. Thời gian</h5>
                                    {[
                                    { label: "Ngày phát hiện", value: formatDate(record?.detect_time) },
                                    { label: "Ngày ghi nhận", value: formatDate(record?.record_date) },
                                    ].map(({ label, value }) => (
                                    <div key={label} className="flex items-start">
                                        <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                                        <p className="flex-1 text-sm text-gray-800">{value}</p>
                                    </div>
                                    ))}
                                </div>
                                <div className="space-y-4 mt-6">
                                    <h5 className="text-sm font-bold text-gray-800">II. Chẩn đoán & Điều trị</h5>
                                    {[
                                    { label: "Chẩn đoán", value: record?.diagnosis || 'Chưa có chẩn đoán' },
                                    { label: "Xử lý tại chỗ", value: record?.on_site_treatment || 'Không có' },
                                    { label: "Tình trạng", value: record?.status === 'MILD' ? "Nhẹ" : "Nặng" || 'Không đánh giá'},
                                    ].map(({ label, value }) => (
                                    <div key={label} className="flex items-start">
                                        <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                                        <p className="flex-1 text-sm text-gray-800">{value}</p>
                                    </div>
                                    ))}
                                </div>
                                <div className="mt-6 space-y-4">
                                    <h5 className="text-sm font-bold text-gray-800">III. Chuyển viện & Vật tư</h5>
                                    {[
                                        { label: "Chuyển đến", value: record?.transferred_to || 'Không chuyển viện' },
                                        { label: "Vật tư sử dụng", value: record?.items_usage || 'Không sử dụng' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-start">
                                        <label className="w-1/4 text-sm font-bold text-gray-800">{label}</label>
                                        <p className="flex-1 text-sm text-gray-800">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {error}
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    );
};

export default DetailHealthRecord;