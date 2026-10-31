import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { environment } from '../../../environments/environment';
import { ERROR_RESPONSE } from '../schemas/api-error.schema';
import { AssetsService } from './assets.service';

const mockServer = setupServer();
const API_BASE_URL = environment.API_BASE_URL;

describe('AssetsService', () => {
  let service: AssetsService;

  afterAll(() => mockServer.close());
  afterEach(() => mockServer.resetHandlers());
  beforeAll(() => {
    mockServer.listen();
    window.alert = vi.fn(); // 最初に一度だけ alert をモックしておく（※browserモードに移行したら不要になる）
  });
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    service = TestBed.inject(AssetsService);
  });

  describe('registerAssets', () => {
    it('資産情報の登録に成功したら、登録完了のメッセージがalertに表示されること', async () => {
      mockServer.use(
        http.post(`${API_BASE_URL}/assets`, async () => {
          return HttpResponse.json({ ok: true }, { status: 201 });
        }),
      );

      await service.registerAssets([{ amount: 1000, assetCategoryId: 1, date: '2025-01-01' }]);

      expect(window.alert).toHaveBeenCalledWith('資産情報を登録しました');
    });

    it('資産情報の登録に失敗したら、エラーメッセージがalertに表示されること', async () => {
      mockServer.use(
        http.post(`${API_BASE_URL}/assets`, () => {
          return HttpResponse.json(ERROR_RESPONSE.ASSETS_REGISTRATION_FAILED, { status: 500 });
        }),
      );

      await service.registerAssets([{ amount: 1000, assetCategoryId: 99, date: '2025-01-01' }]);

      expect(window.alert).toHaveBeenCalledWith(ERROR_RESPONSE.ASSETS_REGISTRATION_FAILED.message);
    });

    it('想定外のエラーが起きた場合、予期しないエラーがalertに表示されること', async () => {
      mockServer.use(
        http.post(`${API_BASE_URL}/assets`, () => {
          return HttpResponse.error();
        }),
      );

      await service.registerAssets([{ amount: 1000, assetCategoryId: 1, date: '2025-01-01' }]);

      expect(window.alert).toHaveBeenCalledWith('予期しないエラーが発生しました');
    });
  });
});
