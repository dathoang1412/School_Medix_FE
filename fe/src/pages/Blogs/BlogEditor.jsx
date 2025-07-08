import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import { toast } from 'react-toastify';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const editorContainerRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    thumbnail: null,
    thumbnailPreview: '',
    content: '<p></p>',
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [quillInitialized, setQuillInitialized] = useState(false);

  const categories = [
    { id: 1, name: 'Tin tức' },
    { id: 2, name: 'Hướng dẫn' },
    { id: 3, name: 'Đánh giá' },
    { id: 4, name: 'Chia sẻ' },
  ];

  // Initialize Quill editor
  useEffect(() => {
    if (quillInstanceRef.current) return;

    const initializeQuill = () => {
      try {
        if (!editorContainerRef.current) {
          throw new Error('Editor container not found');
        }

        // Clear any existing content
        editorContainerRef.current.innerHTML = '';

        const quill = new Quill(editorContainerRef.current, {
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
          const content = quill.root.innerHTML;
          setFormData((prev) => ({
            ...prev,
            content,
          }));
        });

        quillInstanceRef.current = quill;
        setQuillInitialized(true);

        // Set initial content if it exists
        if (formData.content && formData.content !== '<p></p>') {
          quill.root.innerHTML = formData.content;
        }

      } catch (err) {
        console.error('Quill initialization failed:', err);
        setError('Không thể khởi tạo trình soạn thảo: ' + err.message);
        setIsLoading(false);
      }
    };

    // Initialize Quill after a small delay to ensure DOM is ready
    const timer = setTimeout(initializeQuill, 100);

    return () => {
      clearTimeout(timer);
      if (quillInstanceRef.current) {
        quillInstanceRef.current = null;
        setQuillInitialized(false);
      }
    };
  }, []);

  // Load blog data when editing
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const loadBlogData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosClient.get(`/blog/${id}`);
        const blog = response.data?.blog;

        if (!blog) {
          throw new Error('Không tìm thấy bài viết');
        }

        const content = blog.content || '<p></p>';
        setFormData({
          title: blog.title || '',
          category: blog.blog_type_id?.toString() || '',
          thumbnailPreview: blog.thumbnail_url || '',
          thumbnail: null,
          content,
        });

        // Set content in Quill if it's initialized
        if (quillInstanceRef.current) {
          quillInstanceRef.current.root.innerHTML = content;
        }
      } catch (err) {
        console.error('Failed to load blog:', err);
        setError(err.message || 'Không thể tải bài viết');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogData();
  }, [id]);

  // Handle image uploads in Quill
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh phải nhỏ hơn 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (quillInstanceRef.current) {
          const range = quillInstanceRef.current.getSelection(true) || { index: 0 };
          quillInstanceRef.current.insertEmbed(range.index, 'image', evt.target.result);
          quillInstanceRef.current.setSelection(range.index + 1);
        }
      };
      reader.readAsDataURL(file);
    };
  };

  // Handle thumbnail selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh đại diện phải nhỏ hơn 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Convert base64 to File
  const dataURLtoFile = (dataurl, filename) => {
    try {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (err) {
      console.error('Failed to convert base64 to file:', err);
      throw err;
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Tiêu đề là bắt buộc';
    if (!formData.category) errors.category = 'Vui lòng chọn thể loại';
    if (!id && (!formData.thumbnail || !formData.thumbnailPreview)) errors.thumbnail = 'Ảnh đại diện là bắt buộc';
    if (!formData.content || formData.content === '<p><br></p>' || formData.content === '<p></p>') {
      errors.content = 'Nội dung là bắt buộc';
    }
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);

    try {
      let thumbnailUrl = formData.thumbnailPreview;
      let content = formData.content;

      // Process content images
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const imgs = doc.querySelectorAll('img');
      const imgFiles = [];
      
      imgs.forEach((img, idx) => {
        if (img.src.startsWith('data:image')) {
          imgFiles.push(dataURLtoFile(img.src, `blog-img-${Date.now()}-${idx}.png`));
        }
      });

      // Upload content images
      let imgUrls = [];
      if (imgFiles.length > 0) {
        const imgFormData = new FormData();
        imgFiles.forEach((file) => imgFormData.append('files', file));
        const imgResponse = await axiosClient.post('/upload-image', imgFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imgUrls = imgResponse.data.urls || [];
      }

      // Replace base64 image URLs with public URLs
      let urlIdx = 0;
      imgs.forEach((img) => {
        if (img.src.startsWith('data:image')) {
          img.src = imgUrls[urlIdx] || '';
          urlIdx++;
        }
      });
      content = doc.body.innerHTML;

      // Upload thumbnail if new file selected
      if (formData.thumbnail) {
        const thumbForm = new FormData();
        thumbForm.append('files', formData.thumbnail);
        const thumbResponse = await axiosClient.post('/upload-image', thumbForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        thumbnailUrl = thumbResponse.data.urls?.[0] || '';
      }

      // Prepare blog data
      const blogData = {
        title: formData.title,
        content,
        thumbnail_url: thumbnailUrl,
        blog_type_id: Number(formData.category),
      };

      // Save blog
      if (id) {
        await axiosClient.put(`/update-blog/${id}`, blogData);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await axiosClient.post('/created-blog', blogData);
        toast.success('Tạo bài viết thành công');
      }

      navigate('/blog');
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h3 className="text-xl font-semibold">Lỗi</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={18} />
            Quay lại danh sách
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              {id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
            </h2>
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                Tiêu đề bài viết
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Tiêu đề bài viết"
                className={`w-full px-4 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
                Thể loại
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base`}
              >
                <option value="">Chọn thể loại</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-semibold text-gray-700 mb-1">
                Ảnh đại diện {id ? '' : '(bắt buộc)'}
              </label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.thumbnailPreview && (
                <img
                  src={formData.thumbnailPreview}
                  alt="Thumbnail preview"
                  className="mt-2 max-w-xs max-h-32 rounded-lg border border-gray-200"
                />
              )}
              {formErrors.thumbnail && (
                <p className="mt-1 text-sm text-red-500">{formErrors.thumbnail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nội dung bài viết
              </label>
              <div className={`border ${formErrors.content ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white`}>
                <div ref={editorContainerRef} style={{ minHeight: '260px' }} />
              </div>
              {formErrors.content && (
                <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !quillInitialized}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition font-semibold text-base"
            >
              <Save size={18} />
              {isSubmitting ? 'Đang lưu...' : id ? 'Cập nhật bài viết' : 'Lưu bài viết'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;