import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Loader2, User, Activity, FileText, List, Shield, Heart, Syringe, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProfile from '../Parent/StudentProfile/StudentProfile';
import HealthDashboard from '../Parent/RegularCheckup/HealthDashboard';
import CheckupHistoryInfo from '../Parent/RegularCheckup/CheckupHistoryInfo';
import HealthRecordList from '../Parent/HealthRecord/HealthRecordList';
import HealthDeclarationHistory from '../Parent/Declare/HealthDeclarationHistory';
import HealthRecord from '../Parent/DailyHealth/HealthRecord';
import VaccineRecordInfo from '../Parent/VaccineCampaign/VaccineRecordInfo';
import { getSession } from '../../config/Supabase';
import { getStudentInfo } from '../../service/childenService';

const StudentOverview = () => {
  const { student_id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('profile');
  const [studentData, setStudentData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication and data fetching
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await getSession();
        if (error || !data.session) {
          enqueueSnackbar('Vui lòng đăng nhập để tiếp tục!', { variant: 'error' });
          navigate('/login');
          return;
        }
        setIsAuthenticated(true);

        const student = await getStudentInfo(student_id);
        setStudentData(student);
      } catch (error) {
        enqueueSnackbar('Không tải được dữ liệu: ' + error.message, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [student_id, navigate, enqueueSnackbar]);

  // Tab configuration with icons
  const tabs = [
    { 
      id: 'profile', 
      label: 'Hồ sơ', 
      icon: User,
      component: <StudentProfile studentData={studentData} />,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    { 
      id: 'dashboard', 
      label: 'Biểu đồ', 
      icon: Activity,
      component: <HealthDashboard studentData={studentData} />,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    { 
      id: 'checkupHistory', 
      label: 'Khám định kỳ', 
      icon: FileText,
      component: <CheckupHistoryInfo studentData={studentData} />,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    { 
      id: 'recordList', 
      label: 'Danh sách bệnh', 
      icon: List,
      component: <HealthRecordList student_id={student_id}/>,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    { 
      id: 'declarationHistory', 
      label: 'Lịch sử khai báo bệnh', 
      icon: Shield,
      component: <HealthDeclarationHistory studentData={studentData} />,
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    { 
      id: 'healthRecord', 
      label: 'Sức khỏe hằng ngày', 
      icon: Heart,
      component: <HealthRecord studentData={studentData} />,
      color: 'bg-pink-50 text-pink-600 border-pink-200'
    },
    { 
      id: 'vaccineRecord', 
      label: 'Tiêm chủng', 
      icon: Syringe,
      component: <VaccineRecordInfo />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
  ];

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-100 mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu học sinh...</p>
          <p className="text-sm text-gray-400 mt-1">Vui lòng đợi một chút</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-blue-200">
                {studentData?.profile_img_url ? (
                  <img 
                    src={studentData.profile_img_url} 
                    alt={studentData.name || 'Học sinh'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {studentData?.name || 'Tổng quan học sinh'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Quản lý hồ sơ và sức khỏe toàn diện
                </p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
            <nav className="flex space-x-4 overflow-x-auto px-4 py-3" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      group flex items-center space-x-2 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Content Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {activeTabData && (
                    <>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTabData.color}`}>
                        <activeTabData.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {activeTabData.label}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {studentData?.name && `${activeTabData.label.toLowerCase()} của ${studentData.name}`}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6">
              {activeTabData?.component || (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Không có nội dung</p>
                  <p className="text-sm text-gray-400 mt-1">Vui lòng chọn một mục để xem chi tiết</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentOverview;