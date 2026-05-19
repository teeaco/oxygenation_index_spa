import type { RequestResponse } from '../api/generated/Api';

export type UiRequestStatus = 'draft' | 'formed' | 'completed' | 'rejected';

export const getRequestStatus = (request: RequestResponse): UiRequestStatus => {
  const resultText = (request.result ?? '').toLowerCase();

  if (!request.formed_at) return 'draft';
  if (request.completed_at) {
    if (resultText.includes('reject') || resultText.includes('отклон') || resultText.includes('отказ')) {
      return 'rejected';
    }
    return 'completed';
  }
  return 'formed';
};

export const isDraftRequest = (request: RequestResponse): boolean => getRequestStatus(request) === 'draft';

export const requestStatusLabel = (status: UiRequestStatus): string => {
  switch (status) {
    case 'draft':
      return 'Черновик';
    case 'formed':
      return 'Сформирована';
    case 'completed':
      return 'Завершена';
    case 'rejected':
      return 'Отклонена';
    default:
      return status;
  }
};
