import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

export const NotFoundPage = () => {
  return (
    <main className='container home-page'>
      <h1 className='page-title'>404</h1>
      <section className='home-panel'>
        <p>Страница не найдена.</p>
        <Link to={ROUTES.HOME} className='btn-primary-link'>
          Вернуться на главную
        </Link>
      </section>
    </main>
  );
};
