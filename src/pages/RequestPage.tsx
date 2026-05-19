import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import type { RequestServiceResponse } from '../api/generated/Api';
import defaultImage from '../assets/default-service.svg';
import { ROUTES } from '../routes';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  deleteRequestServiceThunk,
  deleteRequestThunk,
  fetchRequestByIdThunk,
  formRequestThunk,
  reviewRequestThunk,
  updateRequestServiceThunk,
  updateRequestThunk,
} from '../store/slices/requestSlice';
import { formatDateTimeRu } from '../utils/dateFormat';
import { getRequestStatus, isDraftRequest, requestStatusLabel } from '../utils/requestStatus';

type CoefficientMap = Record<number, number>;

const computePreviewCoefficient = (paO2Text: string, fiO2Text: string): number | null => {
  const paO2 = Number(paO2Text);
  const fiO2 = Number(fiO2Text);
  if (!Number.isFinite(paO2) || !Number.isFinite(fiO2) || fiO2 <= 0) {
    return null;
  }
  return Math.round((paO2 / fiO2) * 10) / 10;
};

const diagnosisByCoefficient = (coefficient: number | null): string => {
  if (coefficient === null) return 'Не рассчитана';
  if (coefficient > 300) return 'Нормальная оксигенация';
  if (coefficient > 200) return 'Легкая дыхательная недостаточность';
  if (coefficient > 100) return 'Умеренная дыхательная недостаточность (ОРДС)';
  return 'Тяжелая дыхательная недостаточность (ОРДС)';
};

export const RequestPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { current, loading, actionLoading, error } = useAppSelector((state) => state.request);

  const [patientName, setPatientName] = useState('');
  const [bloodValuePaO2, setBloodValuePaO2] = useState('');
  const [fiO2Value, setFiO2Value] = useState('');
  const [commentByServiceId, setCommentByServiceId] = useState<Record<number, string>>({});
  const [coefficientByServiceId, setCoefficientByServiceId] = useState<CoefficientMap>({});

  const numericId = Number(id);
  const requestId = Number.isFinite(numericId) ? numericId : null;

  const groupedItems = useMemo(() => {
    const uniqueItems = new Map<number, RequestServiceResponse>();
    (current?.items ?? []).forEach((item) => {
      const serviceId = item.service_id;
      if (!serviceId || uniqueItems.has(serviceId)) return;
      uniqueItems.set(serviceId, item);
    });
    return Array.from(uniqueItems.values());
  }, [current]);

  useEffect(() => {
    if (!isAuthenticated || !requestId) return;
    void dispatch(fetchRequestByIdThunk(requestId));
  }, [dispatch, isAuthenticated, requestId]);

  useEffect(() => {
    if (!current) return;

    /* eslint-disable react-hooks/set-state-in-effect */
    setPatientName(current.patient_name ?? '');
    setBloodValuePaO2(
      current.blood_value_pao2 === null || current.blood_value_pao2 === undefined ? '' : String(current.blood_value_pao2),
    );
    setFiO2Value(current.fio2_value === null || current.fio2_value === undefined ? '' : String(current.fio2_value));

    const nextComments: Record<number, string> = {};
    groupedItems.forEach((item) => {
      if (item.service_id) {
        nextComments[item.service_id] = item.doctor_comment ?? '';
      }
    });
    setCommentByServiceId(nextComments);

    setCoefficientByServiceId((prev) => {
      const next: CoefficientMap = {};
      groupedItems.forEach((item) => {
        const serviceId = item.service_id;
        if (!serviceId) return;
        if (typeof item.result_coefficient === 'number') {
          next[serviceId] = item.result_coefficient;
          return;
        }
        if (typeof prev[serviceId] === 'number') {
          next[serviceId] = prev[serviceId];
        }
      });
      return next;
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [current, groupedItems]);

  const isDraft = useMemo(() => (current ? isDraftRequest(current) : false), [current]);
  const isModerator = user?.role === 'moderator';
  const isBusy = actionLoading;

  const uiResultCoefficient = useMemo(() => {
    if (typeof current?.result_coefficient === 'number') {
      return current.result_coefficient;
    }
    return computePreviewCoefficient(bloodValuePaO2, fiO2Value);
  }, [bloodValuePaO2, current?.result_coefficient, fiO2Value]);

  const oxygenationDiagnosis = useMemo(() => diagnosisByCoefficient(uiResultCoefficient), [uiResultCoefficient]);

  if (!isAuthenticated) {
    return (
      <main className='container'>
        <Alert variant='warning'>
          Для просмотра заявки выполните <Link to={ROUTES.LOGIN}>вход</Link>.
        </Alert>
      </main>
    );
  }

  if (!requestId) {
    return <Navigate to={ROUTES.REQUESTS} replace />;
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await dispatch(
      updateRequestThunk({
        id: requestId,
        patientName: patientName.trim() || undefined,
        bloodValuePaO2: bloodValuePaO2.trim() === '' ? undefined : Number(bloodValuePaO2),
        fiO2Value: fiO2Value.trim() === '' ? undefined : Number(fiO2Value),
      }),
    );
  };

  const handleFormRequest = async () => {
    await dispatch(formRequestThunk(requestId));
  };

  const handleDeleteRequest = async () => {
    const result = await dispatch(deleteRequestThunk(requestId));
    if (deleteRequestThunk.fulfilled.match(result)) {
      navigate(ROUTES.SERVICES);
    }
  };

  const handleUpdateComment = async (serviceId: number) => {
    const doctorComment = commentByServiceId[serviceId] ?? '';
    await dispatch(
      updateRequestServiceThunk({
        requestId,
        serviceId,
        doctorComment,
      }),
    );
  };

  const handleRemoveService = async (serviceId: number) => {
    await dispatch(
      deleteRequestServiceThunk({
        requestId,
        serviceId,
      }),
    );
    await dispatch(fetchRequestByIdThunk(requestId));
  };

  const handleReview = async (action: 'complete' | 'reject') => {
    await dispatch(
      reviewRequestThunk({
        id: requestId,
        action,
      }),
    );
  };

  return (
    <main className='container'>
      {error ? <Alert variant='warning'>{error}</Alert> : null}

      {loading ? (
        <div className='loading-block'>
          <Spinner animation='border' />
        </div>
      ) : !current ? (
        <Alert variant='warning'>Заявка не найдена.</Alert>
      ) : (
        <>
          <section className='request-unified-card'>
            <h1 className='request-title-main'>Заявка #{requestId}</h1>
            <div className='request-meta-grid'>
              <div className='meta-item'>
                <span className='meta-label'>Статус</span>
                <span className='meta-value'>{requestStatusLabel(getRequestStatus(current))}</span>
              </div>
              <div className='meta-item'>
                <span className='meta-label'>Создатель</span>
                <span className='meta-value'>{current.creator_login || '-'}</span>
              </div>
              <div className='meta-item'>
                <span className='meta-label'>Дата создания</span>
                <span className='meta-value'>{formatDateTimeRu(current.created_at)}</span>
              </div>
              <div className='meta-item'>
                <span className='meta-label'>Дата формирования</span>
                <span className='meta-value'>{formatDateTimeRu(current.formed_at)}</span>
              </div>
            </div>

            <div className='request-result-divider' />
            <div className='mm-result-row'>
              <span className='mm-label'>Итог</span>
              <span className='mm-value'>{current.result || '-'}</span>
            </div>
            <div className='mm-result-row'>
              <span className='mm-label'>Коэффициент</span>
              <span className='mm-value'>{uiResultCoefficient === null ? '-' : uiResultCoefficient.toFixed(1)}</span>
            </div>
            <div className='mm-result-row'>
              <span className='mm-label'>Степень</span>
              <span className='mm-value'>{oxygenationDiagnosis}</span>
            </div>
          </section>

          <form className='auth-form request-edit-form' onSubmit={handleSave}>
            <label className='auth-label' htmlFor='patient-name'>
              Имя пациента
            </label>
            <input
              id='patient-name'
              className='search-input'
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              disabled={!isDraft || isBusy}
            />

            <label className='auth-label' htmlFor='blood-value'>
              PaO2
            </label>
            <input
              id='blood-value'
              className='search-input'
              value={bloodValuePaO2}
              onChange={(event) => setBloodValuePaO2(event.target.value)}
              disabled={!isDraft || isBusy}
            />

            <label className='auth-label' htmlFor='fio2-value'>
              FiO2
            </label>
            <input
              id='fio2-value'
              className='search-input'
              value={fiO2Value}
              onChange={(event) => setFiO2Value(event.target.value)}
              disabled={!isDraft || isBusy}
            />

            <div className='request-actions'>
              <button className='search-btn' type='submit' disabled={!isDraft || isBusy}>
                Сохранить
              </button>
              <button className='search-btn' type='button' disabled={!isDraft || isBusy} onClick={handleFormRequest}>
                Сформировать
              </button>
              <button className='search-btn request-delete-btn' type='button' disabled={!isDraft || isBusy} onClick={handleDeleteRequest}>
                Удалить черновик
              </button>
            </div>
          </form>

          <section className='request-services'>
            <h2>Услуги заявки</h2>

            <article className='service-card service-card-header'>
              <div className='service-row service-row-header service-row-extended'>
                <div className='service-field'>Услуга</div>
                <div className='service-field'>Диапазон</div>
                <div className='service-field'>Коэф.</div>
                <div className='service-field'>Комментарий</div>
                <div className='service-field'>Удалить</div>
              </div>
            </article>

            {groupedItems.length ? (
              <div className='request-items-grid'>
                {groupedItems.map((item) => {
                  const serviceId = item.service_id ?? 0;
                  const rowCoefficient = item.result_coefficient ?? coefficientByServiceId[serviceId] ?? uiResultCoefficient;

                  return (
                    <article key={`${requestId}-${serviceId}`} className='service-card service-active'>
                      <div className='service-row service-row-extended'>
                        <div className='service-field service-main-field'>
                          <img src={item.image_url || defaultImage} alt={item.service_name || 'service'} className='service-thumb' />
                          <span>{item.service_name || '-'}</span>
                        </div>

                        <div className='service-field'>{item.benchmark || '-'}</div>

                        <div className='service-field'>
                          {rowCoefficient === null || rowCoefficient === undefined ? '-' : rowCoefficient.toFixed(1)}
                        </div>

                        <div className='service-field service-comment-field'>
                          <input
                            className='search-input'
                            value={commentByServiceId[serviceId] ?? ''}
                            onChange={(event) =>
                              setCommentByServiceId((prev) => ({
                                ...prev,
                                [serviceId]: event.target.value,
                              }))
                            }
                            disabled={!isDraft || isBusy}
                            placeholder='Комментарий врача'
                          />
                          <button
                            className='search-btn table-btn'
                            type='button'
                            disabled={!isDraft || isBusy || !serviceId}
                            onClick={() => handleUpdateComment(serviceId)}
                          >
                            Сохранить
                          </button>
                        </div>

                        <div className='service-field service-actions-field'>
                          <button
                            className='icon-btn icon-btn-danger'
                            type='button'
                            disabled={!isDraft || isBusy || !serviceId}
                            onClick={() => handleRemoveService(serviceId)}
                            aria-label='Удалить услугу'
                            title='Удалить услугу'
                          >
                            <svg viewBox='0 0 24 24' aria-hidden='true'>
                              <path d='M5 7h14' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
                              <path d='M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7' stroke='currentColor' strokeWidth='1.8' />
                              <path d='M8 7l.8 11a1.8 1.8 0 0 0 1.8 1.6h2.8a1.8 1.8 0 0 0 1.8-1.6L16 7' stroke='currentColor' strokeWidth='1.8' />
                              <path d='M10.5 10.2v6.2M13.5 10.2v6.2' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className='empty-state'>В заявке пока нет услуг.</p>
            )}
          </section>

          {isModerator ? (
            <section className='request-actions'>
              <button className='search-btn' type='button' disabled={isBusy} onClick={() => handleReview('complete')}>
                Завершить
              </button>
              <button className='search-btn request-delete-btn' type='button' disabled={isBusy} onClick={() => handleReview('reject')}>
                Отклонить
              </button>
            </section>
          ) : null}

          {isBusy ? (
            <p className='clip-status'>
              <Spinner size='sm' animation='border' /> Выполняется запрос...
            </p>
          ) : null}
        </>
      )}
    </main>
  );
};
