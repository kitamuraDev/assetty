/**
 * 月次・年次それぞれの資産データの有無を表す
 *  - monthly-only: 月次の資産データのみが存在する
 *  - yearly-only: 年次の資産データのみが存在する
 *  - both: 両方の資産データが存在する
 *  - none: どちらかの取得が未確定の場合 or または両方の資産データが存在しない
 */
export type AssetsDataAvailability = 'monthly-only' | 'yearly-only' | 'both' | 'none';

/**
 * 資産推移グラフで選択する集計期間を表す
 */
export type PeriodType = '月次' | '年次';
