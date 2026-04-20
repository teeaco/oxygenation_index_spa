export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  REQUESTS: '/oxygenation_request',
} as const;

export type RouteKey = keyof typeof ROUTES;

export const ROUTE_LABELS: Record<RouteKey, string> = {
  HOME: 'Главная',
  SERVICES: 'Услуги',
  REQUESTS: 'Заявка',
};
