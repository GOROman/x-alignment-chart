/**
 * @ai-sdk/openaiモジュールの型定義
 * OpenAI APIを使用するためのSDKの型定義を提供します。
 */

declare module '@ai-sdk/openai' {
  /**
   * OpenAI APIのモデルを指定するための関数
   * 
   * @param modelName - 使用するモデル名（例：'gpt-4o-mini'）
   * @returns モデル指定オブジェクト
   */
  export function openai(modelName: string): {
    model: string;
    provider: 'openai';
  };

  export default openai;
}
