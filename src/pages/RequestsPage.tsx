import { useCallback, useEffect, useMemo } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { reviewRequestThunk } from '../store/slices/requestSlice';
import {
  fetchRequestsThunk,
  resetRequestsFilters,
  setCreatorFilter,
  setFormedFromFilter,
  setFormedToFilter,
  setStatusFilter,
} from '../store/slices/requestsListSlice';
import { formatDateTimeRu } from '../utils/dateFormat';
import { getRequestStatus, requestStatusLabel } from '../utils/requestStatus';

export const RequestsPage = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items, loading, error, filters } = useAppSelector((state) => state.requestsList);

  const isModerator = user?.role === 'moderator';

  const fetchRequestsList = useCallback(async () => {
    await dispatch(fetchRequestsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchRequestsList();
  }, [fetchRequestsList, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isModerator) return;

    const timer = window.setInterval(() => {
      void fetchRequestsList();
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [fetchRequestsList, isAuthenticated, isModerator, filters.status, filters.formedFrom, filters.formedTo]);

  const filteredItems = useMemo(() => {
    const creatorFilter = filters.creatorFilter.trim().toLowerCase();
    if (!creatorFilter) return items;
    return items.filter((item) => (item.creator_login ?? '').toLowerCase().includes(creatorFilter));
  }, [filters.creatorFilter, items]);

  const requestsWithResult = useMemo(
    () => filteredItems.filter((item) => Boolean(item.result && item.result.trim())).length,
    [filteredItems],
  );

  if (!isAuthenticated) {
    return (
      <main className='container'>
        <Alert variant='warning'>
          Для просмотра заявок выполните <Link to={ROUTES.LOGIN}>вход</Link>.
        </Alert>
      </main>
    );
  }

  const handleApplyFilters = async () => {
    await fetchRequestsList();
  };

  const handleResetFilters = async () => {
    dispatch(resetRequestsFilters());
    await fetchRequestsList();
  };

  const handleReview = async (id: number, action: 'complete' | 'reject') => {
    await dispatch(reviewRequestThunk({ id, action }));
    await fetchRequestsList();
  };

  return (
    <main className='container'>
      <h1 className='page-title'>Заявки</h1>

      <section className='request-meta-card'>
        <div className='request-meta-grid'>
          <div className='meta-item'>
            <span className='meta-label'>Дата формирования: с</span>
            <input
              className='search-input'
              type='date'
              value={filters.formedFrom}
              onChange={(event) => dispatch(setFormedFromFilter(event.target.value))}
            />
          </div>

          <div className='meta-item'>
            <span className='meta-label'>Дата формирования: по</span>
            <input
              className='search-input'
              type='date'
              value={filters.formedTo}
              onChange={(event) => dispatch(setFormedToFilter(event.target.value))}
            />
          </div>

          <div className='meta-item'>
            <span className='meta-label'>Статус</span>
            <select
              className='search-input'
              value={filters.status}
              onChange={(event) => dispatch(setStatusFilter(event.target.value as '' | 'formed' | 'completed' | 'rejected'))}
            >
              <option value=''>Все статусы</option>
              <option value='formed'>Сформирована</option>
              <option value='completed'>Завершена</option>
              <option value='rejected'>Отклонена</option>
            </select>
          </div>

          {isModerator ? (
            <div className='meta-item'>
              <span className='meta-label'>Логин создателя</span>
              <input
                className='search-input'
                value={filters.creatorFilter}
                onChange={(event) => dispatch(setCreatorFilter(event.target.value))}
                placeholder='Например, student1'
              />
            </div>
          ) : null}
        </div>

        <div className='request-actions'>
          <button className='search-btn' type='button' disabled={loading} onClick={handleApplyFilters}>
            Применить фильтры
          </button>
          <button className='search-btn' type='button' disabled={loading} onClick={handleResetFilters}>
            Сбросить
          </button>
        </div>
      </section>

      <p className='search-request-meta'>
        Найдено заявок: {filteredItems.length}. С непустым итогом: {requestsWithResult}.
      </p>
      {isModerator ? <p className='search-request-meta'>Автообновление каждые 5 секунд.</p> : null}

      {error ? <Alert variant='warning'>{error}</Alert> : null}
      {loading ? (
        <div className='loading-block'>
          <Spinner animation='border' />
        </div>
      ) : (
        <section className='requests-compact-list'>
          {filteredItems.length ? (
            filteredItems.map((item) => {
              const id = item.id ?? 0;
              const status = getRequestStatus(item);

              return (
                <article key={id} className='request-compact-card'>
                  <div className='request-compact-main'>
                    <span className='request-compact-id'>#{id}</span>
                    <span className='request-compact-status'>{requestStatusLabel(status)}</span>
                    <span className='request-compact-owner'>{item.creator_login ?? '-'}</span>
                    <span className='request-compact-date'>{formatDateTimeRu(item.created_at)}</span>
                    <span className='request-compact-date'>{formatDateTimeRu(item.formed_at)}</span>
                    <span className='request-compact-topic'>{item.patient_name || '-'}</span>
                  </div>

                  <div className='requests-actions-cell'>
                    <Link className='search-btn table-btn' to={`${ROUTES.REQUEST_DETAILS_BASE}/${id}`}>
                      Открыть
                    </Link>
                    {isModerator && status === 'formed' ? (
                      <>
                        <button className='search-btn table-btn' type='button' onClick={() => handleReview(id, 'complete')}>
                          Завершить
                        </button>
                        <button
                          className='search-btn table-btn request-delete-btn'
                          type='button'
                          onClick={() => handleReview(id, 'reject')}
                        >
                          Отклонить
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })
          ) : (
            <p className='empty-state'>По выбранным фильтрам заявки не найдены.</p>
          )}
        </section>
      )}
    </main>
  );
};
