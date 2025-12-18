/**
 * ルートレイアウト
 * アプリケーション全体のレイアウトと認証プロバイダーを設定
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// フォント設定
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// メタデータ
export const metadata: Metadata = {
  title: "Password Manager | 安全なパスワード管理",
  description: "AES-256暗号化による安全なパスワード管理アプリケーション。パスワードの保存、生成、検索機能を提供します。",
  keywords: ["パスワード管理", "セキュリティ", "暗号化", "パスワード生成"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 認証プロバイダーでアプリ全体をラップ */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
