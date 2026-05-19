import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, loginUserThunk } from '../store/slices/authSlice';
import { loadDraftSummaryThunk } from '../store/slices/draftSlice';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await dispatch(
      loginUserThunk({
        login: login.trim(),
        password: password.trim(),
      }),
    );

    if (loginUserThunk.fulfilled.match(result)) {
      await dispatch(loadDraftSummaryThunk());
      navigate(ROUTES.SERVICES);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={ROUTES.SERVICES} replace />;
  }

  return (
    <main className='container auth-page'>
      <h1 className='page-title'>Вход</h1>
      <form className='auth-form' onSubmit={handleSubmit}>
        <label className='auth-label' htmlFor='login'>
          Логин
        </label>
        <input
          id='login'
          className='search-input'
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          autoComplete='username'
          required
        />

        <label className='auth-label' htmlFor='password'>
          Пароль
        </label>
        <input
          id='password'
          className='search-input'
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete='current-password'
          required
        />

        {error ? <Alert variant='warning'>{error}</Alert> : null}

        <button className='search-btn auth-submit' type='submit' disabled={loading}>
          {loading ? (
            <>
              <Spinner size='sm' animation='border' /> Выполняется вход...
            </>
          ) : (
            'Войти'
          )}
        </button>
      </form>

      <p className='auth-hint'>
        Нет аккаунта? <Link to={ROUTES.REGISTER}>Зарегистрироваться</Link>
      </p>
    </main>
  );
};
