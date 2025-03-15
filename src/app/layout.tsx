/**
 * アプリケーションのルートレイアウトコンポーネント
 * 
 * このコンポーネントは、アプリケーション全体のレイアウトを定義します。
 * 主な機能：
 * - フォントの設定（Geistフォントを使用）
 * - プロバイダーの提供
 * - HTMLの言語設定
 */

import type React from "react";
import { Providers } from "./providers";
import "./globals.css";
import { Geist } from "next/font/google";

// Geistフォントの設定
const font = Geist({
  subsets: ["latin"],  // ラテン文字のサブセットを使用
  display: "swap",    // フォントの読み込み中はシステムフォントを表示
});

// メタデータの設定
export const metadata = {
  generator: "v0.dev",
};

/**
 * ルートレイアウトコンポーネント
 * 
 * @param children - 子要素（ページコンポーネントなど）
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
