import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import './i18n';
import './index.scss';
import { store } from '@/store/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#333', // 🎯 Đổi màu chủ đạo thành đen
          borderRadius: 3,
          fontFamily: "'Roboto Mono', monospace" // Áp dụng font Roboto Mono cho Ant Design
        }
      }}
    >
      <App />
    </ConfigProvider>
  </Provider>
  // </React.StrictMode>
);
