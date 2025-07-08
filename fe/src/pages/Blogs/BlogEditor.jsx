import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Save, Upload, ArrowLeft } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import { toast } from 'react-toastify';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    thumbnail: null,
    thumbnailPreview: '',
    content: ''
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const categories = [
    { id: 1, name: 'Tin tức' },
    { id: 2, name: 'Hướng dẫn' },
    { id: 3, name: 'Đánh giá' },
    { id: 4, name: 'Chia sẻ' },
  ];

  // Initialize Quill editor
  useEffect(() => {
    console.log('Bắt đầu khởi tạo Quill, quillRef.current:', quillRef.current);
    if (quillRef.current && !quillInstanceRef.current) {
      try {
        const quill = new Quill(quillRef.current, {
          theme: 'snow',
          placeholder: 'Nhập nội dung bài viết...',
          modules: {
            toolbar: {
              container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean'],
              ],
              handlers: {
                image: handleImageUpload,
              },
            },
          },
        });

        quill.on('text-change', () => {
          console.log('Quill text changed, content:', quill.root.innerHTML);
          setFormData(prev => ({
            ...prev,
            content: quill.root.innerHTML
          }));
        });

        quillInstanceRef.current = quill;
        console.log('Quill khởi tạo thành công:', quillInstanceRef.current);
      } catch (err) {
        console.error('Lỗi khi khởi tạo Quill:', err);
        setError('Không thể khởi tạo trình soạn thảo!');
        setIsLoading(false);
      }
    }

    return () => {
      if (quillInstanceRef.current && quillRef.current) {
        quillRef.current.innerHTML = '';
        quillInstanceRef.current = null;
        console.log('Quill được dọn dẹp');
      }
    };
  }, []);

  // Load blog data when editing
  useEffect(() => {
    console.log('useEffect fetchBlog, id:', id);
    if (!id) {
      console.log('Chế độ tạo mới, không fetch dữ liệu');
      setIsLoading(false);
      return;
    }

    const loadBlogData = async () => {
      console.log('Gọi loadBlogData với id:', id);
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosClient.get(`/blog/${id}`, { timeout: 5000 });
        console.log('Phản hồi API:', response);
        const blog = response.data?.blog?.[0];

        if (!blog) {
          throw new Error('Không tìm thấy bài viết');
        }

        const content = blog.content || '<p></p>'; // Đảm bảo content là HTML hợp lệ
        setFormData({
          title: blog.title || '',
          category: blog.blog_type_id?.toString() || '',
          thumbnailPreview: blog.thumbnail_url || '',
          thumbnail: null,
          content
        });

        // Gán nội dung vào Quill nếu đã sẵn sàng
        if (quillInstanceRef.current) {
          quillInstanceRef.current.root.innerHTML = content;
          console.log('Đã gán nội dung Quill:', content);
        } else {
          console.warn('Quill chưa sẵn sàng, lưu nội dung vào formData');
        }
      } catch (err) {
        console.error('Lỗi khi tải blog:', err);
        setError(err.message || 'Không thể tải bài viết');
      } finally {
        setIsLoading(false);
        console.log('Kết thúc loadBlogData, isLoading:', false);
      }
    };

    loadBlogData();
  }, [id]);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('files', file);

        const response = await axiosClient.post('/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const imageUrl = response.data?.urls?.[0];
        if (imageUrl && quillInstanceRef.current) {
          const range = quillInstanceRef.current.getSelection() || { index: 0 };
          quillInstanceRef.current.insertEmbed(range.index, 'image', imageUrl);
          console.log('Đã chèn ảnh vào Quill:', imageUrl);
        }
      } catch (err) {
        toast.error('Tải ảnh lên thất bại');
        console.error('Image upload failed:', err);
      }
    };
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: event.target.result
      }));
      console.log('Đã chọn thumbnail:', file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let thumbnailUrl = formData.thumbnailPreview;

      // Upload new thumbnail if selected
      if (formData.thumbnail) {
        const thumbForm = new FormData();
        thumbForm.append('files', formData.thumbnail);

        const response = await axiosClient.post('/upload-image', thumbForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        thumbnailUrl = response.data?.urls?.[0] || '';
        console.log('Thumbnail uploaded:', thumbnailUrl);
      }

      const blogData = {
        title: formData.title || '',
        content: formData.content || '',
        thumbnail_url: thumbnailUrl || '',
        blog_type_id: formData.category ? Number(formData.category) : null
      };

      if (id) {
        await axiosClient.patch(`/update-blog/${id}`, blogData);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await axiosClient.post('/created-blog', blogData);
        toast.success('Tạo bài viết thành công');
      }

      navigate('/blog');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Cập nhật ${name}:`, value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold text-red-600 mb-4">Lỗi</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={18} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
            </h2>
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề bài viết
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Thể loại
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn thể loại</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh đại diện
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition">
                    <Upload size={18} />
                    <span>
                      {formData.thumbnail 
                        ? formData.thumbnail.name 
                        : formData.thumbnailPreview 
                          ? 'Ảnh hiện tại' 
                          : 'Chọn ảnh đại diện'}
                    </span>
                  </div>
                </label>
                {formData.thumbnailPreview && (
                  <img
                    src={formData.thumbnailPreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung bài viết
              </label>
              <div
                ref={quillRef}
                className="border border-gray-300 rounded-lg bg-white"
                style={{ minHeight: '400px' }}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
              >
                <Save size={18} />
                {isSubmitting 
                  ? 'Đang xử lý...' 
                  : id 
                    ? 'Cập nhật bài viết' 
                    : 'Đăng bài viết'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
