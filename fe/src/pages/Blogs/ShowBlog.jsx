import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../config/axiosClient";
import { Calendar, ArrowLeft } from "lucide-react";
import Footer from "../../components/Footer";

const ShowBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const path = useLocation().pathname.split('/')[1]


  // Determine the base path for navigation
  const isAdminSection = window.location.pathname.includes("/admin");
  const basePath = isAdminSection ? "/admin/blog" : "/blog";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axiosClient.get(`/blog/${id}`);
        if (response.error || !response.data.blog) {
          setError("Không tìm thấy bài viết!");
          setBlog(null);
        } else {
          setBlog(response.data.blog);
        }
      } catch (err) {
        setError("Không thể tải bài viết!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header với back button */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(basePath)}
            className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-700 transition-all duration-200 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span className="font-medium">Quay lại danh sách</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : error || !blog ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Không tìm thấy bài viết
              </h3>
              <p className="text-gray-600 mb-6">
                Bài viết không tồn tại hoặc đã bị xóa.
              </p>
              <button
                onClick={() => navigate(basePath)}
                className="inline-flex cursor-pointer items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
              >
                <ArrowLeft size={18} />
                Quay lại danh sách bài viết
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main content card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              {/* Thumbnail nhỏ gọn */}
              {blog.thumbnail_url && (
                <div className="relative">
                  <img
                    src={blog.thumbnail_url}
                    alt={blog.title}
                    className="w-full h-48 md:h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
                    {blog.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                      <Calendar size={16} />
                      <span className="text-sm font-medium">
                        {new Date(blog.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider nhẹ nhàng */}
                <div className="w-16 h-0.5 bg-blue-200 rounded-full mb-6"></div>

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                    prose-headings:text-gray-800 prose-headings:font-semibold
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-strong:text-gray-800 prose-strong:font-medium
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-3 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
                    prose-img:rounded-lg prose-img:shadow-md
                    prose-hr:border-gray-200 prose-hr:my-6
                    prose-li:marker:text-blue-500
                    prose-table:shadow-md prose-table:rounded-lg prose-table:overflow-hidden
                    prose-th:bg-blue-50 prose-th:font-medium prose-th:text-gray-800
                    prose-td:border-gray-200"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => navigate(basePath)}
                className="flex cursor-pointer items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
              >
                <ArrowLeft size={18} />
                <span className="font-medium">Quay lại danh sách bài viết</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {path !== "admin" && <Footer />}
    </div>
  );
};

export default ShowBlog;
