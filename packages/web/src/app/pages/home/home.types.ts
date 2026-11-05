/**
 * 月次・年次それぞれの資産データの利用可否状態を表す
 *  - monthly-only: 月次の資産データのみが存在する
 *  - yearly-only: 年次の資産データのみが存在する
 *  - both: 両方の資産データが存在する
 *  - none: 両方の資産データが存在しない
 *  - error: 月次または年次の資産データ取得に失敗した
 *  - loading: 月次または年次の資産データを取得中、または取得値がまだないとき
 */
export type AssetsDataAvailability = 'monthly-only' | 'yearly-only' | 'both' | 'none' | 'error' | 'loading';

/**
 * 資産推移グラフで選択する集計期間を表す
 */
export type PeriodType = '月次' | '年次';
