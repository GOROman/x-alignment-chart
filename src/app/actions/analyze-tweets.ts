/**
 * X（旧Twitter）ユーザーのアラインメント分析機能
 * 
 * このモジュールは、ユーザーのツイートを分析し、D&Dスタイルのアラインメントチャート上の
 * 位置を判定する機能を提供します。GPT-4を使用して、ユーザーの発言パターンから
 * 秩序-混沌、善-悪の軸上での位置を決定します。
 */

"use server"
import "server-only"
import { dedent } from "ts-dedent"
import { openai } from "@ai-sdk/openai"
import { CoreMessage, generateObject } from "ai"
import { z } from "zod"
import { getCachedData, setCachedData } from "../../lib/redis"
import { fetchTwitterProfile } from "../../lib/fetch-twitter-profile"
import { logger } from "@/lib/logger"
import { track } from '@vercel/analytics/server';
import { waitUntil } from "@vercel/functions";

/**
 * アラインメント分析結果のスキーマ定義
 * 
 * - explanation: 分析結果の説明文
 * - lawfulChaotic: 秩序-混沌の軸上のスコア（-100：秩序的、100：混沌的）
 * - goodEvil: 善-悪の軸上のスコア（-100：善、100：悪）
 */
const AlignmentSchema = z.object({
  explanation: z.string().describe("アラインメント判定の説明と理由付け"),
  lawfulChaotic: z.number().min(-100).max(100).describe("秩序(-100)から混沌(100)までのスコア"),
  goodEvil: z.number().min(-100).max(100).describe("善(-100)から悪(100)までのスコア"),
});

/**
 * アラインメント分析結果の型定義
 */
export type AlignmentAnalysis = z.infer<typeof AlignmentSchema>

/**
 * ユーザーのツイートを分析してアラインメントを判定する
 * 
 * このメソッドは以下の手順でアラインメント分析を行います：
 * 1. Redis キャッシュをチェックし、既存の分析結果があれば再利用
 * 2. ユーザーのプロフィールとツイートを取得
 * 3. GPT-4 を使用してツイートの内容を分析
 * 4. 分析結果をキャッシュに保存（2週間有効）
 * 
 * エラー発生時は、エラーメッセージを含む中立的なアラインメント（0, 0）を返します。
 * 
 * @param username - 分析対象のユーザー名（@付きでも可）
 * @returns {
 *   explanation: アラインメントの説明文
 *   lawfulChaotic: 秩序-混沌スコア
 *   goodEvil: 善-悪スコア
 *   cached: キャッシュヒットの有無
 *   isError: エラー発生の有無
 * }
 */
export async function analyseUser(username: string): Promise<AlignmentAnalysis & { cached: boolean; isError: boolean }> {
  // @を除去してユーザー名を正規化
  const cleanUsername = username.trim().replace(/^@/, "")
  const cacheKey = `analysis-v2:${cleanUsername}`

  try {
    // Redisからキャッシュを取得
    const cachedAnalysis = await getCachedData<AlignmentAnalysis>(cacheKey)

    if (cachedAnalysis) {
      logger.info(`${cleanUsername}のキャッシュ済み分析結果を使用`)
      logger.info(cachedAnalysis)

      // 分析キャッシュの使用を追跡
      waitUntil(track("analysis_cached", {
        username: cleanUsername,
        lawful_chaotic: cachedAnalysis.lawfulChaotic,
        good_evil: cachedAnalysis.goodEvil,
      }))
      return { ...cachedAnalysis, cached: true, isError: false }
    }

    logger.info(`${cleanUsername}のツイートを分析中`)

    // ユーザーのプロフィールとツイートを取得
    const profile = await fetchTwitterProfile(username)
    if (!profile) {
      throw new Error(`${cleanUsername}のプロフィールが見つかりません`)
    }

    // プロフィール情報をJSON形式に変換（ツイートは除外）
    const profile_str = JSON.stringify({ ...profile, tweets: undefined }, null, 2)

    // ツイートをXML風のフォーマットに変換
    const tweetTexts = profile.tweets.map((tweet) =>
      `<post${tweet.is_quote_status ? " is_quote=\"true\"" : ""}>
${tweet.text}
${tweet.favorite_count} likes, ${tweet.reply_count} replies, ${tweet.retweet_count} retweets, ${tweet.quote_count} quotes
</post>`
    ).join("\n\n")

    // GPT-4に渡すメッセージを構築
    const messages = [
      {
        role: "system",
        content: dedent`
        与えられたTwitterユーザーのツイートを分析し、D&Dスタイルのアラインメントチャート上の位置を判定してください。
        
        秩序-混沌の軸：
        - 秩序 (-100): 規則、伝統、社会規範に従う。伝統、忠誠、秩序を重視。
        - 中立 (0): 規則と自由に対してバランスの取れたアプローチ
        - 混沌 (100): 因習に反発し、個人の自由を重視。規則や伝統に関係なく自分の信念に従う
        
        善-悪の軸：
        - 善 (-100): 利他的、思いやりがあり、他者を優先
        - 中立 (0): 自己利益と他者への配慮がバランスを保つ
        - 悪 (100): 利己的、操作的、他者に危害を加える。財款、憤怒、権力欲に動機付けられる
        
        これらのツイートのみに基づいて、ユーザーのアラインメントを数値で評価してください。どの極端にも振れることを恐れないでください！

        これは楽しむためのものなので、ユーザーの特徴がわずかでも見られれば、それを誤張して構いません。例えば、悪の要素があれば、それを強調してください！全員を「混沌の中立」にしたくはありません。ただし、必ずしも混沌の特徴を誤張する必要はなく、より願著な秩序や善/悪の特徴を誤張することもできます。楽しく分析してください。
        
        説明は冗長になりすぎないようにしつつ、判断の理由を示してください。ユーザーの特徴や発言、プロジェクトなどを具体的に言及すると、よりパーソナライズされた分析になります。
      `.trim()
      },
      {
        role: "user",
        content:
          dedent`Username: @${username}

<user_profile>
${profile_str}
</user_profile>

<user_tweets filter="top_100">
${tweetTexts}
</user_tweets>`.trim()
      }
    ] satisfies CoreMessage[]


    // GPT-4を使用してツイートを分析
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      temperature: 0.8,  // 創造性を高めに設定
      schema: AlignmentSchema,
      messages
    })

    // 2週間キャッシュを保持（その間に新しいツイートが追加される可能性あり）
    await setCachedData(cacheKey, object, 604_800)

    // 分析完了を追跡
    waitUntil(track("analysis_complete", {
      username: cleanUsername,
      lawful_chaotic: object.lawfulChaotic,
      good_evil: object.goodEvil,
    }))

    return { ...object, cached: false, isError: false }
  } catch (error) {
    logger.error(`${cleanUsername}のツイート分析中にエラー発生:`, error)
    return {
      lawfulChaotic: 0,
      goodEvil: 0,
      explanation: `${cleanUsername}のツイート分析中にエラーが発生しました。ユーザー名を確認して再度お試しください。`,
      cached: false,
      isError: true,
    }
  }
}

