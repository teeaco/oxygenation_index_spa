import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { registerSW } from 'virtual:pwa-register';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import { syncRequestsApiSecurity } from './api/generated';
import { store } from './store';

syncRequestsApiSecurity();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  registerSW();
}
