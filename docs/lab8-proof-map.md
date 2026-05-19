# Что скринить для доказательства (Лаба 8)

## 1) Регистрация сделана через axios

Скрин 1:
- Файл: `src/api/http.ts`
- Что видно: `import axios ...` и `export const http = axios.create(...)`

Скрин 2:
- Файл: `src/api/authApi.ts`
- Что видно: метод `register(...)` с `http.post('/users/register', ...)`

Дополнительно (по желанию):
- метод `login(...)` с `http.post('/users/login', ...)`

## 2) Методы доменов "заявка" и "м-м" через кодогенерацию + axios

Скрин 1 (генерация):
- Файл: `scripts/generate-api.mjs`
- Что видно: `generateApi(...)` и `httpClientType: 'axios'`

Скрин 2 (сгенерированные методы заявок):
- Файл: `src/api/generated/Api.ts`
- Что видно методы:
  - `listRequests`
  - `getRequestById`
  - `updateRequest`
  - `deleteRequest`
  - `formRequest`
  - `reviewRequest`

Скрин 3 (сгенерированные методы м-м / request services):
- Файл: `src/api/generated/Api.ts`
- Что видно методы:
  - `addServiceToDraft`
  - `updateRequestService`
  - `deleteRequestService`

Скрин 4 (инициализация сгенерированного клиента):
- Файл: `src/api/generated/index.ts`
- Что видно: `new Api(...)`, `baseURL`, `securityWorker`

## 3) Где именно Thunk (redux-thunk)

Скрин 1:
- Файл: `src/store/slices/requestSlice.ts`
- Что видно: `createAsyncThunk(...)` для методов заявки/м-м

Скрин 2:
- Файл: `src/store/slices/requestsListSlice.ts`
- Что видно: `fetchRequestsThunk = createAsyncThunk(...)` + вызов `requestsApi.oxygenationRequest.listRequests(...)`

Скрин 3:
- Файл: `src/store/index.ts`
- Что видно: `configureStore(...)` (RTK включает thunk middleware по умолчанию)

## 4) Polling (почему это polling)

Скрин кода:
- Файл: `src/pages/RequestsPage.tsx`
- Что видно: `setInterval(() => { void fetchRequestsList(); }, 5000)`

Скрин F12:
- Вкладка `Network`
- Отфильтровать запросы `listRequests` / `oxygenation_request`
- Должны идти повторно каждые ~5 секунд

## 5) Фильтр услуг хранится в Redux

Скрин 1:
- Файл: `src/store/slices/servicesFiltersSlice.ts`
- Что видно: `oxygenationInput`, `appliedOxygenationIndex`, reducers

Скрин 2:
- Файл: `src/pages/ServicesPage.tsx`
- Что видно: `useAppSelector(state => state.servicesFilters)` и dispatch `applyOxygenationIndex(...)`
