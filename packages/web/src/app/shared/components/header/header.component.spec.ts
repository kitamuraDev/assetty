import '@testing-library/jest-dom/vitest';

import { provideHttpClient, withFetch } from '@angular/common/http';
import type { UserInfoResponseType } from '@api-spec/shared/user.schema';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { environment } from '../../../../environments/environment';
import { HeaderComponent } from './header.component';

const mockServer = setupServer();
const API_BASE_URL = environment.API_BASE_URL;

describe('HeaderComponent', () => {
  let user: ReturnType<typeof userEvent.setup>;

  afterAll(() => mockServer.close());
  afterEach(() => mockServer.resetHandlers());
  beforeAll(() => mockServer.listen());
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('/user のAPIコールが有効な場合は、ユーザーメニューに取得したユーザー情報が表示されること', async () => {
    const expectedUserInfo: UserInfoResponseType = {
      id: 'tfi4wB9ZRyhzVE7EhIyht',
      name: 'Lillie',
    };

    mockServer.use(
      http.get(`${API_BASE_URL}/user`, () => {
        return HttpResponse.json<UserInfoResponseType>(expectedUserInfo, { status: 200 });
      }),
    );

    await render(HeaderComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    const userIcon = screen.getByRole('button', { name: 'ユーザーメニューを開閉する' });
    await user.click(userIcon);

    expect(await screen.findByText(`@${expectedUserInfo.id}`)).toBeVisible();
    expect(await screen.findByText(expectedUserInfo.name)).toBeVisible();
  });
});
