/**
 * aiモジュールの型定義
 * AIモデルとの対話に使用する型定義を提供します。
 */

declare module 'ai' {
  /**
   * AIモデルとのメッセージ交換の型定義
   */
  export interface CoreMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  /**
   * オブジェクト生成オプションの型定義
   */
  export interface GenerateObjectOptions<T> {
    model: {
      model: string;
      provider: string;
    };
    temperature?: number;
    schema: any;
    messages: CoreMessage[];
  }

  /**
   * 生成されたオブジェクトのレスポンス型
   */
  export interface GenerateObjectResponse<T> {
    object: T;
  }

  /**
   * オブジェクトを生成する関数
   * 
   * @param options - 生成オプション
   * @returns 生成されたオブジェクトを含むレスポンス
   */
  export function generateObject<T>(options: GenerateObjectOptions<T>): Promise<GenerateObjectResponse<T>>;
}
