/**
 * アプリケーション全体のプロバイダーを提供するコンポーネント
 * 
 * このコンポーネントは以下の機能を提供します：
 * - ツールチップの表示機能（TooltipProvider）
 * - トースト通知の表示機能（Toaster）
 * - アクセス解析機能（Analytics）
 */

"use client";

import type React from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";

/**
 * プロバイダーコンポーネント
 * 
 * @param children - 子要素（アプリケーションのコンテンツ）
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Toaster />
      <Analytics />
      {children}
    </TooltipProvider>
  );
}
