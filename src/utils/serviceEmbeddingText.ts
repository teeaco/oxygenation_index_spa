import type { Service } from '../types/service';
import { getEnglishShortDescription, isEnglishText } from './serviceEnglishText';

const toSentence = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const getServiceEmbeddingText = (service: Service): string => {
  if (service.embeddingText?.trim() && isEnglishText(service.embeddingText)) {
    return toSentence(service.embeddingText);
  }

  const combined = toSentence(getEnglishShortDescription(service));

  return combined || `Service ${service.id}`;
};
