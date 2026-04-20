import type { OxygenationRequest } from '../types/service';

export const REQUESTS_MOCK: OxygenationRequest[] = [
  {
    id: 101,
    patientName: 'Иванов И.И.',
    bloodValuePaO2: '85.5 мм рт.ст.',
    fiO2Value: '0.60 (60%)',
    mmComment: 'Состояние средней тяжести. Рекомендован повторный контроль коэффициента через 6 часов.',
    mmCoefficient: 142.5,
    diagnosisLabel: 'Умеренная ДН (ОРДС)',
    serviceIds: [1, 2, 3, 4],
    diagnosisServiceId: 3,
  },
];
