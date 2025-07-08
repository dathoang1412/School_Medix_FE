import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../config/axiosClient';
import { Calendar } from 'lucide-react';

const ShowBlog = () => {
  const { id } = useParams(); // Get the blog ID from URL params
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axiosClient.get(`/blog/${id}`);
        if (response.error || !response.data.blog || !response.data.blog[0]) {
          setError('Không tìm thấy bài viết!');
          setBlog(null);
        } else {
          setBlog(response.data.blog[0]); // Access the first blog post from the response
        }
      } catch (err) {
        setError('Không thể tải bài viết!');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error || !blog ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-500 mb-6">Bài viết không tồn tại hoặc đã bị xóa.</p>
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Quay lại danh sách bài viết
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {blog.thumbnail_url && (
              <img
                src={blog.thumbnail_url}
                alt={blog.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-blue-700 mb-4">{blog.title}</h1>
              <div className="flex items-center text-gray-600 text-sm mb-4">
                <Calendar size={16} className="mr-2" />
                Ngày tạo: {new Date(blog.created_at).toLocaleString('vi-VN')}
              </div>
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
              <button
                onClick={() => navigate('/blog')}
                className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Quay lại danh sách bài viết
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowBlog;