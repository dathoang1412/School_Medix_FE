import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Loader2, User, Activity, FileText, List, Shield, Heart, Syringe, ChevronRight } from 'lucide-react';
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
        // Check authentication
        const { data, error } = await getSession();
        if (error || !data.session) {
          enqueueSnackbar('Please log in to continue!', { variant: 'error' });
          navigate('/login');
          return;
        }
        setIsAuthenticated(true);

        // Fetch student data
        const student = await getStudentInfo(student_id);
        setStudentData(student);
      } catch (error) {
        enqueueSnackbar('Failed to load data: ' + error.message, { variant: 'error' });
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
      label: 'Biểu đồ phát triển', 
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
      component: <HealthRecordList/>,
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
      label: 'Hồ sơ sức khỏe', 
      icon: Heart,
      component: <HealthRecord studentData={studentData} />,
      color: 'bg-pink-50 text-pink-600 border-pink-200'
    },
    { 
      id: 'vaccineRecord', 
      label: 'Hồ sơ tiêm chủng', 
      icon: Syringe,
      component: <VaccineRecordInfo />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
  ];

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      group flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      transition-all duration-200
                      ${isActive 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Content Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
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
          <div className="p-6">
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
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;