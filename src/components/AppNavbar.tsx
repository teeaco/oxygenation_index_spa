import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { appRuntime } from '../config/runtime';
import { ROUTES } from '../routes';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUserThunk } from '../store/slices/authSlice';
import { loadDraftSummaryThunk } from '../store/slices/draftSlice';

const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `header-link ${isActive ? 'header-link-active' : ''}`;

export const AppNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const { loading: draftLoading, hasDraft, itemsCount, requestId } = useAppSelector((state) => state.draft);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isTauriGuest = appRuntime.isTauriGuest;

  useEffect(() => {
    if (isTauriGuest) return;
    if (!isAuthenticated) return;
    void dispatch(loadDraftSummaryThunk());
  }, [dispatch, isAuthenticated, isTauriGuest]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMobileMenu();
    await dispatch(logoutUserThunk());
    navigate(ROUTES.SERVICES);
  };

  const handleDraftOpen = async () => {
    closeMobileMenu();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const result = await dispatch(loadDraftSummaryThunk());
    if (loadDraftSummaryThunk.fulfilled.match(result) && result.payload.hasDraft && result.payload.requestId) {
      navigate(`${ROUTES.REQUEST_DETAILS_BASE}/${result.payload.requestId}`);
    }
  };

  const canOpenDraft = isAuthenticated && hasDraft && Boolean(requestId);

  return (
    <header className='header atlas-header'>
      <div className='header-container header-container-lab7'>
        <div className='header-top-row'>
          <div className='header-brand'>
            <Link to={ROUTES.SERVICES} className='btn-home' aria-label='На страницу услуг' onClick={closeMobileMenu}>
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

            <p className='header-title'>Расчет индекса оксигенации</p>
          </div>

          <button
            type='button'
            className='header-burger'
            aria-label='Открыть меню'
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`header-bottom-row ${mobileMenuOpen ? 'header-bottom-row-open' : ''}`}>
          <nav className='header-nav'>
            <NavLink className={getNavLinkClass} to={ROUTES.SERVICES} onClick={closeMobileMenu}>
              Список услуг
            </NavLink>
            {isTauriGuest ? (
              <NavLink className={getNavLinkClass} to={ROUTES.ABOUT} onClick={closeMobileMenu}>
                О приложении
              </NavLink>
            ) : null}
            {!isTauriGuest ? (
              <>
                <NavLink className={getNavLinkClass} to={ROUTES.REQUESTS} onClick={closeMobileMenu}>
                  Мои заявки
                </NavLink>
                <button
                  type='button'
                  className={`header-link header-link-draft ${!canOpenDraft ? 'header-link-disabled' : ''}`}
                  onClick={handleDraftOpen}
                  disabled={draftLoading || !canOpenDraft}
                >
                  Черновик ({draftLoading ? '...' : itemsCount})
                </button>
              </>
            ) : null}
          </nav>

          {!isTauriGuest ? (
            <div className='header-auth'>
              {isAuthenticated ? (
                <>
                  <span className='header-user' title={user?.fullName || user?.login}>
                    {user?.fullName || user?.login}
                  </span>
                  <button type='button' className='header-auth-btn' onClick={handleLogout} disabled={loading || draftLoading}>
                    {loading ? 'Выход...' : 'Выход'}
                  </button>
                </>
              ) : (
                <>
                  <Link className='header-auth-btn' to={ROUTES.LOGIN} onClick={closeMobileMenu}>
                    Вход
                  </Link>
                  <Link className='header-auth-btn header-auth-btn-secondary' to={ROUTES.REGISTER} onClick={closeMobileMenu}>
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
