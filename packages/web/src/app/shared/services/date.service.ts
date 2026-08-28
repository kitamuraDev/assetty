import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  /**
   * 現在の月を含めた過去13か月分の年月配列を生成する関数
   * @returns YYYY-MM形式の年月の配列
   */
  generatePast13YearMonths(): string[] {
    const date = new Date();

    return Array.from({ length: 13 }, (_, i) => {
      const currentMonthDate = new Date(date.getFullYear(), date.getMonth() - i, 1); // 各月を1日に設定

      return this.formatYearMonth(currentMonthDate);
    });
  }

  /**
   * 現在の年月日を`YYYY-MM`の形式で取得する関数
   * @returns 現在の年月（YYYY-MM）
   */
  getCurrentYearMonth(): string {
    return this.formatYearMonth(new Date());
  }

  /**
   * 本日の日付を返す
   * @returns 本日の日付（YYYY-MM-DD）
   */
  getToday(): string {
    return this.formatDate(new Date());
  }

  /**
   * 指定した日付を`YYYY-MM`形式に変換する
   * @param date 変換対象の日付
   * @returns 年月（YYYY-MM）
   */
  private formatYearMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }

  /**
   * 指定した日付を`YYYY-MM-DD`形式に変換する
   * @param date 変換対象の日付
   * @returns 日付（YYYY-MM-DD）
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');

    return `${this.formatYearMonth(date)}-${day}`;
  }
}
