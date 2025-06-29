import { useContext } from "react";
import { Heart, Calendar, Activity, Pill, Syringe } from "lucide-react";
import { Services } from "../../components/Services";
import { ChildContext } from "../../layouts/ParentLayout";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";

const ParentDashboard = () => {
  const { children, selectedChild, isLoading, error } = useContext(ChildContext);
  const path = useLocation().pathname;

  const services = [
    {
      icon: <Syringe className="w-8 h-8 text-green-600" />,
      title: "Tiêm Chủng",
      description: "Theo dõi và cập nhật lịch tiêm chủng",
      path: selectedChild ? `/parent/edit/${selectedChild.id}/vaccine-info` : "#",
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Khám sức khỏe định kỳ",
      description: "Lịch khám và kết quả khám định kỳ",
      path: selectedChild ? `/parent/edit/${selectedChild.id}/regular-checkup` : "#",
    },
    {
      icon: <Activity className="w-8 h-8 text-blue-600" />,
      title: "Sức khỏe hằng ngày",
      description: "Các khảo sát về tình trạng sức khỏe",
      path: selectedChild ? `/parent/edit/${selectedChild.id}/health-record` : "#",
    },
    {
      icon: <Pill className="w-8 h-8 text-purple-600" />,
      title: "Gửi thuốc cho nhà trường",
      description: "Đăng ký và theo dõi thuốc tại trường",
      info: "1 đơn thuốc đang chờ xác nhận",
      path: selectedChild ? `/parent/edit/${selectedChild.id}/drug-table` : "#",
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      title: "Tổng quan sức khỏe",
      description: "Xem tổng quan sức khỏe và lịch sử",
      path: selectedChild ? `/parent/edit/${selectedChild.id}/health-record` : "#",
    },
  ];

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  return (
    <div>
      {path && <></> }
      <Header />
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Children List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Danh sách con của bạn
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">Đang tải thông tin...</p>
            </div>
          ) : children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleSelectChild(child)}
                  className={`
                    bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer
                    hover:shadow-md transition-all duration-200
                    ${selectedChild?.id === child.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  aria-label={`Chọn ${child?.name}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
                        ${selectedChild?.id === child.id ? "bg-blue-500" : "bg-gray-400"}
                      `}
                    >
                      {getInitials(child?.name)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{child?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {child.class_name || "Chưa có thông tin lớp"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">Không có thông tin trẻ em.</p>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Quản lý y tế học đường{" "}
            {selectedChild ? `cho ${selectedChild.name}` : ""}
          </h2>

          {selectedChild ? (
            <Services services={services} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                Vui lòng chọn một đứa trẻ để xem dịch vụ
              </p>
              <p className="text-sm text-gray-400">
                Chọn tên con em từ danh sách phía trên
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;