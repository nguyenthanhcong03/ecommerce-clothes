import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import App from './App.jsx';
import i18n from './i18n.js';
import './index.css';
import { store } from '@/redux/store.js';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </Provider>
  // </StrictMode>
);
