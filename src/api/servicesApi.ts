import { REQUESTS_MOCK } from '../data/requestsMock';
import { SERVICES_MOCK } from '../data/servicesMock';
import type { OxygenationRequest, Service } from '../types/service';

const emulateRequest = async (ms = 250): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const ServicesApi = {
  async getServices(): Promise<Service[]> {
    await emulateRequest();
    return SERVICES_MOCK;
  },

  async getServiceById(id: number): Promise<Service | undefined> {
    await emulateRequest();
    return SERVICES_MOCK.find((service) => service.id === id);
  },

  async getRequestById(id: number): Promise<OxygenationRequest | undefined> {
    await emulateRequest();
    return REQUESTS_MOCK.find((request) => request.id === id);
  },
};
