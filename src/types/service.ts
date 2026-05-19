export interface Service {
  id: number;
  name: string;
  benchmark: string;
  shortDescription: string;
  shortDescriptionEn: string;
  fullDescription: string;
  clinicalSigns: string;
  recommendations: string;
  availableDate: string;
  imageUrl: string;
  videoUrl: string;
  embeddingText?: string;
  // PaO2/FiO2 bounds for oxygenation filtering.
  indexMin: number | null;
  indexMax: number | null;
}

export interface ServiceFiltersState {
  oxygenationIndex: string;
}

export interface CartSummary {
  count: number;
  requestId: number | null;
}
