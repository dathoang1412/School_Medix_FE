import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Save, ArrowLeft, AlertCircle, Upload, Image } from 'lucide-react';
import axiosClient from '../../config/axiosClient';
import { enqueueSnackbar } from 'notistack';

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
    content: '',
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [quillInitialized, setQuillInitialized] = useState(false);

  // Determine the base path for navigation
  const isAdminSection = window.location.pathname.includes('/admin');
  const basePath = isAdminSection ? '/admin/blog' : '/blog';

  const categories = [
    { id: 1, name: 'Tin tức' },
    { id: 2, name: 'Hướng dẫn' },
    { id: 3, name: 'Đánh giá' },
    { id: 4, name: 'Chia sẻ' },
  ];

  // Handle image uploads in Quill
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar('Ảnh phải nhỏ hơn 5MB', { variant: 'warning' });
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
  }, []);

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
          setFormData((prev) => {
            if (prev.content !== content) {
              return { ...prev, content };
            }
            return prev;
          });
        });

        quillInstanceRef.current = quill;
        setQuillInitialized(true);

        // Set initial content if it exists
        if (formData.content) {
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
  }, [handleImageUpload]);

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

        const content = blog.content || '';
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

  // Update Quill content when formData.content changes and Quill is initialized
  useEffect(() => {
    if (
      quillInitialized &&
      quillInstanceRef.current &&
      formData.content &&
      quillInstanceRef.current.root.innerHTML !== formData.content
    ) {
      quillInstanceRef.current.root.innerHTML = formData.content;
    }
  }, [quillInitialized, formData.content]);

  // Handle thumbnail selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Ảnh đại diện phải nhỏ hơn 5MB', { variant: 'warning' });
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
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
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
        enqueueSnackbar('Cập nhật bài viết thành công', { variant: 'success' });
      } else {
        await axiosClient.post('/created-blog', blogData);
        enqueueSnackbar('Tạo bài viết thành công', { variant: 'success' });
      }

      navigate(basePath);
    } catch (err) {
      console.error('Submission error:', err);
      enqueueSnackbar(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu bài viết', { variant: 'error' });
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Đang tải...</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertCircle size={24} />
                <h3 className="text-lg font-medium">Đã xảy ra lỗi</h3>
              </div>
              <p className="text-gray-700 mb-6">{error}</p>
              <button
                onClick={() => navigate(basePath)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                <ArrowLeft size={16} />
                Quay lại danh sách
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 rounded-t-lg px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-medium text-gray-900">
                    {id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {id ? 'Cập nhật thông tin và nội dung bài viết' : 'Tạo một bài viết mới cho blog'}
                  </p>
                </div>
                <button
                  onClick={() => navigate(basePath)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Quay lại
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border-x border-b border-gray-200 rounded-b-lg">
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề bài viết
                          </label>
                          <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Nhập tiêu đề bài viết"
                            className={`w-full px-3 py-2 border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm`}
                          />
                          {formErrors.title && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Thể loại
                          </label>
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border ${formErrors.category ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm`}
                          >
                            <option value="">Chọn thể loại</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.category && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                            Ảnh đại diện {!id && <span className="text-red-500">*</span>}
                          </label>
                          <div className="space-y-3">
                            <div className="flex items-center justify-center w-full">
                              <label htmlFor="thumbnail" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium">Click để chọn ảnh</span>
                                  </p>
                                  <p className="text-xs text-gray-400">PNG, JPG tối đa 5MB</p>
                                </div>
                                <input
                                  id="thumbnail"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleThumbnailChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {formData.thumbnailPreview && (
                              <div className="relative">
                                <img
                                  src={formData.thumbnailPreview}
                                  alt="Thumbnail preview"
                                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                                  <Image size={16} className="text-gray-500" />
                                </div>
                              </div>
                            )}
                          </div>
                          {formErrors.thumbnail && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.thumbnail}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Content */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Nội dung bài viết</h3>
                      
                      <div className={`border ${formErrors.content ? 'border-red-300' : 'border-gray-300'} rounded-lg bg-white`}>
                        <div 
                          ref={editorContainerRef} 
                          style={{ minHeight: '400px', direction: 'ltr' }}
                          className="prose max-w-none"
                        />
                      </div>
                      {formErrors.content && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.content}</p>
                      )}
                      
                      <div className="mt-4 text-sm text-gray-500">
                        <p>💡 Mẹo: Sử dụng thanh công cụ ở trên để định dạng văn bản và chèn hình ảnh</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {id ? 'Lưu thay đổi vào bài viết' : 'Tạo bài viết mới'}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(basePath)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !quillInitialized}
                      className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save size={16} />
                      {isSubmitting ? 'Đang lưu...' : id ? 'Cập nhật' : 'Tạo bài viết'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;