/**
 * パスワードフォームコンポーネント
 * パスワードの追加・編集を行うモーダル
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addPassword, updatePassword, type PasswordEntry } from '@/lib/storage';
import { generatePassword, defaultPasswordOptions, evaluatePasswordStrength } from '@/lib/passwordGenerator';
import {
  X,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  User,
  Key,
  FileText,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface PasswordFormProps {
  entry?: PasswordEntry | null;  // 編集時は既存のエントリを渡す
  onClose: () => void;
  onSave: () => void;
}

export default function PasswordForm({ entry, onClose, onSave }: PasswordFormProps) {
  const { masterPassword } = useAuth();
  const isEditing = !!entry;

  // フォームの状態
  const [serviceName, setServiceName] = useState(entry?.serviceName || '');
  const [username, setUsername] = useState(entry?.username || '');
  const [password, setPassword] = useState(entry?.password || '');
  const [url, setUrl] = useState(entry?.url || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [category, setCategory] = useState(entry?.category || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // パスワード強度
  const passwordStrength = password ? evaluatePasswordStrength(password) : null;

  // パスワードを自動生成
  const handleGeneratePassword = () => {
    const newPassword = generatePassword(defaultPasswordOptions);
    setPassword(newPassword);
    setShowPassword(true); // 生成したパスワードを表示
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!serviceName.trim()) {
      setError('サービス名を入力してください');
      return;
    }
    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }
    if (!password.trim()) {
      setError('パスワードを入力してください');
      return;
    }

    if (!masterPassword) {
      setError('認証エラーが発生しました');
      return;
    }

    setIsLoading(true);

    try {
      const entryData = {
        serviceName: serviceName.trim(),
        username: username.trim(),
        password: password,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        category: category.trim() || undefined,
      };

      if (isEditing && entry) {
        // 更新
        await updatePassword(entry.id, entryData, masterPassword);
      } else {
        // 新規追加
        await addPassword(entryData, masterPassword);
      }

      onSave();
    } catch (err) {
      console.error('保存に失敗しました:', err);
      setError('保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 強度バーの色を取得
  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-blue-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  // 強度のラベルを取得
  const getStrengthLabel = (level: string) => {
    switch (level) {
      case 'weak':
        return '弱い';
      case 'fair':
        return '普通';
      case 'good':
        return '良い';
      case 'strong':
        return '強い';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'パスワードを編集' : '新しいパスワードを追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* サービス名 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              サービス名 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="例: Gmail, Amazon, Netflix"
                autoFocus
              />
            </div>
          </div>

          {/* ユーザー名 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ユーザー名 / メールアドレス <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="例: user@example.com"
              />
            </div>
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              パスワード <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-24 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                placeholder="パスワードを入力"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-400 hover:text-purple-300"
                  title="パスワードを生成"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* パスワード強度インジケーター */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor(passwordStrength.level)} transition-all`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.level === 'weak' ? 'text-red-400' :
                    passwordStrength.level === 'fair' ? 'text-yellow-400' :
                    passwordStrength.level === 'good' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {getStrengthLabel(passwordStrength.level)}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && passwordStrength.level !== 'strong' && (
                  <p className="text-xs text-slate-500">
                    {passwordStrength.feedback[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* URL（任意） */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL（任意）
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* カテゴリ（任意） */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              カテゴリ（任意）
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tag className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="例: 仕事, プライベート, 買い物"
              />
            </div>
          </div>

          {/* メモ（任意） */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              メモ（任意）
            </label>
            <div className="relative">
              <div className="absolute top-3 left-4 pointer-events-none">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="追加のメモを入力..."
              />
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : isEditing ? '更新' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

