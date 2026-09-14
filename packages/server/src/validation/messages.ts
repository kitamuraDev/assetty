import type { ObjectIssue } from 'valibot';

/**
 * キー欠損時のバリデーションメッセージを生成する
 * @param issue Valibotのオブジェクト検証エラー
 * @returns キー名を含むバリデーションメッセージ
 */
export const getMissingKeyValidationMessage = ({ expected }: ObjectIssue) => {
  const key = expected.replace(/^"|"$/g, ''); // 先頭または末尾にあるダブルクォートを除去する
  return `${key}が欠損しています`;
};
