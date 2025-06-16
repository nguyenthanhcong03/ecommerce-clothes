import { store } from '@/store/store';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './AppRouter';
import './i18n';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#333', // 🎯 Đổi màu chủ đạo thành đen
          borderRadius: 3,
          fontFamily: "'Roboto Mono', monospace", // Áp dụng font Roboto Mono cho Ant Design
          colorBgContainer: '#ffffff',
          colorBorder: '#d9d9d9',
          colorTextBase: '#333333',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          colorInfo: '#1890ff'
        },
        components: {
          Button: {
            // colorPrimary: '#333', // 🎯 Đổi màu chủ đạo thành đen
            defaultActiveBorderColor: '#333', // 🎯 Đổi màu viền nút thành đen
            defaultActiveColor: '#333', // 🎯 Đổi màu chữ nút thành đen
            defaultHoverBorderColor: '#333', // 🎯 Đổi màu viền nút khi hover thành đen
            defaultHoverColor: '#333', // 🎯 Đổi màu chữ nút khi hover thành đen
            paddingInline: 16, // Khoảng cách nội dung bên trong nút
            paddingBlock: 6, // Chiều cao padding của nút
            borderRadiusLG: 4 // Bo tròn góc cho nút lớn
          },
          Input: {
            activeBorderColor: '#333', // Màu viền khi input được focus
            hoverBorderColor: '#555', // Màu viền khi hover
            paddingBlock: 6, // Chiều cao padding
            paddingInline: 12, // Padding ngang
            borderRadius: 3 // Bo tròn góc input
          },
          Select: {
            optionSelectedBg: '#f0f0f0', // Màu nền option được chọn
            optionActiveBg: '#f5f5f5', // Màu nền option đang active
            selectorBg: '#ffffff', // Màu nền select
            borderRadius: 3 // Bo tròn góc select
          },
          Table: {
            headerBg: '#f5f5f5', // Màu nền header
            headerColor: '#333', // Màu chữ header
            rowHoverBg: '#f0f0f0', // Màu nền khi hover vào dòng
            borderRadius: 3 // Bo tròn góc bảng
          },
          Card: {
            headerBg: '#ffffff', // Màu nền header card
            headerHeight: 48, // Chiều cao header
            borderRadius: 3, // Bo tròn góc card
            paddingLG: 20 // Padding cho card lớn
          },
          Form: {
            labelColor: '#333', // Màu chữ label
            itemMarginBottom: 20 // Khoảng cách giữa các form item
          },
          Modal: {
            headerBg: '#ffffff', // Màu nền header modal
            headerPadding: '16px 24px', // Padding cho header
            contentPadding: '24px', // Padding cho content
            footerPadding: '12px 24px', // Padding cho footer
            borderRadius: 4 // Bo tròn góc modal
          },
          Dropdown: {
            controlItemBgHover: '#f5f5f5', // Màu nền item khi hover
            controlItemBgActive: '#f0f0f0', // Màu nền item khi active
            marginXS: 4, // Margin nhỏ
            paddingXS: 12 // Padding nhỏ
          },
          Menu: {
            itemSelectedBg: '#f0f0f0', // Màu nền item được chọn
            itemSelectedColor: '#333', // Màu chữ item được chọn
            activeBarBorderWidth: 3, // Độ rộng thanh active
            itemMarginInline: 8, // Margin ngang cho item
            itemPaddingInline: 16 // Padding ngang cho item
          },
          Pagination: {
            // itemActiveBg: '#F5F5F5', // Màu nền item active
            itemSize: 32 // Kích thước item
          }
        }
      }}
    >
      <ToastContainer
        position='bottom-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppRouter />
    </ConfigProvider>
  </Provider>
  // {/* </React.StrictMode> */}
);
