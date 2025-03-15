/**
 * @vercel/analytics/serverモジュールの型定義
 * Vercelの分析機能のサーバーサイド実装の型定義を提供します。
 */

declare module '@vercel/analytics/server' {
  /**
   * イベントトラッキング関数の型定義
   * 
   * @param eventName - トラッキングするイベントの名前
   * @param properties - イベントに関連するプロパティ
   * @returns トラッキング処理のPromise
   */
  export function track(
    eventName: string,
    properties?: Record<string, string | number | boolean>
  ): Promise<void>;
}
