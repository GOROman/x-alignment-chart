/**
 * ユーティリティ関数モジュール
 * 
 * このモジュールは、アプリケーション全体で使用される共通のユーティリティ関数を提供します。
 * 主にスタイリングとレイアウトに関連する機能を含んでいます。
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSSのクラス名を結合するユーティリティ関数
 * 
 * clsxとtailwind-mergeを組み合わせて、クラス名の競合を解決しながら
 * 複数のクラス名を結合します。
 * 
 * @param inputs - 結合するクラス名の配列
 * @returns 結合された最適化されたクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * チャート上のランダムな位置を生成する関数
 * 
 * チャートの端から少し内側に余白を設けた範囲内で、
 * ランダムなX座標とY座標を生成します。
 * 
 * @returns {
 *   x: パーセント単位のX座標（10-90%）
 *   y: パーセント単位のY座標（10-90%）
 * }
 */
export const getRandomPosition = () => {
  const padding = 10;  // チャートの端からの余白（%）
  const x = Math.random() * (100 - 2 * padding) + padding;
  const y = Math.random() * (100 - 2 * padding) + padding;

  return { x, y };
};


