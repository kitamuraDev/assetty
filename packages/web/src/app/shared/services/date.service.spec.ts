import { TestBed } from '@angular/core/testing';

import { DateService } from './date.service';

describe('DateService', () => {
  let service: DateService;

  afterEach(() => {
    vi.useRealTimers(); // テスト後にタイマーを元に戻す
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateService);
  });

  describe('generatePast13YearMonths', () => {
    it('現在月を含む過去13か月分を降順で返すこと', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 7, 24)); // 2026年8月24日を現在日時として設定

      expect(service.generatePast13YearMonths()).toEqual([
        '2026-08',
        '2026-07',
        '2026-06',
        '2026-05',
        '2026-04',
        '2026-03',
        '2026-02',
        '2026-01',
        '2025-12',
        '2025-11',
        '2025-10',
        '2025-09',
        '2025-08',
      ]);
    });
  });

  describe('getCurrentYearMonth', () => {
    it('現在の年月をYYYY-MM形式で返すこと', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 7, 24));

      expect(service.getCurrentYearMonth()).toBe('2026-08');
    });
  });

  describe('getToday', () => {
    it('本日の日付をYYYY-MM-DD形式で返すこと', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 7, 24));

      expect(service.getToday()).toBe('2026-08-24');
    });
  });
});
