import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Đã xóa dòng import './index.css' để tránh lỗi "Could not resolve" trên Vercel
// Nếu sau này bạn có file CSS, hãy tạo file đó trước rồi mới thêm lại dòng import

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);