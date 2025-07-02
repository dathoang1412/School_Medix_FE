import React, { useState, useEffect } from 'react';

const PDFViewer = ({ record_url }) => {
  const [error, setError] = useState(null);

  // Validate the record_url when the component mounts or when record_url changes
  useEffect(() => {
    if (!record_url) {
      setError('Không có URL tài liệu được cung cấp');
      return;
    }
    // Optionally, validate if the URL ends with .pdf
    if (!record_url.toLowerCase().endsWith('.pdf')) {
      setError('URL không dẫn đến file PDF hợp lệ');
    } else {
      setError(null);
    }
  }, [record_url]);

  if (error) {
    return (
      <div className="min-h-[400px] bg-gray-50 flex items-center justify-center border border-gray-200 rounded-md">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={record_url}
        title="PDF Viewer"
        className="w-full h-[600px] border border-gray-200 rounded-md"
        frameBorder="0"
        onError={() => setError('Không thể tải file PDF')}
      ></iframe>
    </div>
  );
};

export default PDFViewer;