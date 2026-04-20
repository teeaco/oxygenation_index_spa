import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

export const AppNavbar = () => {
  return (
    <header className='header'>
      <div className='header-container'>
        <Link to={ROUTES.SERVICES} className='btn-home' aria-label='На страницу услуг'>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path
              d='M3 10.5L12 3l9 7.5'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M6.5 10v9.5h11V10'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M10 19.5v-5h4v5'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </Link>

        <p className='header-title'>Степени оксигенации</p>

        <span className='header-spacer' aria-hidden='true' />
      </div>
    </header>
  );
};
