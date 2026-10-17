import '@testing-library/jest-dom/vitest';

import { provideHttpClient, withFetch } from '@angular/common/http';
import type { AssetCategoryResponseType, AssetInfoResponseType, UserInfoResponseType } from '@api-spec/api-types';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { environment } from '../../../environments/environment';
import { ERROR_RESPONSE } from '../../shared/schemas/api-error.schema';
import AssetsRegisterComponent from './assets-register.component';

const monthlyAssets: AssetInfoResponseType[] = [
  {
    yearMonth: '2025-02',
    totalAssets: 15_100_000,
    assetsByCategories: [
      { category: '現金', amount: 4_257_891, rate: 28.2 },
      { category: '投資信託', amount: 8_634_219, rate: 57.18 },
      { category: '年金', amount: 2_207_890, rate: 14.62 },
    ],
  },
  {
    yearMonth: '2025-03',
    totalAssets: 15_250_000,
    assetsByCategories: [
      { category: '現金', amount: 4_389_012, rate: 28.78 },
      { category: '投資信託', amount: 8_712_345, rate: 57.13 },
      { category: '年金', amount: 2_148_643, rate: 14.09 },
    ],
  },
  {
    yearMonth: '2025-04',
    totalAssets: 15_500_000,
    assetsByCategories: [
      { category: '現金', amount: 4_512_678, rate: 29.11 },
      { category: '投資信託', amount: 8_823_456, rate: 56.93 },
      { category: '年金', amount: 2_163_866, rate: 13.96 },
    ],
  },
  {
    yearMonth: '2025-05',
    totalAssets: 15_800_000,
    assetsByCategories: [
      { category: '現金', amount: 4_678_901, rate: 29.61 },
      { category: '投資信託', amount: 8_934_567, rate: 56.55 },
      { category: '年金', amount: 2_186_532, rate: 13.84 },
    ],
  },
  {
    yearMonth: '2025-06',
    totalAssets: 16_000_000,
    assetsByCategories: [
      { category: '現金', amount: 4_789_123, rate: 29.93 },
      { category: '投資信託', amount: 9_012_345, rate: 56.33 },
      { category: '年金', amount: 2_198_532, rate: 13.74 },
    ],
  },
  {
    yearMonth: '2025-07',
    totalAssets: 16_200_000,
    assetsByCategories: [
      { category: '現金', amount: 4_823_456, rate: 29.77 },
      { category: '投資信託', amount: 9_123_456, rate: 56.32 },
      { category: '年金', amount: 2_253_088, rate: 13.91 },
    ],
  },
  {
    yearMonth: '2025-08',
    totalAssets: 16_500_000,
    assetsByCategories: [
      { category: '現金', amount: 4_945_678, rate: 29.97 },
      { category: '投資信託', amount: 9_234_567, rate: 55.97 },
      { category: '年金', amount: 2_319_755, rate: 14.06 },
    ],
  },
  {
    yearMonth: '2025-09',
    totalAssets: 16_800_000,
    assetsByCategories: [
      { category: '現金', amount: 5_123_456, rate: 30.5 },
      { category: '投資信託', amount: 9_345_678, rate: 55.63 },
      { category: '年金', amount: 2_330_866, rate: 13.87 },
    ],
  },
  {
    yearMonth: '2025-10',
    totalAssets: 17_100_000,
    assetsByCategories: [
      { category: '現金', amount: 5_234_567, rate: 30.61 },
      { category: '投資信託', amount: 9_456_789, rate: 55.3 },
      { category: '年金', amount: 2_408_644, rate: 14.09 },
    ],
  },
  {
    yearMonth: '2025-11',
    totalAssets: 17_400_000,
    assetsByCategories: [
      { category: '現金', amount: 5_345_678, rate: 30.72 },
      { category: '投資信託', amount: 9_567_890, rate: 54.99 },
      { category: '年金', amount: 2_486_432, rate: 14.29 },
    ],
  },
  {
    yearMonth: '2025-12',
    totalAssets: 17_700_000,
    assetsByCategories: [
      { category: '現金', amount: 5_456_789, rate: 30.83 },
      { category: '投資信託', amount: 9_678_901, rate: 54.68 },
      { category: '年金', amount: 2_564_310, rate: 14.49 },
    ],
  },
  {
    yearMonth: '2026-01',
    totalAssets: 18_100_000,
    assetsByCategories: [
      { category: '現金', amount: 5_678_901, rate: 31.37 },
      { category: '投資信託', amount: 9_789_012, rate: 54.08 },
      { category: '年金', amount: 2_632_087, rate: 14.55 },
    ],
  },
];
const assetCategories: AssetCategoryResponseType[] = [
  { id: 1, name: '現金' },
  { id: 2, name: '債券' },
  { id: 3, name: '国内株式' },
  { id: 4, name: '海外株式' },
  { id: 5, name: '投資信託' },
  { id: 6, name: '現物不動産' },
  { id: 7, name: 'REIT' },
  { id: 8, name: 'コモディティ' },
  { id: 9, name: '暗号資産' },
  { id: 10, name: '年金' },
];

const mockServer = setupServer();
const API_BASE_URL = environment.API_BASE_URL;

describe('AssetsRegisterComponent', () => {
  let user: ReturnType<typeof userEvent.setup>;

  afterAll(() => mockServer.close());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    mockServer.resetHandlers();
  });
  beforeAll(() => mockServer.listen());
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 15));

    window.confirm = vi.fn(); // 最初に一度だけ confirm をモックしておく（※browserモードに移行したら不要になる）
    window.alert = vi.fn(); // 最初に一度だけ alert をモックしておく（※browserモードに移行したら不要になる）

    user = userEvent.setup();

    mockServer.use(
      http.get(`${API_BASE_URL}/user`, () => {
        return HttpResponse.json<UserInfoResponseType>({ id: 'tfi4wB9ZRyhzVE7EhIyht', name: 'Lillie' });
      }),
      http.get(`${API_BASE_URL}/assets`, () => {
        return HttpResponse.json(monthlyAssets);
      }),
      http.get(`${API_BASE_URL}/assets/categories`, () => {
        return HttpResponse.json(assetCategories);
      }),
    );
  });

  it('年月プルダウンで現在月を含む12ヶ月を選択できること', async () => {
    await render(AssetsRegisterComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    const yearMonthSelect = screen.getByLabelText('年月');
    const options = within(yearMonthSelect).getAllByRole('option');

    expect(options).toHaveLength(12);
    expect(options.map((option) => option.getAttribute('value'))).toEqual([
      '2026-01',
      '2025-12',
      '2025-11',
      '2025-10',
      '2025-09',
      '2025-08',
      '2025-07',
      '2025-06',
      '2025-05',
      '2025-04',
      '2025-03',
      '2025-02',
    ]);
  });

  it('年月プルダウンの初期値が現在月であること', async () => {
    await render(AssetsRegisterComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    expect(screen.getByLabelText('年月')).toHaveValue(currentYearMonth);
  });

  it.each(monthlyAssets)('$yearMonthに登録済みの資産カテゴリは選択できないこと', async ({
    yearMonth,
    assetsByCategories,
  }) => {
    await render(AssetsRegisterComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    await user.selectOptions(screen.getByLabelText('年月'), yearMonth);

    // 登録済みカテゴリは選択不可、未登録カテゴリは選択可能であること
    const registeredCategoryNames = assetsByCategories.map(({ category }) => category);
    for (const { name } of assetCategories) {
      const option = screen.getByRole('option', { name });
      if (registeredCategoryNames.includes(name)) {
        expect(option).toBeDisabled();
      } else {
        expect(option).toBeEnabled();
      }
    }
  });

  it('資産カテゴリが未選択のときは登録ボタンが非活性であること', async () => {
    await render(AssetsRegisterComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 資産カテゴリの選択肢がすべて見つかる（DOM上に存在する）まで待つ
    await Promise.all(assetCategories.map(async ({ name }) => await screen.findByRole('option', { name })));

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument(); // 画面上に何らかの数値入力ボックスが存在しないこと
    expect(screen.getByRole('button', { name: '資産情報を登録する' })).toBeDisabled();
  });

  it('資産情報の登録に成功したら、登録完了のメッセージがalertに表示されること', async () => {
    mockServer.use(
      http.post(`${API_BASE_URL}/assets`, async () => {
        return HttpResponse.json({ ok: true }, { status: 201 });
      }),
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { fixture } = await render(AssetsRegisterComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 年月/資産カテゴリ 選択
    await user.selectOptions(screen.getByLabelText('年月'), '2026-01');
    await user.selectOptions(screen.getByLabelText('資産カテゴリ'), screen.getByRole('option', { name: '債券' }));

    // 金額 入力
    const amountInput = screen.getByRole('spinbutton', { name: '債券' });
    await user.clear(amountInput);
    await user.type(amountInput, String(2_838_221));

    // 登録ボタン 押下
    await user.click(screen.getByRole('button', { name: '資産情報を登録する' }));
    await fixture.whenStable();

    expect(window.alert).toHaveBeenCalledWith('資産情報を登録しました');
  });

  it('資産情報の登録に失敗したら、エラーメッセージがalertに表示されること', async () => {
    mockServer.use(
      http.post(`${API_BASE_URL}/assets`, () => {
        return HttpResponse.json(ERROR_RESPONSE.ASSETS_REGISTRATION_FAILED, { status: 500 });
      }),
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { fixture } = await render(AssetsRegisterComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 年月/資産カテゴリ 選択
    await user.selectOptions(screen.getByLabelText('年月'), '2026-01');
    await user.selectOptions(screen.getByLabelText('資産カテゴリ'), screen.getByRole('option', { name: '債券' }));

    // 登録ボタン 押下
    await user.click(screen.getByRole('button', { name: '資産情報を登録する' }));
    await fixture.whenStable();

    expect(window.alert).toHaveBeenCalledWith(ERROR_RESPONSE.ASSETS_REGISTRATION_FAILED.message);
  });

  it('想定外のエラーが起きた場合、予期しないエラーがalertに表示されること', async () => {
    mockServer.use(
      http.post(`${API_BASE_URL}/assets`, () => {
        return HttpResponse.error();
      }),
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { fixture } = await render(AssetsRegisterComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 年月/資産カテゴリ 選択
    await user.selectOptions(screen.getByLabelText('年月'), '2026-01');
    await user.selectOptions(screen.getByLabelText('資産カテゴリ'), screen.getByRole('option', { name: '債券' }));

    // 登録ボタン 押下
    await user.click(screen.getByRole('button', { name: '資産情報を登録する' }));
    await fixture.whenStable();

    expect(window.alert).toHaveBeenCalledWith('予期しないエラーが発生しました');
  });
});
