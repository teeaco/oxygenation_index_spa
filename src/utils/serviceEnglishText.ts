import type { Service } from '../types/service';

const DEFAULT_SHORT_DESCRIPTION_EN_BY_ID: Record<number, string> = {
  1: 'Normal oxygenation with stable gas exchange.',
  2: 'Mild respiratory failure with reduced oxygenation.',
  3: 'Moderate respiratory failure with ARDS signs.',
  4: 'Severe respiratory failure with critical hypoxemia.',
};

const hasCyrillic = (value: string): boolean => /[А-Яа-яЁё]/.test(value);

const toSentence = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const getEnglishShortDescription = (service: Pick<Service, 'id' | 'shortDescriptionEn'>): string => {
  const fromApi = toSentence(service.shortDescriptionEn || '');
  if (fromApi && !hasCyrillic(fromApi)) {
    return fromApi;
  }

  if (DEFAULT_SHORT_DESCRIPTION_EN_BY_ID[service.id]) {
    return DEFAULT_SHORT_DESCRIPTION_EN_BY_ID[service.id];
  }

  return 'Respiratory oxygenation status.';
};

export const isEnglishText = (value: string): boolean => {
  const normalized = toSentence(value);
  return Boolean(normalized) && !hasCyrillic(normalized);
};
