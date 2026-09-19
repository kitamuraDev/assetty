import type {
  AssetCategoryResponseType,
  AssetInfoResponseType,
  CreateAssetRecordsSuccessResponseType,
} from '@api-spec/api-types';
import { and, asc, eq, gte, lte, max, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { createHonoApp } from '../../app';
import { assetCategories, monthlyAssets } from '../../db/schema';
import { jwtAuthMiddleware } from '../../middleware/auth';
import { customValidationErrorMiddleware, type ErrorCause } from '../../middleware/error';
import { AssetsRequestQuerySchema, CreateAssetsRequestBodySchema } from './assets.schema';

const assets = createHonoApp();
assets.use('/*', jwtAuthMiddleware); // アクセストークンの検証

/**
 * 基準月から13ヶ月分の資産データを取得
 *  - 例: 2025-01 ~ 2024-01
 */
assets.get(
  '/monthly',
  customValidationErrorMiddleware('query', AssetsRequestQuerySchema),
  async (c): Promise<ReturnType<typeof c.json<AssetInfoResponseType[]>>> => {
    const userId = c.get('userId');
    const { baseDate } = c.req.valid('query');

    const d1 = c.get('d1');
    const monthlyStats = d1.$with('monthly_stats').as(
      d1
        .select({
          yearMonth: sql<string>`strftime('%Y-%m', ${monthlyAssets.date})`.as('year_month'),
          assetCategoryId: monthlyAssets.assetCategoryId,
          amount: monthlyAssets.amount,
          monthlyTotal: sql<number>`sum(${monthlyAssets.amount}) over (
            partition by strftime('%Y-%m', ${monthlyAssets.date})
          )`.as('monthly_total'),
        })
        .from(monthlyAssets)
        .where(
          and(
            eq(monthlyAssets.userId, userId),
            gte(monthlyAssets.date, sql`date(${baseDate}, '-12 months', 'start of month')`),
            lte(monthlyAssets.date, sql`date(${baseDate}, 'start of month')`),
          ),
        ),
    );

    const result = await d1
      .with(monthlyStats)
      .select({
        yearMonth: monthlyStats.yearMonth,
        totalAssets: max(monthlyStats.monthlyTotal).mapWith(Number),
        assetsByCategories: sql<string>`json_group_array(
          json_object(
            'category', ${assetCategories.name},
            'amount', ${monthlyStats.amount},
            'rate', round(cast(${monthlyStats.amount} as real) / ${monthlyStats.monthlyTotal} * 100, 1)
          )
        )`,
      })
      .from(monthlyStats)
      .innerJoin(assetCategories, eq(monthlyStats.assetCategoryId, assetCategories.id))
      .groupBy(sql`${monthlyStats.yearMonth}`)
      .orderBy(asc(monthlyStats.yearMonth));

    const responseData = result.map((row) => ({
      yearMonth: row.yearMonth,
      totalAssets: row.totalAssets,
      assetsByCategories: JSON.parse(row.assetsByCategories) as AssetInfoResponseType['assetsByCategories'],
    }));

    return c.json(responseData, 200);
  },
);

/**
 * 基準年から5年分の資産データを取得
 *  - 例: 2025-12 ~ 2021-12
 */
assets.get(
  '/yearly',
  customValidationErrorMiddleware('query', AssetsRequestQuerySchema),
  async (c): Promise<ReturnType<typeof c.json<AssetInfoResponseType[]>>> => {
    const userId = c.get('userId');
    const { baseDate } = c.req.valid('query');

    const d1 = c.get('d1');
    const yearlyStats = d1.$with('yearly_stats').as(
      d1
        .select({
          yearMonth: sql<string>`strftime('%Y-%m', ${monthlyAssets.date})`.as('year_month'),
          assetCategoryId: monthlyAssets.assetCategoryId,
          amount: monthlyAssets.amount,
          yearlyTotal: sql<number>`sum(${monthlyAssets.amount}) over (
            partition by strftime('%Y', ${monthlyAssets.date})
          )`.as('yearly_total'),
        })
        .from(monthlyAssets)
        .where(
          and(
            eq(monthlyAssets.userId, userId),
            gte(monthlyAssets.date, sql`date(${baseDate}, '-4 years', 'start of year')`),
            lte(monthlyAssets.date, sql`date(${baseDate}, 'start of month')`),
            eq(sql<string>`strftime('%m', ${monthlyAssets.date})`, '12'),
          ),
        ),
    );

    const result = await d1
      .with(yearlyStats)
      .select({
        yearMonth: yearlyStats.yearMonth,
        totalAssets: max(yearlyStats.yearlyTotal).mapWith(Number),
        assetsByCategories: sql<string>`json_group_array(
          json_object(
            'category', ${assetCategories.name},
            'amount', ${yearlyStats.amount},
            'rate', round(cast(${yearlyStats.amount} as real) / ${yearlyStats.yearlyTotal} * 100, 1)
          )
        )`,
      })
      .from(yearlyStats)
      .innerJoin(assetCategories, eq(yearlyStats.assetCategoryId, assetCategories.id))
      .groupBy(sql`${yearlyStats.yearMonth}`)
      .orderBy(asc(yearlyStats.yearMonth));

    const responseData = result.map((row) => ({
      yearMonth: row.yearMonth,
      totalAssets: row.totalAssets,
      assetsByCategories: JSON.parse(row.assetsByCategories) as AssetInfoResponseType['assetsByCategories'],
    }));

    return c.json(responseData, 200);
  },
);

/**
 * 資産データの登録
 */
assets.post(
  '/',
  customValidationErrorMiddleware('json', CreateAssetsRequestBodySchema),
  async (c): Promise<ReturnType<typeof c.json<CreateAssetRecordsSuccessResponseType>>> => {
    const userId = c.get('userId');
    const assetsData = c.req.valid('json');
    const insertValues = assetsData.map((asset) => ({ ...asset, userId }));

    try {
      const d1 = c.get('d1');
      await d1.insert(monthlyAssets).values(insertValues);

      return c.json({ ok: true }, 201);
    } catch (_e) {
      throw new HTTPException(500, { cause: { code: 'ASSETS_REGISTRATION_FAILED' } satisfies ErrorCause });
    }
  },
);

/**
 * 資産カテゴリの取得
 */
assets.get('/categories', async (c): Promise<ReturnType<typeof c.json<AssetCategoryResponseType[]>>> => {
  const d1 = c.get('d1');
  const result = await d1
    .select({ id: assetCategories.id, name: assetCategories.name })
    .from(assetCategories)
    .orderBy(asc(assetCategories.id))
    .all();

  return c.json(result, 200);
});

export default assets;
