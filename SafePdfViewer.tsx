import React, { useState, useEffect } from 'react';

interface SafePdfViewerProps {
  base64Data: string;
  title?: string;
}

const SafePdfViewer: React.FC<SafePdfViewerProps> = ({ base64Data, title }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!base64Data) {
      setBlobUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Use a timeout to avoid blocking the UI thread for very large files
    const timer = setTimeout(() => {
      try {
        // Extract base64 content
        const parts = base64Data.split(',');
        const content = parts.length > 1 ? parts[1] : parts[0];
        
        // Convert base64 to binary
        // For very large files, atob can still be slow, but it's better than data URLs in iframes
        const binaryStr = atob(content);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error('Error creating blob URL:', err);
        setError('Không thể xử lý file PDF. Có thể file quá lớn hoặc định dạng không hợp lệ.');
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [base64Data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-sm">Đang chuẩn bị tài liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-red-400 p-8 text-center gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="font-bold">{error}</p>
        <p className="text-xs text-slate-400">Thử tải lại trang hoặc sử dụng file có dung lượng nhỏ hơn (dưới 20MB).</p>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400">
        <p className="font-bold">Không có dữ liệu PDF</p>
      </div>
    );
  }

  return (
    <iframe 
      src={blobUrl} 
      className="w-full h-full border-none bg-white" 
      title={title || "PDF Viewer"} 
    />
  );
};

export default SafePdfViewer;
