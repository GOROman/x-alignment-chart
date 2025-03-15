/**
 * ロギングモジュール
 * 
 * Pinoロガーを使用して、アプリケーションのログ出力を管理します。
 * 環境変数に応じてログレベルを自動調整します。
 */

import pino from "pino";

/**
 * グローバルロガーインスタンス
 * 
 * ログレベルは以下のように設定されます：
 * - LOG_LEVEL環境変数が設定されていればその値を使用
 * - 開発環境（NODE_ENV=development）の場合は"debug"
 * - 本番環境の場合は"info"
 */
export const logger = pino({
    level: process.env.LOG_LEVEL || process.env.NODE_ENV === "development" ? "debug" : "info",
});

