/**
 * Redisキャッシュ管理モジュール
 * 
 * Upstash Redisを使用して、アプリケーションのデータをキャッシュします。
 * 主にアラインメント分析結果のキャッシュに使用されます。
 */

import { Redis } from "@upstash/redis"
import { logger } from "./logger"

// Redisクライアントのシングルトンインスタンス
let redisClient: Redis | null = null

/**
 * Redisクライアントのインスタンスを取得する
 * 
 * シングルトンパターンを使用して、Redisクライアントの
 * インスタンスを一度だけ作成し、再利用します。
 * 
 * @returns Redisクライアントのインスタンス
 */
export function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.KV_REST_API_URL || "",
      token: process.env.KV_REST_API_TOKEN || "",
    })
  }

  return redisClient
}

/**
 * Redisからキャッシュされたデータを取得する
 * 
 * @param key - キャッシュのキー
 * @returns 指定された型のデータ、またはnull（キャッシュミスまたはエラー時）
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    const data = await client.get(key)

    if (data) {
      return data as T
    }

    return null
  } catch (error) {
    logger.warn("[upstash] Redis cache get error:", error)
    return null
  }
}

/**
 * Redisにデータをキャッシュする
 * 
 * @param key - キャッシュのキー
 * @param data - キャッシュするデータ
 * @param ttlSeconds - キャッシュの有効期限（秒）、デフォルト1時間
 */
export async function setCachedData(key: string, data: any, ttlSeconds = 3600): Promise<void> {
  try {
    const client = getRedisClient()
    await client.set(key, data, { ex: ttlSeconds })
  } catch (error) {
    logger.warn("[upstash] Redis cache set error:", error)
  }
}

