import { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { ServicesApi } from '../api/servicesApi';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceFilters } from '../components/ServiceFilters';
import type { Service } from '../types/service';

const matchesOxygenationIndex = (service: Service, rawIndex: string): boolean => {
  if (!rawIndex.trim()) return true;

  const index = Number(rawIndex);
  if (!Number.isFinite(index)) return true;

  const minOk = service.indexMin === null || index >= service.indexMin;
  const maxOk = service.indexMax === null || index <= service.indexMax;

  return minOk && maxOk;
};

export const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [appliedIndex, setAppliedIndex] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      setLoading(true);
      const items = await ServicesApi.getServices();

      if (isMounted) {
        setServices(items);
        setLoading(false);
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => matchesOxygenationIndex(service, appliedIndex));
  }, [services, appliedIndex]);

  return (
    <>
      <div className='top-tools'>
        <button
          type='button'
          className='cart-icon-link cart-icon-link-disabled'
          aria-label='Корзина пуста'
          disabled
        >
          <span className='cart-icon' aria-hidden='true'>
            <svg viewBox='0 0 24 24'>
              <path
                d='M3 5h2l1.1 8.2a2 2 0 0 0 2 1.8h8.7a2 2 0 0 0 2-1.6L20 8H7'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <circle cx='10' cy='19' r='1.5' fill='currentColor' />
              <circle cx='17' cy='19' r='1.5' fill='currentColor' />
            </svg>
          </span>
          <span className='cart-badge'>0</span>
        </button>
      </div>

      <ServiceFilters
        oxygenationIndex={searchInput}
        onOxygenationIndexChange={setSearchInput}
        onSubmit={() => setAppliedIndex(searchInput)}
      />

      <main className='container'>
        <BreadCrumbs crumbs={[{ label: 'Услуги' }]} />
        <h1 className='page-title'>Степени оксигенации</h1>

        {loading ? (
          <div className='loading-block'>
            <Spinner animation='border' />
          </div>
        ) : (
          <div className='cards-grid'>
            {filteredServices.length ? (
              filteredServices.map((service) => <ServiceCard key={service.id} service={service} requestId={0} />)
            ) : (
              <p className='empty-state'>По вашему запросу ничего не найдено.</p>
            )}
          </div>
        )}
      </main>
    </>
  );
};
