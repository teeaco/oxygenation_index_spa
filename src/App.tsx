import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppNavbar } from './components/AppNavbar';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { ServicesPage } from './pages/ServicesPage';
import { ROUTES } from './routes';

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
        <Route path={`${ROUTES.SERVICES}/:id`} element={<ServiceDetailsPage />} />
        <Route path='/home' element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
