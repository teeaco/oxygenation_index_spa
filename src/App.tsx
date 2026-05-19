import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { appRuntime } from './config/runtime';
import { AppNavbar } from './components/AppNavbar';
import { GuestInfoPage } from './pages/GuestInfoPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { RequestPage } from './pages/RequestPage';
import { RequestsPage } from './pages/RequestsPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { ServicesPage } from './pages/ServicesPage';
import { ROUTES } from './routes';

function App() {
  const isTauriGuest = appRuntime.isTauriGuest;

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppNavbar />
      <Routes>
        <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.SERVICES} replace />} />
        <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
        <Route path={`${ROUTES.SERVICES}/:id`} element={<ServiceDetailsPage />} />
        <Route path={ROUTES.ABOUT} element={<GuestInfoPage />} />
        {isTauriGuest ? (
          <>
            <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.SERVICES} replace />} />
            <Route path={ROUTES.REGISTER} element={<Navigate to={ROUTES.SERVICES} replace />} />
            <Route path={ROUTES.REQUESTS} element={<Navigate to={ROUTES.SERVICES} replace />} />
            <Route path={ROUTES.REQUEST_DETAILS} element={<Navigate to={ROUTES.SERVICES} replace />} />
          </>
        ) : (
          <>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
            <Route path={ROUTES.REQUEST_DETAILS} element={<RequestPage />} />
          </>
        )}
        <Route path='/home' element={<Navigate to={ROUTES.SERVICES} replace />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
