import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, registerUserThunk } from '../store/slices/authSlice';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [login, setLogin] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (password.trim().length < 4) {
      setLocalError('Пароль должен содержать минимум 4 символа.');
      return;
    }

    const result = await dispatch(
      registerUserThunk({
        login: login.trim(),
        fullName: fullName.trim(),
        password: password.trim(),
      }),
    );

    if (registerUserThunk.fulfilled.match(result)) {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <main className='container auth-page'>
      <h1 className='page-title'>Регистрация</h1>
      <form className='auth-form' onSubmit={handleSubmit}>
        <label className='auth-label' htmlFor='register-login'>
          Логин
        </label>
        <input
          id='register-login'
          className='search-input'
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          autoComplete='username'
          required
        />

        <label className='auth-label' htmlFor='register-name'>
          ФИО
        </label>
        <input
          id='register-name'
          className='search-input'
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete='name'
          required
        />

        <label className='auth-label' htmlFor='register-password'>
          Пароль
        </label>
        <input
          id='register-password'
          className='search-input'
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete='new-password'
          required
        />

        {localError ? <Alert variant='warning'>{localError}</Alert> : null}
        {error ? <Alert variant='warning'>{error}</Alert> : null}

        <button className='search-btn auth-submit' type='submit' disabled={loading}>
          {loading ? (
            <>
              <Spinner size='sm' animation='border' /> Выполняется регистрация...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </button>
      </form>

      <p className='auth-hint'>
        Уже зарегистрированы? <Link to={ROUTES.LOGIN}>Войти</Link>
      </p>
    </main>
  );
};
