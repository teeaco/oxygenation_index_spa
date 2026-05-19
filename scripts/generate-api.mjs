import { resolve } from 'node:path';
import { generateApi } from 'swagger-typescript-api';

await generateApi({
  input: resolve(process.cwd(), './openapi/lab7-openapi.yaml'),
  output: resolve(process.cwd(), './src/api/generated'),
  name: 'Api.ts',
  httpClientType: 'axios',
  moduleNameFirstTag: true,
  generateClient: true,
  extractRequestParams: true,
  extractRequestBody: true,
  generateResponses: true,
});
