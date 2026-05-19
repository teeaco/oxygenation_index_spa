import type { SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/default-service.svg';
import { ROUTES } from '../routes';
import type { Service } from '../types/service';

interface ServiceCardProps {
  service: Service;
  showAddButton?: boolean;
  addLoading?: boolean;
  onAdd?: (serviceId: number) => void;
}

export const ServiceCard = ({ service, showAddButton = false, addLoading = false, onAdd }: ServiceCardProps) => {
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = defaultImage;
  };

  const handleAddClick = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onAdd?.(service.id);
  };

  const shortDescription = service.shortDescription || service.shortDescriptionEn || 'Описание отсутствует.';

  return (
    <article
      className='card'
      data-service-id={service.id}
      data-image-url={service.imageUrl}
      data-video-url={service.videoUrl}
    >
      <Link to={`${ROUTES.SERVICES}/${service.id}`} className='card-link-area'>
        <div className='card-image'>
          <img src={service.imageUrl || defaultImage} alt={service.name} onError={handleImageError} />
        </div>

        <div className='card-content'>
          <h3 className='card-title'>{service.name}</h3>
          <p className='card-index'>{service.benchmark}</p>
          <p className='card-desc'>{shortDescription}</p>
        </div>
      </Link>

      {showAddButton ? (
        <div className='card-actions'>
          <button type='button' className='search-btn card-add-btn' onClick={handleAddClick} disabled={addLoading}>
            {addLoading ? 'Добавление...' : 'Добавить в заявку'}
          </button>
        </div>
      ) : null}
    </article>
  );
};
