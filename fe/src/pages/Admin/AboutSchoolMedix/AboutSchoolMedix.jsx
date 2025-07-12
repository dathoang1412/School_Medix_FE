import React from "react";
import {
  BookOpen,
  Heart,
  Building,
  Clock,
  Award,
  Users,
  Camera,
  ArrowRight,
} from "lucide-react";
import Footer from "../../../components/Footer";

const AboutSchoolMedix = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="absolute inset-0 bg-gray-900/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-8">
              <Heart className="w-4 h-4 mr-2" />
              Giáo dục toàn diện - Phát triển bền vững
            </div>
            <h1 className="text-5xl md:text-6xl font-extralight text-gray-900 mb-6 tracking-tight">
              Trường TH - THPT
              <span className="block font-medium text-gray-800">Medix</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Khám phá lịch sử, sứ mệnh và những giá trị cốt lõi định hình tương
              lai giáo dục
            </p>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80"
            alt="Trường TH - THPT Medix"
            className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-white text-lg font-medium">
              Cơ sở hiện đại của Trường TH - THPT Medix
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-8">
              Về Trường TH - THPT Medix
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto mb-8"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Trường TH - THPT Medix là một cơ sở giáo dục hàng đầu, cam kết
                cung cấp môi trường học tập toàn diện cho học sinh từ tiểu học
                đến trung học phổ thông.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Thành lập với mục tiêu nuôi dưỡng thế hệ trẻ trở thành những
                công dân có trách nhiệm, sáng tạo và khỏe mạnh, kết hợp giáo dục
                học thuật xuất sắc với phát triển toàn diện.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Năm thành lập</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    2005
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Học sinh hiện tại</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    2,000+
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600"></span>
                  <span className="text-2xl font-semibold text-gray-900">
                    95%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission and Vision */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-8">
              Sứ mệnh & Tầm nhìn
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-8 h-full">
                <h3 className="text-2xl font-medium text-gray-900 mb-6">
                  Sứ mệnh
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Cung cấp một nền giáo dục toàn diện, khuyến khích sự sáng tạo,
                  trách nhiệm và sức khỏe thể chất, giúp học sinh phát huy tối
                  đa tiềm năng của mình và đóng góp tích cực cho xã hội.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-8 h-full">
                <h3 className="text-2xl font-medium text-gray-900 mb-6">
                  Tầm nhìn
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Trở thành trường học tiên phong trong khu vực, nơi mỗi học
                  sinh được trang bị kiến thức, kỹ năng và giá trị đạo đức để
                  dẫn dắt tương lai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-8">
              Hành trình phát triển
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-light text-gray-900">
                    2005
                  </span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Thành lập tại trung tâm thành phố với 300 học sinh, khởi đầu
                    sứ mệnh mang lại nền giáo dục chất lượng cao cho cộng đồng.
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-light text-gray-900">
                    2010
                  </span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Mở rộng cơ sở vật chất với thư viện hiện đại và phòng thí
                    nghiệm khoa học tiên tiến.
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-light text-gray-900">
                    2015
                  </span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Nhận chứng nhận chất lượng giáo dục quốc tế từ EdQual, khẳng
                    định vị thế hàng đầu.
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-light text-gray-900">
                    2018
                  </span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Tiên phong tích hợp y tế học đường với chương trình kiểm tra
                    sức khỏe toàn diện.
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-light text-gray-900">
                    2023
                  </span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Khai trương cơ sở mới, mở rộng quy mô phục vụ hơn 2.000 học
                    sinh với tiêu chuẩn quốc tế.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-8">
              Điểm nổi bật
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6">
                <img
                  src="/school1.jpg"
                  alt="Chất lượng giáo dục"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Chất lượng giáo dục
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chương trình học thuật chuẩn quốc tế, kết hợp tư duy sáng tạo và
                kỹ năng thực tiễn.
              </p>
            </div>

            <div className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6">
                <img
                  src="/school2.jpg"
                  alt="Sức khỏe học đường"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Sức khỏe học đường
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chương trình kiểm tra sức khỏe định kỳ và tiêm chủng toàn diện
                cho học sinh.
              </p>
            </div>

            <div className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6">
                <img
                  src="/school3.jpg"
                  alt="Cơ sở vật chất"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <Building className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Cơ sở vật chất
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Trang bị phòng học hiện đại, thư viện và phòng thí nghiệm tiên
                tiến.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-8">
              Thành tựu nổi bật
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chứng nhận EdQual
              </h3>
              <p className="text-gray-600 text-sm">
                Chất lượng giáo dục quốc tế 2015
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Giải Nhất Quốc gia
              </h3>
              <p className="text-gray-600 text-sm">
                Cuộc thi Khoa học THPT 2019
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Trường vì sức khỏe
              </h3>
              <p className="text-gray-600 text-sm">Vinh danh từ Bộ Y tế 2020</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                95% Xuất sắc
              </h3>
              <p className="text-gray-600 text-sm">Kỳ thi quốc gia 2022-2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-8">
              Khám phá Medix
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden rounded-2xl">
              <img
                src="/s4.jpg"
                alt="Hoạt động lớp học"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-medium">Hoạt động lớp học</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl">
              <img
                src="/s5.jpg"
                alt="Sự kiện trường học"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-medium">Sự kiện trường học</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl">
              <img
                src="/s6.jpg"
                alt="Khu thể thao"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-medium">Khu thể thao</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl">
              <img
                src="/s7.jpg"
                alt="Phòng thí nghiệm"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-medium">Phòng thí nghiệm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-light text-gray-900 mb-8">
              Cộng đồng Medix
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto mb-12"></div>
            <div className="bg-white rounded-3xl p-12 shadow-2xl">
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Tại Medix, chúng tôi tin rằng giáo dục không chỉ dừng lại ở lớp
                học. Trường tổ chức nhiều hoạt động cộng đồng để khuyến khích
                học sinh tham gia vào các sáng kiến xã hội và môi trường.
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-light text-gray-900 mb-2">
                    50+
                  </div>
                  <p className="text-gray-600">Hoạt động cộng đồng</p>
                </div>
                <div>
                  <div className="text-3xl font-light text-gray-900 mb-2">
                    15
                  </div>
                  <p className="text-gray-600">Câu lạc bộ ngoại khóa</p>
                </div>
                <div>
                  <div className="text-3xl font-light text-gray-900 mb-2">
                    100%
                  </div>
                  <p className="text-gray-600">Học sinh tham gia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default AboutSchoolMedix;
