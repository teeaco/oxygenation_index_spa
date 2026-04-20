import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

export const HomePage = () => {
  return (
    <main className='container home-page'>
      <section className='home-panel'>
        <Link to={ROUTES.SERVICES} className='btn-primary-link'>
          Перейти к услугам
        </Link>
      </section>
    </main>
  );
};
