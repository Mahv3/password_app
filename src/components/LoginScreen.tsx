/**
 * ログイン画面コンポーネント
 * マスターパスワードの入力と認証を行う
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Shield, AlertCircle } from 'lucide-react';

export default function LoginScreen() {
  const { isInitialized, login, setup } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(password);
      if (!success) {
        setError('マスターパスワードが正しくありません');
      }
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 初期セットアップ処理
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);

    try {
      await setup(password);
    } catch {
      setError('セットアップに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* 背景のデコレーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Password Manager
          </h1>
          <p className="text-slate-400">
            {isInitialized
              ? 'マスターパスワードを入力してください'
              : '安全なパスワード管理を始めましょう'}
          </p>
        </div>

        {/* フォームカード */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={isInitialized ? handleLogin : handleSetup}>
            {/* パスワード入力 */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                {isInitialized ? 'マスターパスワード' : '新しいマスターパスワード'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 確認用パスワード（初回セットアップ時のみ） */}
            {!isInitialized && (
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  パスワードを確認
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  処理中...
                </span>
              ) : isInitialized ? (
                'ログイン'
              ) : (
                '始める'
              )}
            </button>
          </form>

          {/* 初回セットアップ時の注意事項 */}
          {!isInitialized && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-300 text-sm">
                ⚠️ <strong>重要:</strong> マスターパスワードは絶対に忘れないでください。
                パスワードを忘れると、保存したデータを復元できなくなります。
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <p className="text-center text-slate-500 text-sm mt-6">
          🔒 すべてのデータはAES-256で暗号化されています
        </p>
      </div>
    </div>
  );
}

