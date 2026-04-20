import type { SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/default-service.svg';
import { ROUTES } from '../routes';
import type { Service } from '../types/service';

interface ServiceCardProps {
  service: Service;
  requestId: number;
}

export const ServiceCard = ({ service, requestId }: ServiceCardProps) => {
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = defaultImage;
  };

  return (
    <Link
      to={`${ROUTES.SERVICES}/${service.id}`}
      className='card'
      data-service-id={service.id}
      data-request-id={requestId}
      data-image-url={service.imageUrl}
      data-video-url={service.videoUrl}
    >
      <div className='card-image'>
        <img src={service.imageUrl || defaultImage} alt={service.name} onError={handleImageError} />
      </div>

      <div className='card-content'>
        <h3 className='card-title'>{service.name}</h3>
        <p className='card-index'>{service.benchmark}</p>
        <p className='card-desc'>{service.shortDescription}</p>
      </div>
    </Link>
  );
};
