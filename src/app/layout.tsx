// src/app/layout.tsx (修正版)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Vercel用のタイムアウト設定ですが、Renderのままにしておいても無害なので残します
export const maxDuration = 300;

const inter = Inter({ subsets: ["latin"] });

// ページのメタデータ設定（ブラウザのタブ名など）
export const metadata: Metadata = {
  title: "社会保険・労働保険AIアシスタント",
  description: "Gemini 3 Pro Preview搭載 RAGチャットボット",
};

// ▼▼▼ ここが今回の修正ポイント ▼▼▼
// RootLayout関数が受け取る「children」というデータの型を明確に定義します。
// これでTypeScriptのエラーが消えます。
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* bodyタグに、全体の背景色と文字色を設定するTailwindクラスを適用します */}
      <body className={`${inter.className} min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200`}>
        {children}
      </body>
    </html>
  );
}