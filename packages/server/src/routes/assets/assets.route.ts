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
import { AssetsRequestQueryParameterSchema, CreateAssetRecordsRequestBodySchema } from './assets.schema';

const assets = createHonoApp();
assets.use('/*', jwtAuthMiddleware); // アクセストークンの検証

/**
 * 資産情報の取得
 *
 * クエリパラメータ:
 * - `base_date`: 基準日。基準月として扱う（YYYY-MM-DD形式）
 * - `months_ago`: 基準月を含めて取得する月数（12~60ヶ月 / 1~5年）
 * - `year_end_only`: `true` の場合、12月のデータだけを取得する
 *
 * `year_end_only=true` を指定すると、各年の12月時点の資産情報を取得できる。
 * レスポンスは常に月単位の資産情報で、`yearMonth` は対象月を表す。
 */
assets.get(
  '/',
  customValidationErrorMiddleware('query', AssetsRequestQueryParameterSchema),
  async (c): Promise<ReturnType<typeof c.json<AssetInfoResponseType[]>>> => {
    const userId = c.get('userId');
    const { base_date, months_ago, year_end_only } = c.req.valid('query');

    const d1 = c.get('d1');
    const assetStats = d1.$with('asset_stats').as(
      d1
        .select({
          yearMonth: sql<string>`strftime('%Y-%m', ${monthlyAssets.date})`.as('year_month'),
          assetCategoryId: monthlyAssets.assetCategoryId,
          amount: monthlyAssets.amount,
          total: sql<number>`sum(${monthlyAssets.amount}) over (
            partition by strftime('%Y-%m', ${monthlyAssets.date})
          )`.as('monthly_total'),
        })
        .from(monthlyAssets)
        .where(
          and(
            eq(monthlyAssets.userId, userId),
            gte(monthlyAssets.date, sql`date(${base_date}, ${`-${months_ago - 1} months`}, 'start of month')`),
            lte(monthlyAssets.date, sql`date(${base_date}, 'start of month')`),
            year_end_only ? eq(sql<string>`strftime('%m', ${monthlyAssets.date})`, '12') : undefined,
          ),
        ),
    );

    const result = await d1
      .with(assetStats)
      .select({
        yearMonth: assetStats.yearMonth,
        totalAssets: max(assetStats.total).mapWith(Number),
        assetsByCategories: sql<string>`json_group_array(
          json_object(
            'category', ${assetCategories.name},
            'amount', ${assetStats.amount},
            'rate', round(cast(${assetStats.amount} as real) / ${assetStats.total} * 100, 1)
          )
        )`,
      })
      .from(assetStats)
      .innerJoin(assetCategories, eq(assetStats.assetCategoryId, assetCategories.id))
      .groupBy(sql`${assetStats.yearMonth}`)
      .orderBy(asc(assetStats.yearMonth));

    const response = result.map((row) => ({
      yearMonth: row.yearMonth,
      totalAssets: row.totalAssets,
      assetsByCategories: JSON.parse(row.assetsByCategories) as AssetInfoResponseType['assetsByCategories'],
    }));

    return c.json(response, 200);
  },
);

/**
 * 資産情報の登録
 */
assets.post(
  '/',
  customValidationErrorMiddleware('json', CreateAssetRecordsRequestBodySchema),
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
