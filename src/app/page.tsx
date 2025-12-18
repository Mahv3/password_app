/**
 * メインページ
 * 認証状態に応じてログイン画面またはパスワード一覧を表示
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import PasswordList from '@/components/PasswordList';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証状態に応じて表示を切り替え
  return isAuthenticated ? <PasswordList /> : <LoginScreen />;
}
