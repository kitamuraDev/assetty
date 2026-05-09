import type { AssetsInfoResponseType } from '@api-spec/shared/assets.schema';
import { sValidator } from '@hono/standard-validator';
import { sql } from 'drizzle-orm';
import { createHonoApp } from '../../app';
import { jwtAuthMiddleware } from '../../middleware/auth';
import { type AssetsInfoQueryResponseType, AssetsRequestQuerySchema } from './assets.schema';

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

export default assets;
