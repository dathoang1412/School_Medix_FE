import {
  User,
  Menu,
  X,
  ArrowRight,
  Shield,
  Users,
  Calendar,
  FileText,
  Heart,
  Stethoscope,
  Pill,
  Syringe,
  Activity,
  BarChart3,
  Clock,
  Star,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosClient from "../config/axiosClient";
import { useNavigate } from "react-router-dom";
import { MdOutlineSchool } from "react-icons/md";

const LandingPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Theo dõi sức khỏe 24/7",
      description: "Giám sát tình trạng sức khỏe học sinh liên tục",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bảo mật dữ liệu",
      description: "Hệ thống bảo mật cao, đảm bảo an toàn thông tin",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Dễ dàng sử dụng",
      description: "Giao diện thân thiện, dễ sử dụng cho mọi đối tượng",
    },
  ];

  const services = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Khám sức khỏe",
      description:
        "Theo dõi và quản lý việc khám sức khỏe định kỳ của học sinh",
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      title: "Lịch sử khám",
      description: "Ghi nhận và lưu trữ lịch sử khám bệnh một cách chi tiết",
    },
    {
      icon: <Activity className="w-8 h-8 text-green-500" />,
      title: "Dữ liệu sức khỏe",
      description: "Thống kê và phân tích dữ liệu sức khỏe toàn diện",
    },
    {
      icon: <Pill className="w-8 h-8 text-purple-500" />,
      title: "Quản lý thuốc",
      description: "Theo dõi việc sử dụng thuốc và điều trị của học sinh",
    },
    {
      icon: <Syringe className="w-8 h-8 text-orange-500" />,
      title: "Tiêm chủng",
      description: "Quản lý lịch trình tiêm chủng và theo dõi hiệu quả",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-500" />,
      title: "Báo cáo thống kê",
      description: "Tạo báo cáo chi tiết về tình hình sức khỏe học đường",
    },
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosClient.get("/blog", { timeout: 5000 });
        if (
          response.error ||
          !response.data.blog ||
          !response.data.blog.length
        ) {
          setError("Chưa có bài viết nào!");
          setBlogs([]);
        } else {
          // Limit to 4 latest blogs to match original design
          setBlogs(response.data.blog.slice(0, 4));
        }
      } catch (err) {
        setError("Không thể tải bài viết!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Chăm sóc sức khỏe học đường toàn diện
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Quản lý toàn bộ hồ sơ sức khỏe học sinh một cách chuyên nghiệp
                và hiệu quả
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition-colors duration-200">
                Bắt đầu ngay
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="relative">
              <img
                src="/hero.jpg"
                alt="Healthcare"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      1000+ Học sinh
                    </p>
                    <p className="text-sm text-gray-600">Đã được chăm sóc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Về SchoolMedix
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            Hệ thống quản lý sức khỏe học đường hiện đại, giúp các trường học
            theo dõi và chăm sóc sức khỏe học sinh một cách toàn diện và chuyên
            nghiệp.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Newest Blogs
            </h2>
            <p className="text-xl text-gray-600">
              Cập nhật những thông tin mới nhất về sức khỏe học đường
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {blogs.map((post, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <img
                    src={
                      post.thumbnail_url ||
                      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop"
                    }
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>
                        {new Date(post.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        {Math.ceil(post.content.length / 200)} phút đọc
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content.replace(/<[^>]+>/g, "").substring(0, 100)}
                      ...
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                      Đọc thêm
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu với SchoolMedix?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Hãy liên hệ với chúng tôi để được tư vấn và triển khai hệ thống quản
            lý sức khỏe học đường
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200">
              Liên hệ ngay
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200">
              Xem demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">
                    <MdOutlineSchool className="text-lg" />
                  </div>
                </div>
                <span className="text-xl font-bold">SchoolMedix</span>
              </div>
              <p className="text-gray-400">
                Hệ thống quản lý sức khỏe học đường hiện đại và toàn diện
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Hồ sơ sức khỏe
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Quản lý thuốc
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tiêm chủng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Báo cáo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Hướng dẫn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Công ty</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tuyển dụng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tin tức
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 SchoolMedix. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
