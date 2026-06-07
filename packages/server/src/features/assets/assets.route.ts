import type {
  AssetsCategoryType,
  AssetsInfoResponseType,
  CreateAssetsSuccessResponseType,
} from '@api-spec/shared/assets.schema';
import { sValidator } from '@hono/standard-validator';
import { asc, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { createHonoApp } from '../../app';
import { assetCategories, monthlyAssets } from '../../db/schema';
import { jwtAuthMiddleware } from '../../middleware/auth';
import type { ErrorCause } from '../../middleware/error';
import {
  type AssetsInfoQueryResponseType,
  AssetsRequestQuerySchema,
  CreateAssetsRequestBodySchema,
} from './assets.schema';

const assets = createHonoApp();
assets.use('/*', jwtAuthMiddleware); // アクセストークンの検証（認可制御）

/**
 * 基準月から13ヶ月分の資産データを取得
 *  - 例: 2025-01 ~ 2024-01
 */
assets.get(
  '/monthly',
  sValidator('query', AssetsRequestQuerySchema),
  async (c): Promise<ReturnType<typeof c.json<AssetsInfoResponseType[]>>> => {
    const userId = c.get('userId');
    const { baseDate } = c.req.valid('query');

    const d1 = c.get('d1');
    const result = await d1.all<AssetsInfoQueryResponseType>(sql`
      WITH monthly_stats AS (
        SELECT
          strftime('%Y-%m', ma.date) AS year_month,
          ma.asset_category_id,
          ma.amount,
          SUM(ma.amount) OVER (PARTITION BY strftime('%Y-%m', ma.date)) AS monthly_total
        FROM monthly_assets ma
        WHERE ma.user_id = ${userId}
          AND ma.date >= date(${baseDate}, '-12 months', 'start of month')
          AND ma.date <= date(${baseDate}, 'start of month')
      )
      SELECT
        ms.year_month,
        MAX(ms.monthly_total) AS total_assets,
        json_group_array(
          json_object(
            'category', ac.name,
            'amount', ms.amount,
            'rate', ROUND(CAST(ms.amount AS REAL) / ms.monthly_total * 100, 1)
          )
        ) AS assets_by_categories
      FROM monthly_stats ms
      INNER JOIN asset_categories ac ON ms.asset_category_id = ac.id
      GROUP BY ms.year_month
      ORDER BY ms.year_month ASC
    `);

    const responseData = result.map((row) => ({
      yearMonth: row.year_month,
      totalAssets: row.total_assets,
      assetsByCategories: JSON.parse(row.assets_by_categories) as AssetsInfoResponseType['assetsByCategories'],
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
  sValidator('query', AssetsRequestQuerySchema),
  async (c): Promise<ReturnType<typeof c.json<AssetsInfoResponseType[]>>> => {
    const userId = c.get('userId');
    const { baseDate } = c.req.valid('query');

    const d1 = c.get('d1');
    const result = await d1.all<AssetsInfoQueryResponseType>(sql`
      WITH yearly_stats AS (
        SELECT
          strftime('%Y-%m', ma.date) AS year_month,
          ma.asset_category_id,
          ma.amount,
          SUM(ma.amount) OVER (PARTITION BY strftime('%Y', ma.date)) AS yearly_total
        FROM monthly_assets ma
        WHERE ma.user_id = ${userId}
          AND ma.date >= date(${baseDate}, '-4 years', 'start of year')
          AND ma.date <= date(${baseDate}, 'start of month')
          AND strftime('%m', ma.date) = '12'
      )
      SELECT
        ys.year_month,
        MAX(ys.yearly_total) AS total_assets,
        json_group_array(
          json_object(
            'category', ac.name,
            'amount', ys.amount,
            'rate', ROUND(CAST(ys.amount AS REAL) / ys.yearly_total * 100, 1)
          )
        ) AS assets_by_categories
      FROM yearly_stats ys
      INNER JOIN asset_categories ac ON ys.asset_category_id = ac.id
      GROUP BY ys.year_month
      ORDER BY ys.year_month ASC
    `);

    const responseData = result.map((row) => ({
      yearMonth: row.year_month,
      totalAssets: row.total_assets,
      assetsByCategories: JSON.parse(row.assets_by_categories) as AssetsInfoResponseType['assetsByCategories'],
    }));

    return c.json(responseData, 200);
  },
);

/**
 * 資産データの登録
 */
assets.post(
  '/',
  sValidator('json', CreateAssetsRequestBodySchema),
  async (c): Promise<ReturnType<typeof c.json<CreateAssetsSuccessResponseType, 201>>> => {
    const userId = c.get('userId');
    const assetsData = c.req.valid('json');
    const insertValues = assetsData.map((asset) => ({ ...asset, userId }));

    try {
      const d1 = c.get('d1');
      await d1.insert(monthlyAssets).values(insertValues);

      return c.json({ ok: true }, 201);
    } catch (_e) {
      throw new HTTPException(500, { cause: 'ASSETS_REGISTRATION_FAILED' satisfies ErrorCause });
    }
  },
);

/**
 * 資産カテゴリの取得
 */
assets.get('/categories', async (c): Promise<ReturnType<typeof c.json<AssetsCategoryType[]>>> => {
  const d1 = c.get('d1');
  const result = await d1
    .select({ id: assetCategories.id, name: assetCategories.name })
    .from(assetCategories)
    .orderBy(asc(assetCategories.id))
    .all();

  return c.json(result, 200);
});

export default assets;
