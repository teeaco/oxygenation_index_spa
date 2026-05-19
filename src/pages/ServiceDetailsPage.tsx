import type { SyntheticEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { ServicesApi } from '../api/servicesApi';
import defaultImage from '../assets/default-service.svg';
import { BreadCrumbs } from '../components/BreadCrumbs';
import type { Service } from '../types/service';

export const ServiceDetailsPage = () => {
  const [service, setService] = useState<Service | undefined>();
  const [loading, setLoading] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    document.body.classList.add('portrait-mode');
    return () => document.body.classList.remove('portrait-mode');
  }, []);

  useEffect(() => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    const loadService = async () => {
      setLoading(true);
      setVideoFailed(false);

      const item = await ServicesApi.getServiceById(numericId);
      setService(item);
      setLoading(false);
    };

    void loadService();
  }, [id]);

  const doctorAdvice = useMemo(() => {
    if (!service) return '';
    return service.id === 1 ? 'Без срочного визита к врачу.' : 'Нужна консультация врача.';
  }, [service]);

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = defaultImage;
  };

  return (
    <main className='container detail-page'>
      <BreadCrumbs crumbs={[{ label: service?.name ?? 'Карточка услуги' }]} />

      {loading ? (
        <div className='loading-block'>
          <Spinner animation='border' />
        </div>
      ) : service ? (
        <>
          <section className='detail-hero-card'>
            {service.videoUrl && !videoFailed ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={service.imageUrl || defaultImage}
                className='detail-hero-video'
                onError={() => setVideoFailed(true)}
              >
                <source src={service.videoUrl} type='video/mp4' />
                Ваш браузер не поддерживает видео.
              </video>
            ) : (
              <img
                className='detail-hero-video'
                src={service.imageUrl || defaultImage}
                alt={service.name}
                onError={handleImageError}
              />
            )}

            <div className='detail-hero-overlay'>
              <h1 className='detail-title'>{service.name}</h1>
              <p className='detail-index'>{service.benchmark}</p>
              <p className='detail-hero-caption'>{service.shortDescription || 'Описание отсутствует.'}</p>
              <p className='detail-hero-caption detail-hero-label'>Рекомендация врача</p>
              <p className='detail-hero-caption detail-hero-value'>{doctorAdvice}</p>
            </div>
          </section>
        </>
      ) : (
        <Alert variant='warning'>Услуга не найдена.</Alert>
      )}
    </main>
  );
};
