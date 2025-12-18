/**
 * 認証コンテキスト
 * マスターパスワードの状態管理とセッション管理
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isAppInitialized, validateMasterPassword, initializeApp } from '@/lib/storage';

// コンテキストの型定義
interface AuthContextType {
  isAuthenticated: boolean;       // 認証済みかどうか
  isInitialized: boolean;         // アプリが初期化済みかどうか
  isLoading: boolean;             // ローディング中かどうか
  masterPassword: string | null;  // マスターパスワード（メモリ内のみ）
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setup: (password: string) => Promise<void>;
}

// コンテキストを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// プロバイダーコンポーネント
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  // 初期化状態を確認
  useEffect(() => {
    const checkInitialization = () => {
      const initialized = isAppInitialized();
      setIsInitialized(initialized);
      setIsLoading(false);
    };

    checkInitialization();
  }, []);

  // ログイン処理
  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const isValid = await validateMasterPassword(password);
      if (isValid) {
        setMasterPassword(password);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // ログアウト処理
  const logout = useCallback(() => {
    setMasterPassword(null);
    setIsAuthenticated(false);
  }, []);

  // 初期セットアップ処理
  const setup = useCallback(async (password: string): Promise<void> => {
    await initializeApp(password);
    setMasterPassword(password);
    setIsAuthenticated(true);
    setIsInitialized(true);
  }, []);

  // 自動ログアウト（5分間の非アクティブ後）
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, 5 * 60 * 1000); // 5分
    };

    // イベントリスナーを設定
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // 初期タイマーを設定
    resetTimer();

    // クリーンアップ
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, logout]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        isLoading,
        masterPassword,
        login,
        logout,
        setup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

