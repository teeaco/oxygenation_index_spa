# Лабораторная 8 — диаграммы

## 1. Deployment диаграмма

```mermaid
flowchart LR
  subgraph ClientDevices[Клиентские устройства]
    Phone[PWA на телефоне]
    Browser[Браузер на ПК]
    Tauri[Tauri build на ПК]
  end

  subgraph FrontHosts[Узлы фронтенда]
    Pages[GitHub Pages\nстатические файлы]
    DevServer[Vite dev server (HTTPS :3000)]
  end

  subgraph BackendNode[Узел backend]
    API[Web-service API\n:8080]
    Minio[MinIO / статические медиа\n:9000]
    DB[(PostgreSQL)]
  end

  Phone -->|HTTPS| Pages
  Browser -->|HTTPS| Pages
  Browser -->|HTTPS| DevServer
  Tauri -->|HTTP REST| API

  Pages -->|HTTP /api proxy или прямые API вызовы| API
  DevServer -->|HTTP /api proxy| API
  Pages -->|HTTP /img-proxy| Minio
  DevServer -->|HTTP /img-proxy| Minio
  API -->|SQL| DB
```

## 2. Диаграмма состояний заявки

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft: Черновик

  Draft --> Draft: updateRequest / updateRequestService
  Draft --> Formed: formRequest
  Draft --> Deleted: deleteRequest

  Formed: Сформирована
  Formed --> Completed: reviewRequest(action=complete)
  Formed --> Rejected: reviewRequest(action=reject)

  Completed: Завершена
  Rejected: Отклонена
  Deleted: Удалена

  Completed --> [*]
  Rejected --> [*]
  Deleted --> [*]
```

## 3. Диаграмма прецедентов React интерфейса

```mermaid
flowchart TB
  Guest[Гость]
  User[Пользователь]
  Moderator[Модератор]

  U1((Просмотр списка услуг))
  U2((Фильтрация услуг PaO2/FiO2))
  U3((Открыть карточку услуги))
  U4((Регистрация/Вход))
  U5((Работа с черновиком заявки))
  U6((Просмотр своих заявок))
  U7((Фильтрация заявок по датам/статусу))
  U8((Смена статуса заявки))
  U9((Short polling списка заявок))

  Guest --> U1
  Guest --> U2
  Guest --> U3
  Guest --> U4

  User --> U1
  User --> U2
  User --> U3
  User --> U5
  User --> U6
  User --> U7

  Moderator --> U1
  Moderator --> U2
  Moderator --> U3
  Moderator --> U6
  Moderator --> U7
  Moderator --> U8
  Moderator --> U9
```
