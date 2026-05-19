import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { ROUTES } from '../routes';

export const GuestInfoPage = () => {
  return (
    <main className='container guest-info-page'>
      <h1 className='page-title'>О приложении</h1>

      <section className='guest-info-card'>
        <img src={heroImage} alt='Иллюстрация сервиса оксигенации' className='guest-info-image' />

        <div className='guest-info-content'>
          <h2>Гостевой режим Tauri</h2>
          <p>Доступно 3 страницы: список услуг, карточка услуги и эта информационная страница.</p>
          <p>Фильтрация по индексу PaO2/FiO2 сохраняется при переходе на «Подробнее» и обратно.</p>
          <Link to={ROUTES.SERVICES} className='search-btn table-btn'>
            Перейти к услугам
          </Link>
        </div>
      </section>
    </main>
  );
};
