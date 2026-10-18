import '@testing-library/jest-dom/vitest';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import type { AssetInfoResponseType, UserInfoResponseType } from '@api-spec/api-types';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { environment } from '../../../environments/environment';
import { AssetsBarChartComponent } from './components/assets-bar-chart.component';
import HomeComponent from './home.component';

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
const yearlyAssets: AssetInfoResponseType[] = [
  {
    yearMonth: '2024-12',
    totalAssets: 20_987_654,
    assetsByCategories: [
      { category: '現金', amount: 5_123_456, rate: 24.42 },
      { category: '投資信託', amount: 11_234_567, rate: 53.53 },
      { category: '年金', amount: 4_629_631, rate: 22.05 },
    ],
  },
  {
    yearMonth: '2025-12',
    totalAssets: 22_345_678,
    assetsByCategories: [
      { category: '現金', amount: 6_123_456, rate: 27.4 },
      { category: '投資信託', amount: 12_345_678, rate: 55.25 },
      { category: '年金', amount: 3_876_544, rate: 17.35 },
    ],
  },
];

const mockServer = setupServer();
const API_BASE_URL = environment.API_BASE_URL;

describe('HomeComponent', () => {
  let user: ReturnType<typeof userEvent.setup>;

  afterAll(() => mockServer.close());
  afterEach(() => mockServer.resetHandlers());
  beforeAll(() => mockServer.listen());
  beforeEach(() => {
    user = userEvent.setup();

    mockServer.use(
      http.get(`${API_BASE_URL}/user`, () => {
        return HttpResponse.json<UserInfoResponseType>({ id: 'tfi4wB9ZRyhzVE7EhIyht', name: 'Lillie' });
      }),
      http.get(`${API_BASE_URL}/assets`, ({ request }) => {
        const yearEndOnly = new URL(request.url).searchParams.get('year_end_only');
        return HttpResponse.json(yearEndOnly === 'true' ? yearlyAssets : monthlyAssets);
      }),
    );
  });

  it('初期表示のとき、月次の最新データが資産合計カードと内訳テーブルに表示されること', async () => {
    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 資産合計カード
    expect(await screen.findByText('2026-01')).toBeVisible();
    expect(screen.getByText('18,100,000')).toBeVisible();

    // 内訳テーブル
    const table = screen.getByRole('table');
    expect(within(table).getByText('現金')).toBeVisible();
    expect(within(table).getByText('5,678,901')).toBeVisible();
    expect(within(table).getByText('投資信託')).toBeVisible();
    expect(within(table).getByText('9,789,012')).toBeVisible();
    expect(within(table).getByText('年金')).toBeVisible();
    expect(within(table).getByText('2,632,087')).toBeVisible();
  });

  it('年次を選択したとき、年次の最新データが資産合計カードと内訳テーブルに表示されること', async () => {
    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });
    await screen.findByText('2026-01');

    await user.click(screen.getByRole('button', { name: '年次' }));

    // 資産合計カード
    expect(await screen.findByText('2025-12')).toBeVisible();
    expect(screen.getByText('22,345,678')).toBeVisible();

    // 内訳テーブル
    const table = screen.getByRole('table');
    expect(within(table).getByText('現金')).toBeVisible();
    expect(within(table).getByText('6,123,456')).toBeVisible();
    expect(within(table).getByText('投資信託')).toBeVisible();
    expect(within(table).getByText('12,345,678')).toBeVisible();
    expect(within(table).getByText('年金')).toBeVisible();
    expect(within(table).getByText('3,876,544')).toBeVisible();
  });

  it('月次データがないとき、年次が選択されて月次ボタンが無効になること', async () => {
    mockServer.use(
      http.get(`${API_BASE_URL}/assets`, ({ request }) => {
        const yearEndOnly = new URL(request.url).searchParams.get('year_end_only');
        return HttpResponse.json(yearEndOnly === 'true' ? yearlyAssets : []);
      }),
    );

    const { fixture } = await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 年次が選択されて月次ボタンが無効になること
    expect(await screen.findByText('2025-12')).toBeVisible();
    expect(fixture.componentInstance.assetsDataAvailability()).toBe('yearly-only');
    expect(fixture.componentInstance.selectedPeriodType()).toBe('年次');
    expect(screen.getByRole('button', { name: '月次' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '年次' })).toBeEnabled();

    // 無効になってる月次をクリックしても年次の現在月からデータが切り替わらないこと
    await user.click(screen.getByRole('button', { name: '月次' }));
    expect(screen.getByText('2025-12')).toBeVisible();
    expect(screen.getByText('22,345,678')).toBeVisible();
  });

  it('年次データがないとき、月次が選択されて年次ボタンが無効になること', async () => {
    mockServer.use(
      http.get(`${API_BASE_URL}/assets`, ({ request }) => {
        const yearEndOnly = new URL(request.url).searchParams.get('year_end_only');
        return HttpResponse.json(yearEndOnly === 'true' ? [] : monthlyAssets);
      }),
    );

    const { fixture } = await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 月次が選択されて年次ボタンが無効になること
    expect(await screen.findByText('2026-01')).toBeVisible();
    expect(fixture.componentInstance.assetsDataAvailability()).toBe('monthly-only');
    expect(fixture.componentInstance.selectedPeriodType()).toBe('月次');
    expect(screen.getByRole('button', { name: '月次' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '年次' })).toBeDisabled();

    // 無効になってる年次をクリックしても月次の現在月からデータが切り替わらないこと
    await user.click(screen.getByRole('button', { name: '年次' }));
    expect(screen.getByText('2026-01')).toBeVisible();
    expect(screen.getByText('18,100,000')).toBeVisible();
  });

  it('月次と年次のデータが存在するとき、月次が選択されてどちらのボタンも有効であること', async () => {
    const { fixture } = await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 月次が選択されてどちらのボタンも有効であること
    expect(await screen.findByText('2026-01')).toBeVisible();
    expect(fixture.componentInstance.assetsDataAvailability()).toBe('both');
    expect(fixture.componentInstance.selectedPeriodType()).toBe('月次');
    expect(screen.getByRole('button', { name: '月次' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '年次' })).toBeEnabled();

    // 年次をクリックしたら年次の最新データに切り替わること
    await user.click(screen.getByRole('button', { name: '年次' }));

    expect(screen.queryByText('2026-01')).not.toBeInTheDocument();
    expect(screen.queryByText('18,100,000')).not.toBeInTheDocument();
    expect(screen.getByText('2025-12')).toBeVisible();
    expect(screen.getByText('22,345,678')).toBeVisible();

    // 月次をクリックしたら月次の最新データに切り替わること
    await user.click(screen.getByRole('button', { name: '月次' }));

    expect(screen.queryByText('2025-12')).not.toBeInTheDocument();
    expect(screen.queryByText('22,345,678')).not.toBeInTheDocument();
    expect(screen.getByText('2026-01')).toBeVisible();
    expect(screen.getByText('18,100,000')).toBeVisible();
  });

  it('資産データが存在しないとき、資産情報登録への案内が表示されること', async () => {
    mockServer.use(
      http.get(`${API_BASE_URL}/assets`, () => {
        return HttpResponse.json([]);
      }),
    );

    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 資産情報登録への案内が表示されること
    expect(await screen.findByRole('heading', { name: '資産情報が未登録です' })).toBeVisible();
    expect(screen.getByRole('link', { name: '資産情報を登録する' })).toHaveAttribute('href', '/register/assets');

    // 資産合計カードと内訳テーブルは表示されないこと
    expect(screen.queryByText('2026-01')).not.toBeInTheDocument();
    expect(screen.queryByText('18,100,000')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('資産データの取得中のとき、データ取得中である旨の案内が表示されること', async () => {
    let releaseAssetsResponse!: () => void;
    const assetsResponseReleased = new Promise<void>((resolve) => {
      releaseAssetsResponse = resolve;
    });

    mockServer.use(
      http.get(`${API_BASE_URL}/assets`, async ({ request }) => {
        const yearEndOnly = new URL(request.url).searchParams.get('year_end_only');
        await assetsResponseReleased;
        return HttpResponse.json(yearEndOnly === 'true' ? yearlyAssets : monthlyAssets);
      }),
    );

    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    expect(await screen.findByRole('heading', { name: '資産情報を読み込み中です' })).toBeVisible();
    expect(screen.getByText('資産情報を取得しています。しばらくお待ちください。')).toBeVisible();

    releaseAssetsResponse();

    expect(await screen.findByText('2026-01')).toBeVisible();
    expect(screen.getByText('18,100,000')).toBeVisible();
  });

  it('資産データの取得に失敗したとき、失敗した旨の案内が表示されること', async () => {
    mockServer.use(
      http.get(`${API_BASE_URL}/assets`, () => {
        return HttpResponse.error();
      }),
    );

    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    // 失敗した旨の案内が表示されること
    expect(await screen.findByRole('heading', { name: '資産情報の読み込み失敗' })).toBeVisible();
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeVisible();

    // 資産合計カードと内訳テーブルは表示されないこと
    expect(screen.queryByText('2026-01')).not.toBeInTheDocument();
    expect(screen.queryByText('18,100,000')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('年次から月次に選択を切り替えたとき、月次の最新データが資産合計カードと内訳テーブルに表示されること', async () => {
    await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });
    await screen.findByText('2026-01');

    await user.click(screen.getByRole('button', { name: '年次' }));
    await screen.findByText('2025-12');

    await user.click(screen.getByRole('button', { name: '月次' }));

    // 資産合計カード
    expect(await screen.findByText('2026-01')).toBeVisible();
    expect(screen.getByText('18,100,000')).toBeVisible();

    // 内訳テーブル
    const table = screen.getByRole('table');
    expect(within(table).getByText('現金')).toBeVisible();
    expect(within(table).getByText('5,678,901')).toBeVisible();
    expect(within(table).getByText('投資信託')).toBeVisible();
    expect(within(table).getByText('9,789,012')).toBeVisible();
    expect(within(table).getByText('年金')).toBeVisible();
    expect(within(table).getByText('2,632,087')).toBeVisible();
  });

  it('グラフが選択されなかったとき、資産合計カードと内訳テーブルは初期データのままであること', async () => {
    const { fixture } = await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });
    await screen.findByText('2026-01');

    const chart = fixture.debugElement
      .query(By.directive(AssetsBarChartComponent))
      .injector.get(AssetsBarChartComponent);
    chart.onChartClick({ active: [{}] });

    fixture.detectChanges();

    // 資産合計カード
    expect(screen.getByText('2026-01')).toBeVisible();
    expect(screen.getByText('18,100,000')).toBeVisible();

    // 内訳テーブル
    const table = screen.getByRole('table');
    expect(within(table).getByText('現金')).toBeVisible();
    expect(within(table).getByText('5,678,901')).toBeVisible();
    expect(within(table).getByText('投資信託')).toBeVisible();
    expect(within(table).getByText('9,789,012')).toBeVisible();
    expect(within(table).getByText('年金')).toBeVisible();
    expect(within(table).getByText('2,632,087')).toBeVisible();
  });

  it.each(
    monthlyAssets.map((asset, chartIndex) => ({ asset, chartIndex })),
  )('月次グラフで$asset.yearMonthを選択したとき、資産合計カードと内訳テーブルが切り替わること', async ({
    asset,
    chartIndex,
  }) => {
    const { fixture } = await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });
    await screen.findByText('2026-01');

    // テスト対象の画面から AssetsBarChartComponent が配置された DebugElement を探して Angular Injector からコンポーネントのインスタンスを取得する
    const chart = fixture.debugElement
      .query(By.directive(AssetsBarChartComponent))
      .injector.get(AssetsBarChartComponent);
    chart.onChartClick({ active: [{ index: chartIndex }] });

    fixture.detectChanges();

    // 資産合計カード
    expect(screen.getByText(asset.yearMonth)).toBeVisible();
    expect(screen.getByText(asset.totalAssets.toLocaleString('en-US'))).toBeVisible();

    // 内訳テーブル
    const table = screen.getByRole('table');
    for (const category of asset.assetsByCategories) {
      expect(within(table).getByText(category.category)).toBeVisible();
      expect(within(table).getByText(category.amount.toLocaleString('en-US'))).toBeVisible();
      expect(within(table).getByText(String(category.rate))).toBeVisible();
    }
  });

  it.each(
    yearlyAssets.map((asset, chartIndex) => ({ asset, chartIndex })),
  )('年次グラフで$asset.yearMonthを選択したとき、資産合計カードと内訳テーブルが切り替わること', async ({
    asset,
    chartIndex,
  }) => {
    const { fixture } = await render(HomeComponent, {
      providers: [provideHttpClient(withFetch())],
    });
    await screen.findByText('2026-01');

    await user.click(screen.getByRole('button', { name: '年次' }));
    await screen.findByText('2025-12');

    const chart = fixture.debugElement
      .query(By.directive(AssetsBarChartComponent))
      .injector.get(AssetsBarChartComponent);
    chart.onChartClick({ active: [{ index: chartIndex }] });

    fixture.detectChanges();

    // 資産合計カード
    expect(screen.getByText(asset.yearMonth)).toBeVisible();
    expect(screen.getByText(asset.totalAssets.toLocaleString('en-US'))).toBeVisible();

    // 内訳テーブル
    const table = screen.getByRole('table');
    for (const category of asset.assetsByCategories) {
      expect(within(table).getByText(category.category)).toBeVisible();
      expect(within(table).getByText(category.amount.toLocaleString('en-US'))).toBeVisible();
      expect(within(table).getByText(String(category.rate))).toBeVisible();
    }
  });
});
