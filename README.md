# Front RIP SPA — Лабораторная 8

React + TypeScript + Vite приложение для расчета индекса оксигенации.

## Что реализовано по заданию

- Redux Toolkit для фильтра услуг (сохраняется при переходе `Список услуг -> Подробнее -> назад`).
- Адаптивность для 3 страниц:
  - `Список услуг`
  - `Подробнее об услуге`
  - `Список заявок`
- GitHub Pages деплой (`gh-pages`) с корректным `basename`.
- PWA (manifest + service worker через `vite-plugin-pwa`).
- HTTPS для локального запуска (`vite-plugin-mkcert`).
- Интерфейс модератора: фильтрация заявок по диапазону дат/статусу + short polling.
- Tauri guest-режим (3 страницы, без авторизации и без редактирования заявок), подключение к backend по LAN IP.

## Ветки для лабы 8

Рекомендуемые 3 ветки:

1. `lab8-pages-pwa`
2. `lab8-adaptive-redux`
3. `lab8-tauri-guest`

## Команды

```bash
npm install
npm run dev
npm run build
npm run build:pages
npm run deploy
npm run tauri:dev
npm run tauri:build
```

## Конфиги окружений

- `.env` — обычный web/dev режим
- `.env.pages` — сборка под GitHub Pages
- `.env.tauri` — сборка под Tauri (LAN IP, не localhost)

## Где смотреть реализацию

- Runtime-переключение target (`web/pages/tauri`): `src/config/runtime.ts`
- Axios-инстанс: `src/api/http.ts`
- Авторизация/регистрация через axios: `src/api/authApi.ts`
- Кодогенерация API-клиента: `scripts/generate-api.mjs`
- Сгенерированный axios-клиент: `src/api/generated/Api.ts`, `src/api/generated/index.ts`
- Thunk-логика заявок: `src/store/slices/requestSlice.ts`, `src/store/slices/requestsListSlice.ts`
- Polling: `src/pages/RequestsPage.tsx`
- Redux фильтр услуг: `src/store/slices/servicesFiltersSlice.ts`, `src/pages/ServicesPage.tsx`
- Адаптивные брейкпоинты: `src/index.css`
- Tauri конфигурация: `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/capabilities/default.json`

## Документация для защиты

- Порядок показа: `docs/presentation-guide.md`
- Диаграммы (deployment/state/use-case): `docs/lab8-diagrams.md`
- Карта скриншотов/доказательств по коду: `docs/lab8-proof-map.md`
