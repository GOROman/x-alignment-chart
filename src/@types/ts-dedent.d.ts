/**
 * ts-dedentモジュールの型定義
 * インデントを除去するユーティリティ関数を提供します。
 */

declare module 'ts-dedent' {
  /**
   * テンプレートリテラルのインデントを除去する関数
   * 
   * @param strings - テンプレートリテラルの文字列部分
   * @param values - テンプレートリテラルの変数部分
   * @returns インデントが除去された文字列
   */
  export function dedent(strings: string | TemplateStringsArray, ...values: any[]): string;

  export default dedent;
}
