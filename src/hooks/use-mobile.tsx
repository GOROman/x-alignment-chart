/**
 * モバイルデバイス判定用カスタムフック
 * 
 * 画面幅に基づいて、現在のデバイスがモバイルかどうかを判定します。
 * レスポンシブデザインのためのレイアウト切り替えに使用します。
 */

import * as React from "react";

// モバイルデバイス判定のブレイクポイント（ピクセル）
const MOBILE_BREAKPOINT = 768;

/**
 * モバイルデバイス判定フック
 * 
 * 画面幅が768px未満の場合をモバイルと判定します。
 * ウィンドウサイズの変更を監視し、状態を自動更新します。
 * 
 * @returns モバイルデバイスの場合はtrue、それ以外はデスクトップとしてfalse
 */
export function useIsMobile() {
  // 初期値はundefinedで、マウント後に実際の値を設定
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // MediaQueryListを使用して画面幅を監視
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);  // 初期状態を設定

    // クリーンアップ関数：イベントリスナーを削除
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;  // undefinedをfalseに変換して返却
}
