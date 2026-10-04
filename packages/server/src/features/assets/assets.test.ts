import { env } from 'cloudflare:workers';
import type { AssetInfoResponseType } from '@api-spec/api-types';
import app from '../..';
import { ERROR_RESPONSE } from '../../middleware/error-response';
import {
  createTestAssets,
  type InsertUserType,
  seedTestAssetCategories,
  seedTestAssets,
  seedTestUser,
} from '../../test/fixtures';
import { getSetCookieHeader, login } from '../../test/helpers';

const user: InsertUserType = {
  id: 'tfi4wB9ZRyhzVE7EhIyht',
  name: 'Lillie',
  password: 'Lillie1101',
};
const assets = createTestAssets({ from: '2019-01', to: '2021-12', assetCategoryIds: [1, 5, 10] });

describe('/assets', () => {
  beforeEach(async () => {
    await seedTestUser({ d1Database: env.ASSETTY_D1, user });
    await seedTestAssetCategories({ d1Database: env.ASSETTY_D1 });
    await seedTestAssets({ d1Database: env.ASSETTY_D1, userId: user.id, assets });
  });

  describe('GET: /', () => {
    /**
     * 正常系: 基本
     */
    it('月次取得で指定した期間の資産情報を年月昇順で返すこと', async () => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);

      const res = await app.request(
        '/api/assets?base_date=2019-12-01&months_ago=12&year_end_only=false',
        { method: 'GET', headers: { cookie: cookie } },
        env,
      );

      expect(res.status).toBe(200);
      const json = await res.json<AssetInfoResponseType[]>();
      expect(json.map(({ yearMonth }) => yearMonth)).toEqual([
        '2019-01',
        '2019-02',
        '2019-03',
        '2019-04',
        '2019-05',
        '2019-06',
        '2019-07',
        '2019-08',
        '2019-09',
        '2019-10',
        '2019-11',
        '2019-12',
      ]);
    });

    it('年次取得で指定した期間の資産情報を年月昇順で返すこと', async () => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);

      const res = await app.request(
        '/api/assets?base_date=2021-12-01&months_ago=36&year_end_only=true',
        { method: 'GET', headers: { cookie: cookie } },
        env,
      );

      expect(res.status).toBe(200);
      const json = await res.json<AssetInfoResponseType[]>();
      expect(json.map(({ yearMonth }) => yearMonth)).toEqual(['2019-12', '2020-12', '2021-12']);
    });

    it('合計資産額とカテゴリ別の資産額・割合を返すこと', async () => {
      await seedTestAssets({
        d1Database: env.ASSETTY_D1,
        userId: user.id,
        assets: [
          { date: '2026-06-01', assetCategoryId: 1, amount: 1_454_498 },
          { date: '2026-06-01', assetCategoryId: 5, amount: 7_684_069 },
          { date: '2026-06-01', assetCategoryId: 10, amount: 717_156 },
        ],
      });

      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);

      const res = await app.request(
        '/api/assets?base_date=2026-06-01&months_ago=12&year_end_only=false',
        { method: 'GET', headers: { cookie: cookie } },
        env,
      );

      expect(res.status).toBe(200);

      const json = await res.json<AssetInfoResponseType[]>();
      // biome-ignore lint: no-non-null-assertion
      const target = json[0]!;

      expect(target.totalAssets).toBe(9_855_723);
      expect(target.assetsByCategories.reduce((sum, { amount }) => sum + amount, 0)).toBe(target.totalAssets);
      expect(Object.fromEntries(target.assetsByCategories.map(({ category, rate }) => [category, rate]))).toEqual({
        現金: 14.8,
        投資信託: 78,
        年金: 7.3,
      });
    });

    it('対象期間の資産情報がなければ空配列を返すこと', async () => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);

      const res = await app.request(
        '/api/assets?base_date=2099-12-01&months_ago=12&year_end_only=false',
        { method: 'GET', headers: { cookie: cookie } },
        env,
      );

      expect(res.status).toBe(200);
      expect(await res.json<AssetInfoResponseType[]>()).toEqual([]);
    });

    /**
     * 正常系: 組み合わせ
     */
    it.each([
      {
        name: '基準日が月初日以外でも指定した期間の月次資産情報を返すこと',
        query: 'base_date=2020-06-15&months_ago=12&year_end_only=false',
        // biome-ignore format: 一行を維持したい
        expectedYearMonths: ['2019-07','2019-08','2019-09','2019-10','2019-11','2019-12','2020-01','2020-02','2020-03','2020-04','2020-05','2020-06'],
      },
      {
        name: '24ヶ月分の月次資産情報を返すこと',
        query: 'base_date=2021-06-01&months_ago=24&year_end_only=false',
        // biome-ignore format: 一行を維持したい
        expectedYearMonths: ['2019-07','2019-08','2019-09','2019-10','2019-11','2019-12','2020-01','2020-02','2020-03','2020-04','2020-05','2020-06','2020-07','2020-08','2020-09','2020-10','2020-11','2020-12','2021-01','2021-02','2021-03','2021-04','2021-05','2021-06'],
      },
      {
        name: '年次取得で基準月が12月以外の場合も対象期間内の12月だけを返すこと',
        query: 'base_date=2021-08-01&months_ago=36&year_end_only=true',
        expectedYearMonths: ['2019-12', '2020-12'],
      },
      {
        name: '年次取得で対象期間内に含まれる12月だけを返すこと',
        query: 'base_date=2021-11-01&months_ago=12&year_end_only=true',
        expectedYearMonths: ['2020-12'],
      },
    ])('$name', async ({ query, expectedYearMonths }) => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);

      const res = await app.request(`/api/assets?${query}`, { method: 'GET', headers: { cookie: cookie } }, env);

      expect(res.status).toBe(200);
      const json = await res.json<AssetInfoResponseType[]>();
      expect(json.map(({ yearMonth }) => yearMonth)).toEqual(expectedYearMonths);
    });

    /**
     * 異常系: 401系
     */
    it('アクセストークンを保持するcookieがなければ401番を返すこと', async () => {
      const { status: expectedStatus, ...expectedResponse } = ERROR_RESPONSE.INVALID_ACCESS_TOKEN;

      const res = await app.request(
        '/api/assets?base_date=2019-12-01&months_ago=12&year_end_only=false',
        { method: 'GET' },
        env,
      );

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(expectedResponse);
    });

    it('無効なアクセストークンであれば401番を返すこと', async () => {
      const { status: expectedStatus, ...expectedResponse } = ERROR_RESPONSE.INVALID_ACCESS_TOKEN;

      const res = await app.request(
        '/api/assets?base_date=2019-12-01&months_ago=12&year_end_only=false',
        { method: 'GET', headers: { cookie: `${env.JWT_ACCESS_TOKEN}=invalid` } },
        env,
      );

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(expectedResponse);
    });

    /**
     * 異常系: 400系
     */
    it.each([
      {
        name: 'base_dateが欠損していれば400番を返すこと',
        query: 'months_ago=12&year_end_only=false',
        message: 'base_dateが欠損しています',
      },
      {
        name: 'base_dateがYYYY-MM-DD形式でなければ400番を返すこと',
        query: 'base_date=2019-12-1&months_ago=12&year_end_only=false',
        message: '日付形式はYYYY-MM-DDである必要があります',
      },
      {
        name: 'months_agoが欠損していれば400番を返すこと',
        query: 'base_date=2019-12-01&year_end_only=false',
        message: 'months_agoが欠損しています',
      },
      {
        name: 'months_agoが数値でなければ400番を返すこと',
        query: 'base_date=2019-12-01&months_ago=abc&year_end_only=false',
        message: '取得月数は数値である必要があります',
      },
      {
        name: 'months_agoが整数でなければ400番を返すこと',
        query: 'base_date=2019-12-01&months_ago=12.5&year_end_only=false',
        message: '取得月数は整数である必要があります',
      },
      {
        name: 'months_agoが12未満であれば400番を返すこと',
        query: 'base_date=2019-12-01&months_ago=11&year_end_only=false',
        message: '取得月数は12以上である必要があります',
      },
      {
        name: 'months_agoが60を超えていれば400番を返すこと',
        query: 'base_date=2019-12-01&months_ago=61&year_end_only=false',
        message: '取得月数は60以下である必要があります',
      },
      {
        name: 'year_end_onlyが欠損していれば400番を返すこと',
        query: 'base_date=2019-12-01&months_ago=12',
        message: 'year_end_onlyが欠損しています',
      },
      {
        name: 'year_end_onlyがtrueまたはfalse以外であれば400番を返すこと',
        query: 'base_date=2019-12-01&months_ago=12&year_end_only=1',
        message: '年次フラグはtrueまたはfalseである必要があります',
      },
    ])('$name', async ({ query, message }) => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);
      const { status: expectedStatus, ...body } = ERROR_RESPONSE.VALIDATION_ERROR;
      const expectedResponse = { ...body, errors: [{ message }] };

      const res = await app.request(`/api/assets?${query}`, { method: 'GET', headers: { cookie: cookie } }, env);

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(expectedResponse);
    });
  });

  describe('POST: /', () => {
    /**
     * 正常系
     */
    it('資産情報を登録し、GETで取得できること', async () => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);
      const assetsToCreate = [
        { date: '2026-06-01', amount: 1_454_498, assetCategoryId: 1 },
        { date: '2026-06-01', amount: 7_684_069, assetCategoryId: 5 },
        { date: '2026-06-01', amount: 717_156, assetCategoryId: 10 },
      ];

      const createRes = await app.request(
        '/api/assets',
        {
          method: 'POST',
          headers: { cookie: cookie, 'Content-Type': 'application/json' },
          body: JSON.stringify(assetsToCreate),
        },
        env,
      );

      expect(createRes.status).toBe(201);
      expect(await createRes.json()).toEqual({ ok: true });

      const getRes = await app.request(
        '/api/assets?base_date=2026-06-01&months_ago=12&year_end_only=false',
        { method: 'GET', headers: { cookie: cookie } },
        env,
      );

      expect(getRes.status).toBe(200);
      expect(await getRes.json<AssetInfoResponseType[]>()).toEqual([
        {
          yearMonth: '2026-06',
          totalAssets: 9_855_723,
          assetsByCategories: [
            { category: '現金', amount: 1_454_498, rate: 14.8 },
            { category: '投資信託', amount: 7_684_069, rate: 78 },
            { category: '年金', amount: 717_156, rate: 7.3 },
          ],
        },
      ]);
    });

    /**
     * 異常系: 401系
     */
    it('アクセストークンを保持するcookieがなければ401番を返すこと', async () => {
      const { status: expectedStatus, ...expectedResponse } = ERROR_RESPONSE.INVALID_ACCESS_TOKEN;
      const assetsToCreate = [{ date: '2026-06-01', amount: 1, assetCategoryId: 1 }];

      const res = await app.request(
        '/api/assets',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetsToCreate),
        },
        env,
      );

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(expectedResponse);
    });

    it('無効なアクセストークンであれば401番を返すこと', async () => {
      const { status: expectedStatus, ...expectedResponse } = ERROR_RESPONSE.INVALID_ACCESS_TOKEN;
      const assetsToCreate = [{ date: '2026-06-01', amount: 1, assetCategoryId: 1 }];

      const res = await app.request(
        '/api/assets',
        {
          method: 'POST',
          headers: { cookie: `${env.JWT_ACCESS_TOKEN}=invalid`, 'Content-Type': 'application/json' },
          body: JSON.stringify(assetsToCreate),
        },
        env,
      );

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(expectedResponse);
    });

    /**
     * 異常系: 400系
     */
    it.each([
      {
        name: 'リクエストボディが配列でなければ400番を返すこと',
        body: JSON.stringify({ date: '2026-06-01', amount: 1, assetCategoryId: 1 }),
        messages: ['リクエストボティは配列である必要があります'],
      },
      {
        name: 'dateが欠損していれば400番を返すこと',
        body: JSON.stringify([{ amount: 1, assetCategoryId: 1 }]),
        messages: ['dateが欠損しています'],
      },
      {
        name: 'dateが文字列でなければ400番を返すこと',
        body: JSON.stringify([{ date: 20260601, amount: 1, assetCategoryId: 1 }]),
        messages: ['Invalid type: Expected string but received 20260601'],
      },
      {
        name: 'dateがYYYY-MM-DD形式でなければ400番を返すこと',
        body: JSON.stringify([{ date: '2026-6-01', amount: 1, assetCategoryId: 1 }]),
        messages: ['日付形式はYYYY-MM-DDである必要があります'],
      },
      {
        name: 'dateが空文字であれば400番を返すこと',
        body: JSON.stringify([{ date: '', amount: 1, assetCategoryId: 1 }]),
        messages: [
          '日付形式はYYYY-MM-DDである必要があります',
          '日付は必須です',
          '月初日（YYYY-MM-01形式）である必要があります',
        ],
      },
      {
        name: 'dateが月初日でなければ400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-02', amount: 1, assetCategoryId: 1 }]),
        messages: ['月初日（YYYY-MM-01形式）である必要があります'],
      },
      {
        name: 'amountが欠損していれば400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', assetCategoryId: 1 }]),
        messages: ['amountが欠損しています'],
      },
      {
        name: 'amountが数値でなければ400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', amount: '100', assetCategoryId: 1 }]),
        messages: ['金額は数値である必要があります'],
      },
      {
        name: 'amountが整数でなければ400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', amount: 1.5, assetCategoryId: 1 }]),
        messages: ['金額は整数である必要があります'],
      },
      {
        name: 'amountが1未満であれば400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', amount: 0, assetCategoryId: 1 }]),
        messages: ['金額は1以上である必要があります'],
      },
      {
        name: 'assetCategoryIdが欠損していれば400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', amount: 1 }]),
        messages: ['assetCategoryIdが欠損しています'],
      },
      {
        name: 'assetCategoryIdが数値でなければ400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', amount: 1, assetCategoryId: '1' }]),
        messages: ['資産カテゴリIDは数値である必要があります'],
      },
      {
        name: 'assetCategoryIdが整数でなければ400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', amount: 1, assetCategoryId: 1.5 }]),
        messages: ['資産カテゴリIDは整数である必要があります'],
      },
      {
        name: 'assetCategoryIdが1未満であれば400番を返すこと',
        body: JSON.stringify([{ date: '2026-06-01', amount: 1, assetCategoryId: 0 }]),
        messages: ['資産カテゴリIDは1以上である必要があります'],
      },
    ])('$name', async ({ body, messages }) => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);
      const { status: expectedStatus, ...errorBody } = ERROR_RESPONSE.VALIDATION_ERROR;
      const expectedResponse = { ...errorBody, errors: messages.map((message) => ({ message })) };

      const res = await app.request(
        '/api/assets',
        { method: 'POST', headers: { cookie: cookie, 'Content-Type': 'application/json' }, body },
        env,
      );

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(expectedResponse);
    });

    /**
     * 異常系: 500系
     */
    it('同一ユーザー・同一月・同一カテゴリの資産情報を重複登録すると500番を返すこと', async () => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);
      const { status: expectedStatus, ...expectedResponse } = ERROR_RESPONSE.ASSETS_REGISTRATION_FAILED;

      const headers = { cookie: cookie, 'Content-Type': 'application/json' };
      const body = JSON.stringify([{ date: '2026-06-01', amount: 123, assetCategoryId: 1 }]);

      const firstRes = await app.request('/api/assets', { method: 'POST', headers, body }, env);
      expect(firstRes.status).toBe(201);
      expect(await firstRes.json()).toEqual({ ok: true });

      const duplicateRes = await app.request('/api/assets', { method: 'POST', headers, body }, env);
      expect(duplicateRes.status).toBe(expectedStatus);
      expect(await duplicateRes.json()).toEqual(expectedResponse);
    });

    it('存在しない資産カテゴリIDで登録すると500番を返すこと', async () => {
      const loginResponse = await login(env, { name: user.name, password: user.password });
      const cookie = getSetCookieHeader(loginResponse.headers);
      const { status: expectedStatus, ...expectedResponse } = ERROR_RESPONSE.ASSETS_REGISTRATION_FAILED;

      const res = await app.request(
        '/api/assets',
        {
          method: 'POST',
          headers: { cookie: cookie, 'Content-Type': 'application/json' },
          body: JSON.stringify([{ date: '2026-06-01', amount: 123, assetCategoryId: 999 }]),
        },
        env,
      );

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(expectedResponse);
    });
  });
});
