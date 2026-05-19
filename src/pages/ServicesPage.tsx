import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { ServicesApi } from '../api/servicesApi';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceFilters } from '../components/ServiceFilters';
import { appRuntime } from '../config/runtime';
import { useClipEmbeddings } from '../hooks/useClipEmbeddings';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addServiceToDraftThunk, loadDraftSummaryThunk } from '../store/slices/draftSlice';
import { applyOxygenationIndex, setOxygenationInput } from '../store/slices/servicesFiltersSlice';
import type { Service } from '../types/service';

const normalizeIndexInput = (value: string): string => {
  const source = value.trim().replace(',', '.');
  if (!source) return '';

  const numeric = Number(source);
  return Number.isFinite(numeric) ? String(numeric) : '';
};

export const ServicesPage = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { actionLoading: addToDraftLoading } = useAppSelector((state) => state.draft);
  const { oxygenationInput, appliedOxygenationIndex } = useAppSelector((state) => state.servicesFilters);
  const canEditDraft = isAuthenticated && !appRuntime.isTauriGuest;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    clipProgress,
    clipInitializing,
    clipError,
    hasImageQuery,
    imageRankedServices,
    imageScoresById,
    searchByImage,
    resetImageSearch,
  } = useClipEmbeddings(services);

  const loadServices = async (oxygenationIndex?: string): Promise<void> => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const items = await ServicesApi.getServices({
        oxygenationIndex,
      });
      setServices(items);
    } catch {
      setErrorMessage('Не удалось загрузить услуги.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadServices(appliedOxygenationIndex || undefined);
    if (isAuthenticated) {
      void dispatch(loadDraftSummaryThunk());
    }
  }, [appliedOxygenationIndex, dispatch, isAuthenticated]);

  const displayedServices = useMemo(
    () => (hasImageQuery ? imageRankedServices.map((item) => item.service) : services),
    [hasImageQuery, imageRankedServices, services],
  );

  const handleFilterSubmit = () => {
    const normalizedIndex = normalizeIndexInput(oxygenationInput);
    dispatch(applyOxygenationIndex(normalizedIndex));
    void loadServices(normalizedIndex);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    searchByImage(file);
  };

  const handleAddService = async (serviceId: number) => {
    await dispatch(addServiceToDraftThunk(serviceId));
    await dispatch(loadDraftSummaryThunk());
  };

  return (
    <>
      <ServiceFilters
        oxygenationIndex={oxygenationInput}
        onOxygenationIndexChange={(value) => dispatch(setOxygenationInput(value))}
        onSubmit={handleFilterSubmit}
      />

      <section className='clip-search-panel'>
        <h2 className='clip-search-title'>Мультимодальный поиск по изображению</h2>
        <p className='clip-search-caption'>
          Загрузите изображение, чтобы отсортировать услуги по мультимодальной релевантности CLIP.
        </p>

        <div className='clip-search-controls'>
          <input type='file' accept='image/*' onChange={handleImageChange} className='clip-file-input' />
          <button type='button' className='search-btn clip-reset-btn' onClick={resetImageSearch} disabled={!hasImageQuery}>
            Сбросить
          </button>
        </div>

        <p className='search-request-meta'>
          Текущий фильтр PaO2/FiO2: <code>{appliedOxygenationIndex || 'не задан'}</code>
        </p>
        {!canEditDraft ? <p className='search-request-meta'>Режим гостя: доступен просмотр и фильтрация услуг.</p> : null}

        {clipInitializing ? <p className='clip-status'>Загрузка CLIP-модели: {clipProgress}%</p> : null}
        {hasImageQuery ? <p className='clip-status'>Результаты отсортированы по мультимодальной релевантности.</p> : null}
        {clipError ? <p className='clip-error'>CLIP недоступен: {clipError}</p> : null}
      </section>

      <main className='container'>
        <BreadCrumbs crumbs={[]} />
        <h1 className='page-title'>Расчет индекса оксигенации</h1>

        {errorMessage ? (
          <Alert variant='warning'>{errorMessage}</Alert>
        ) : loading ? (
          <div className='loading-block'>
            <Spinner animation='border' />
          </div>
        ) : (
          <div className='cards-grid'>
            {displayedServices.length ? (
              displayedServices.map((service) => (
                <div key={service.id} className='search-card-wrapper'>
                  <ServiceCard
                    service={service}
                    showAddButton={canEditDraft}
                    addLoading={addToDraftLoading}
                    onAdd={handleAddService}
                  />
                  {hasImageQuery ? (
                    <p className='clip-score'>CLIP релевантность: {(imageScoresById[service.id] ?? 0).toFixed(3)}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className='empty-state'>По вашему запросу ничего не найдено.</p>
            )}
          </div>
        )}
      </main>
    </>
  );
};
