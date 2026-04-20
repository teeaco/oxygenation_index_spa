import type { SyntheticEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { ServicesApi } from '../api/servicesApi';
import defaultImage from '../assets/default-service.svg';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ROUTES } from '../routes';
import type { OxygenationRequest, Service } from '../types/service';

export const RequestPage = () => {
  const [request, setRequest] = useState<OxygenationRequest | undefined>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    const loadData = async () => {
      setLoading(true);
      const [requestData, servicesData] = await Promise.all([
        ServicesApi.getRequestById(numericId),
        ServicesApi.getServices(),
      ]);

      setRequest(requestData);
      setServices(servicesData);
      setLoading(false);
    };

    loadData();
  }, [id]);

  const requestServices = useMemo(() => {
    if (!request) return [];

    const map = new Map(services.map((service) => [service.id, service]));
    return request.serviceIds
      .map((serviceId) => map.get(serviceId))
      .filter((service): service is Service => Boolean(service));
  }, [request, services]);

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = defaultImage;
  };

  if (loading) {
    return (
      <main className='container'>
        <BreadCrumbs
          crumbs={[
            { label: 'Услуги', path: ROUTES.SERVICES },
            { label: 'Заявка' },
          ]}
        />
        <div className='loading-block'>
          <Spinner animation='border' />
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className='container'>
        <BreadCrumbs
          crumbs={[
            { label: 'Услуги', path: ROUTES.SERVICES },
            { label: 'Заявка' },
          ]}
        />
        <p className='empty-state'>Заявка не найдена.</p>
      </main>
    );
  }

  return (
    <main className='container'>
      <BreadCrumbs
        crumbs={[
          { label: 'Услуги', path: ROUTES.SERVICES },
          { label: `Заявка #${request.id}` },
        ]}
      />

      <section className='request-unified-card'>
        <h1 className='request-title-main'>Пациент: {request.patientName}</h1>

        <div className='request-meta-grid'>
          <div className='meta-item'>
            <span className='meta-label'>PaO2</span>
            <span className='meta-value'>{request.bloodValuePaO2}</span>
          </div>
          <div className='meta-item'>
            <span className='meta-label'>FiO2</span>
            <span className='meta-value'>{request.fiO2Value}</span>
          </div>
          <div className='meta-item'>
            <span className='meta-label'>ID oxygenation_request</span>
            <span className='meta-value'>{request.id}</span>
          </div>
          <div className='meta-item'>
            <span className='meta-label'>Текущая степень</span>
            <span className='meta-value'>{request.diagnosisLabel}</span>
          </div>
        </div>

        <div className='request-result-divider' />

        <div className='mm-result-row'>
          <span className='mm-label'>Индекс оксигенации:</span>
          <span className='mm-value'>{request.mmCoefficient.toFixed(1)}</span>
        </div>
        <div className='mm-result-row'>
          <span className='mm-label'>Степень по результату:</span>
          <span className='mm-value'>{request.diagnosisLabel}</span>
        </div>

        <p className='mm-comment'>Комментарий врача: {request.mmComment}</p>

        <button type='button' className='request-delete-btn'>
          Удалить
        </button>
      </section>

      <section className='request-services'>
        <h2>Степени оксигенации</h2>

        <div className='service-card service-card-header'>
          <div className='service-row service-row-header'>
            <span className='service-field'>Степень оксигенации</span>
            <span className='service-field'>Изображение</span>
            <span className='service-field'>Диапазон индекса</span>
          </div>
        </div>

        {requestServices.map((service) => (
          <div
            key={service.id}
            className={`service-card ${service.id === request.diagnosisServiceId ? 'service-active' : ''}`}
            data-service-id={service.id}
            data-image-url={service.imageUrl}
            data-video-url={service.videoUrl}
          >
            <div className='service-row'>
              <span className='service-field'>
                <Link to={`${ROUTES.SERVICES}/${service.id}`} className='service-link'>
                  {service.name}
                </Link>
              </span>
              <span className='service-field'>
                <img
                  className='service-thumb'
                  src={service.imageUrl || defaultImage}
                  alt={service.name}
                  onError={handleImageError}
                />
              </span>
              <span className='service-field'>{service.benchmark}</span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};
