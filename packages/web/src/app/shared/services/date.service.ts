import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  /**
   * 現在の月を含めた過去13か月分の年月配列を生成する関数
   * @returns YYYY-MM形式の年月の配列
   */
  generatePast13YearMonths = (): string[] => {
    return Array.from({ length: 13 }, (_, i) => {
      const date = new Date();
      const currentMonthDate = new Date(date.getFullYear(), date.getMonth() - i, 1); // 各月を1日に設定
      const year = currentMonthDate.getFullYear();
      const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');

      return `${year}-${month}`;
    });
  };

  /**
   * 現在の年月日を`YYYY-MM`の形式で取得する関数
   * @returns 現在の年月（YYYY-MM）
   */
  getCurrentYearMonth = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  };

  /**
   * 本日の日付を返す
   * @returns 本日の日付（YYYY-MM-DD）
   */
  getToday = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${date}`;
  };
}
