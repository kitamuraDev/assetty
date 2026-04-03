import '@testing-library/jest-dom/vitest';
import { provideHttpClient, withFetch } from '@angular/common/http';
import type { ErrorResponse } from '@api-spec/shared/error.schema';
import { render, screen } from '@testing-library/angular';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { environment } from '../../../environments/environment';
import HomeComponent, { type Message } from './home.component';

const mockServer = setupServer();
const API_BASE_URL = environment.API_BASE_URL;

describe('HomeComponent', () => {
  afterAll(() => mockServer.close());
  afterEach(() => mockServer.resetHandlers());
  beforeAll(() => mockServer.listen());

  it('/message のAPIコールが有効な場合は Assetty という文字列が画面に表示されること', async () => {
    mockServer.use(
      http.get(`${API_BASE_URL}/message`, () => {
        return HttpResponse.json<Message>({ message: 'Assetty' }, { status: 200 });
      }),
    );

    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    expect(await screen.findByText('Assetty')).toBeVisible();
  });

  it('/message のAPIコールが無効な場合はエラーメッセージが画面に表示されること', async () => {
    mockServer.use(
      http.get(`${API_BASE_URL}/message`, () => {
        return HttpResponse.json<ErrorResponse>(
          { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' },
          { status: 401 },
        );
      }),
    );

    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    expect(await screen.findByText('Sorry Someting Error...')).toBeVisible();
  });
});
