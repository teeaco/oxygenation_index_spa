import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Service } from '../types/service';
import { cosineSimilarity } from '../utils/cosineSimilarity';
import { getServiceEmbeddingText } from '../utils/serviceEmbeddingText';

interface ClipProgressMessage {
  status?: string;
  progress?: number;
}

interface ClipWorkerProgressEvent {
  type: 'progress';
  data: ClipProgressMessage;
}

interface ClipWorkerTextEmbeddingsEvent {
  type: 'text_embeddings_ready';
  data: Record<string, number[]>;
}

interface ClipWorkerImageEmbeddingEvent {
  type: 'image_embedding_ready';
  data: number[];
}

interface ClipWorkerErrorEvent {
  type: 'error';
  data: string;
}

type ClipWorkerEvent =
  | ClipWorkerProgressEvent
  | ClipWorkerTextEmbeddingsEvent
  | ClipWorkerImageEmbeddingEvent
  | ClipWorkerErrorEvent;

export interface RankedService {
  service: Service;
  similarity: number;
}

const toPercent = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;

  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return Math.min(100, Math.max(0, Math.round(percent)));
};

const toEmbeddingMap = (raw: Record<string, number[]>): Record<number, number[]> =>
  Object.entries(raw).reduce<Record<number, number[]>>((acc, [serviceId, embedding]) => {
    const numericId = Number(serviceId);
    if (Number.isFinite(numericId) && Array.isArray(embedding) && embedding.length > 0) {
      acc[numericId] = embedding;
    }

    return acc;
  }, {});

export const useClipEmbeddings = (services: Service[]) => {
  const workerRef = useRef<Worker | null>(null);
  const [textEmbeddings, setTextEmbeddings] = useState<Record<number, number[]>>({});
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [clipProgress, setClipProgress] = useState(0);
  const [clipError, setClipError] = useState<string | null>(null);

  useEffect(() => {
    if (!services.length) return;

    const worker = new Worker(new URL('../workers/clip.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<ClipWorkerEvent>) => {
      const message = event.data;

      if (message.type === 'progress') {
        setClipError(null);
        setClipProgress(toPercent(message.data?.progress));
        return;
      }

      if (message.type === 'text_embeddings_ready') {
        setTextEmbeddings(toEmbeddingMap(message.data));
        setClipProgress(100);
        return;
      }

      if (message.type === 'image_embedding_ready') {
        setImageEmbedding(Array.isArray(message.data) ? message.data : null);
        return;
      }

      if (message.type === 'error') {
        setClipError(message.data || 'CLIP worker error');
      }
    };

    worker.postMessage({
      type: 'init',
      data: services.map((service) => ({
        id: service.id,
        text: getServiceEmbeddingText(service),
      })),
    });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [services]);

  const textEmbeddingsReady = useMemo(
    () => services.length > 0 && services.every((service) => Array.isArray(textEmbeddings[service.id])),
    [services, textEmbeddings],
  );

  const clipInitializing = services.length > 0 && !textEmbeddingsReady && !clipError;

  const imageRankedServices = useMemo<RankedService[]>(() => {
    if (!imageEmbedding) return [];

    return services
      .map((service) => {
        const serviceEmbedding = textEmbeddings[service.id];
        const similarity = serviceEmbedding ? cosineSimilarity(imageEmbedding, serviceEmbedding) : 0;

        return {
          service,
          similarity,
        };
      })
      .sort((left, right) => right.similarity - left.similarity);
  }, [imageEmbedding, services, textEmbeddings]);

  const imageScoresById = useMemo<Record<number, number>>(
    () =>
      imageRankedServices.reduce<Record<number, number>>((acc, item) => {
        acc[item.service.id] = item.similarity;
        return acc;
      }, {}),
    [imageRankedServices],
  );

  const getRelatedServices = useCallback(
    (serviceId: number, limit = 3): RankedService[] => {
      const baseEmbedding = textEmbeddings[serviceId];
      if (!baseEmbedding) return [];

      return services
        .filter((candidate) => candidate.id !== serviceId)
        .map((candidate) => {
          const candidateEmbedding = textEmbeddings[candidate.id];
          const similarity = candidateEmbedding ? cosineSimilarity(baseEmbedding, candidateEmbedding) : 0;

          return {
            service: candidate,
            similarity,
          };
        })
        .sort((left, right) => right.similarity - left.similarity)
        .slice(0, limit);
    },
    [services, textEmbeddings],
  );

  const searchByImage = useCallback((file: File) => {
    if (!workerRef.current) return;

    setClipError(null);
    workerRef.current.postMessage({
      type: 'image',
      data: file,
    });
  }, []);

  const resetImageSearch = useCallback(() => {
    setImageEmbedding(null);
  }, []);

  return {
    clipProgress,
    clipInitializing,
    clipError,
    textEmbeddingsReady,
    hasImageQuery: Boolean(imageEmbedding),
    imageRankedServices,
    imageScoresById,
    getRelatedServices,
    searchByImage,
    resetImageSearch,
  };
};
