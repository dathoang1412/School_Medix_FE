import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../config/axiosClient';
import { Calendar, Edit, Trash2, Plus, Search, Filter, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { getUserRole } from '../../service/authService';
import { enqueueSnackbar } from 'notistack';
import Modal from 'react-modal';
import Footer from '../../components/Footer';

// Set app element for react-modal (for accessibility)
Modal.setAppElement("#root");

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const path = useLocation().pathname.split('/')[1];

  // Modal styles (same as RegularCheckup)
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "500px",
      width: "90%",
      borderRadius: "0.5rem",
      border: "none",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      padding: "0",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  };

  // Categories aligned with backend blog_type_id
  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: '1', label: 'Tin tức' },
    { value: '2', label: 'Hướng dẫn' },
    { value: '3', label: 'Đánh giá' },
    { value: '4', label: 'Chia sẻ' },
  ];

  // Determine the base path for navigation
  const isAdminSection = window.location.pathname.includes('/admin');
  const basePath = isAdminSection ? '/admin/blog' : '/blog';

  useEffect(() => {
    const role = getUserRole() || 'guest';
    setUserRole(role);

    const fetchBlogs = async () => {
      try {
        const response = await axiosClient.get('/blog', { timeout: 10000 });
        if (response.error || !response.data.blog || !response.data.blog.length) {
          setError('Chưa có blog nào!');
          setBlogs([]);
          setFilteredBlogs([]);
        } else {
          console.log("BLOG LIST: ", response.data.blog);
          // Filter out deleted blogs (is_deleted = true)
          const activeBlogs = response.data.blog.filter(blog => !blog.is_deleted);
          setBlogs(activeBlogs);
          setFilteredBlogs(activeBlogs);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu blog!');
        console.error(err);
        enqueueSnackbar('Không thể tải danh sách blog!', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs based on search term and category
  useEffect(() => {
    let filtered = blogs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (using blog_type_id)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((blog) => blog.blog_type_id.toString() === selectedCategory);
    }

    setFilteredBlogs(filtered);
  }, [searchTerm, selectedCategory, blogs]);

  const openDeleteModal = (id) => {
    console.log("Opening delete modal for blogId:", id);
    setBlogToDelete(id);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    console.log("Closing delete modal");
    setDeleteModalIsOpen(false);
    setBlogToDelete(null);
  };

  const handleDelete = async (id) => {
    if (!id) {
      enqueueSnackbar('Không tìm thấy ID bài viết!', { variant: 'error' });
      return;
    }

    setLoadingDelete(true);
    try {
      const response = await axiosClient.patch(`/delete-blog/${id}`);
      setBlogs(blogs.filter((blog) => blog.id !== id));
      setFilteredBlogs(filteredBlogs.filter((blog) => blog.id !== id));
      enqueueSnackbar(response.data.message || 'Xóa bài viết thành công!', { variant: 'success' });
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting blog:", err);
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa bài viết!';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCreateBlog = () => {
    navigate(isAdminSection ? '/admin/blog/create' : '/blog/edit');
  };

  const handleBlogClick = (id) => {
    navigate(`${basePath}/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Xác nhận xóa bài viết"
      >
        <div className="bg-white rounded-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-900">Xác nhận xóa bài viết</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 cursor-pointer py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => handleDelete(blogToDelete)}
                disabled={loadingDelete}
                className={`px-4 cursor-pointer py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 ${
                  loadingDelete ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loadingDelete ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <div className="max-w-6xl mx-auto py-3">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
                Danh Sách Blog Y Tế Học Đường
              </h1>
              <p className="text-gray-600 text-base">
                Chia sẻ kiến thức và thông tin về sức khỏe học đường
              </p>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={handleCreateBlog}
                className="flex cursor-pointer items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
              >
                <Plus size={20} />
                Tạo bài viết mới
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base min-w-[12rem]"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          {!loading && !error && (
            <div className="text-sm text-gray-600 mb-4">
              Hiển thị {filteredBlogs.length} trong tổng số {blogs.length} bài viết
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có blog nào</h3>
            <p className="text-gray-600 mb-6">Hãy tạo bài viết đầu tiên để chia sẻ kiến thức y tế!</p>
            {userRole === 'admin' && (
              <button
                onClick={handleCreateBlog}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
              >
                <Plus size={20} />
                Tạo bài viết đầu tiên
              </button>
            )}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {blog.thumbnail_url && (
                  <img
                    src={blog.thumbnail_url}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2
                    className="text-xl font-semibold text-blue-700 mb-3 cursor-pointer hover:underline line-clamp-2"
                    onClick={() => handleBlogClick(blog.id)}
                  >
                    {blog.title}
                  </h2>
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <Calendar size={16} className="mr-2" />
                    Ngày tạo: {new Date(blog.created_at).toLocaleString('vi-VN')}
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(isAdminSection ? `/admin/blog/edit/${blog.id}` : `/blog/edit/${blog.id}`)}
                        className="flex cursor-pointer items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-semibold"
                      >
                        <Edit size={16} />
                        Sửa
                      </button>
                      <button
                        onClick={() => openDeleteModal(blog.id)}
                        className="flex cursor-pointer items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 text-sm font-semibold"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {path !== "admin" && <Footer />}
    </div>
  );
};

export default BlogList;