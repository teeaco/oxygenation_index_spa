import { SERVICES_MOCK } from '../data/servicesMock';
import { resolveMediaUrl } from '../config/runtime';
import type { CartSummary, Service } from '../types/service';
import { http } from './http';

interface ServicesQuery {
  oxygenationIndex?: string | number;
}

const toStringValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const normalizeOxygenationIndex = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;

  const source = typeof value === 'string' ? value.trim().replace(',', '.') : String(value);
  if (!source) return undefined;

  const numeric = Number(source);
  return Number.isFinite(numeric) ? String(numeric) : undefined;
};

const getLegacyBenchmarkQuery = (normalizedIndex?: string): string | undefined => {
  if (!normalizedIndex) return undefined;

  const numeric = Number(normalizedIndex);
  if (!Number.isFinite(numeric)) return normalizedIndex;

  if (numeric > 300) return '300';
  if (numeric > 200) return '201-300';
  if (numeric > 100) return '101-200';
  return '100';
};

const buildApiUrl = (path: string, query?: Record<string, string | undefined>): string => {
  const url = new URL(path, 'http://frontend.local');

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
  }

  return `${url.pathname}${url.search}`;
};

const getAsArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.services)) return record.services;
  }

  return [];
};

const mapService = (raw: unknown): Service => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  return {
    id: Number(source.id ?? 0),
    name: toStringValue(source.name),
    benchmark: toStringValue(source.benchmark ?? source.indexRange ?? source.index_range),
    shortDescription: toStringValue(
      source.shortDescription ?? source.short_description ?? source.description_short ?? source.description,
    ),
    shortDescriptionEn: toStringValue(
      source.shortDescriptionEn ??
        source.short_description_en ??
        source.description_en ??
        source.clip_description,
    ),
    fullDescription: toStringValue(
      source.fullDescription ?? source.full_description ?? source.description_full ?? source.description,
    ),
    clinicalSigns: toStringValue(source.clinicalSigns ?? source.clinical_signs),
    recommendations: toStringValue(source.recommendations),
    availableDate: toStringValue(source.availableDate ?? source.available_date),
    imageUrl: resolveMediaUrl(toStringValue(source.imageUrl ?? source.image_url ?? source.image)),
    videoUrl: resolveMediaUrl(toStringValue(source.videoUrl ?? source.video_url ?? source.video)),
    embeddingText: toStringValue(source.embeddingText ?? source.embedding_text ?? source.clip_text) || undefined,
    indexMin: toNullableNumber(source.indexMin ?? source.index_min),
    indexMax: toNullableNumber(source.indexMax ?? source.index_max),
  };
};

const mapCartSummary = (raw: unknown): CartSummary => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const count = Number(source.count ?? source.badge ?? source.items_count ?? 0);
  const requestId = toNullableNumber(source.requestId ?? source.request_id ?? source.lastRequestId ?? source.last_request_id);

  return {
    count: Number.isFinite(count) ? Math.max(0, count) : 0,
    requestId,
  };
};

const matchesOxygenationIndex = (service: Service, rawIndex?: string | number): boolean => {
  const normalized = normalizeOxygenationIndex(rawIndex);
  if (!normalized) return true;

  const index = Number(normalized);
  const minOk = service.indexMin === null || index >= service.indexMin;
  const maxOk = service.indexMax === null || index <= service.indexMax;
  return minOk && maxOk;
};

const getMockCartSummary = (): CartSummary => ({
  count: 0,
  requestId: null,
});

export const ServicesApi = {
  async getServices(query: ServicesQuery = {}): Promise<Service[]> {
    const normalizedIndex = normalizeOxygenationIndex(query.oxygenationIndex);
    const legacyQuery = getLegacyBenchmarkQuery(normalizedIndex);
    const path = buildApiUrl('/services', {
      oxygenationIndex: normalizedIndex,
      query: legacyQuery ?? normalizedIndex,
    });

    try {
      const response = await http.get(path);
      const services = getAsArray(response.data).map(mapService);
      return services.filter((service) => matchesOxygenationIndex(service, normalizedIndex));
    } catch {
      return SERVICES_MOCK.filter((service) => matchesOxygenationIndex(service, normalizedIndex));
    }
  },

  async getServiceById(id: number): Promise<Service | undefined> {
    const path = buildApiUrl(`/services/${id}`);

    try {
      const response = await http.get(path);
      return mapService(response.data);
    } catch {
      return SERVICES_MOCK.find((service) => service.id === id);
    }
  },

  async getCartSummary(): Promise<CartSummary> {
    const path = buildApiUrl('/oxygenation_request/cart');

    try {
      const response = await http.get(path);
      return mapCartSummary(response.data);
    } catch {
      return getMockCartSummary();
    }
  },
};
