/**
 * @vercel/functionsモジュールの型定義
 * Vercelのサーバーレス関数に関する型定義を提供します。
 */

declare module '@vercel/functions' {
  /**
   * 非同期処理を待機する関数
   * 
   * @param promise - 待機する非同期処理
   * @returns 処理の完了を待機するPromise
   */
  export function waitUntil(promise: Promise<any>): Promise<void>;
}
