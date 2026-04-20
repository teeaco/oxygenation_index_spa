export interface Service {
  id: number;
  name: string;
  benchmark: string;
  shortDescription: string;
  fullDescription: string;
  clinicalSigns: string;
  recommendations: string;
  availableDate: string;
  imageUrl: string;
  videoUrl: string;
  // Границы коэффициента PaO2/FiO2 для фильтрации по степени
  indexMin: number | null;
  indexMax: number | null;
}

export interface ServiceFiltersState {
  oxygenationIndex: string;
}

export interface OxygenationRequest {
  id: number;
  patientName: string;
  bloodValuePaO2: string;
  fiO2Value: string;
  mmComment: string;
  mmCoefficient: number;
  diagnosisLabel: string;
  serviceIds: number[];
  diagnosisServiceId: number;
}
