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
