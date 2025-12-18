/**
 * パスワード一覧コンポーネント
 * 保存されたパスワードの表示・検索・管理を行う
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPasswords, deletePassword, type PasswordEntry } from '@/lib/storage';
import PasswordForm from './PasswordForm';
import PasswordGenerator from './PasswordGenerator';
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Edit2,
  Trash2,
  LogOut,
  Key,
  Globe,
  User,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';

export default function PasswordList() {
  const { masterPassword, logout } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // パスワードリストを読み込み
  const loadPasswords = useCallback(async () => {
    if (!masterPassword) return;
    
    try {
      const data = await getPasswords(masterPassword);
      // 更新日時の新しい順にソート
      data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setPasswords(data);
    } catch (error) {
      console.error('パスワードの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, [masterPassword]);

  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  // 検索フィルタリング
  const filteredPasswords = passwords.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.serviceName.toLowerCase().includes(query) ||
      entry.username.toLowerCase().includes(query) ||
      (entry.url && entry.url.toLowerCase().includes(query)) ||
      (entry.category && entry.category.toLowerCase().includes(query))
    );
  });

  // パスワードの表示/非表示を切り替え
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // パスワードをクリップボードにコピー
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('コピーに失敗しました:', error);
    }
  };

  // エントリを削除
  const handleDelete = async (id: string) => {
    if (!masterPassword) return;
    
    try {
      await deletePassword(id, masterPassword);
      await loadPasswords();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('削除に失敗しました:', error);
    }
  };

  // 編集モーダルを開く
  const openEditModal = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setShowFormModal(true);
  };

  // モーダルを閉じる
  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingEntry(null);
  };

  // 保存完了後の処理
  const handleSaveComplete = () => {
    loadPasswords();
    closeFormModal();
  };

  // サービス名の頭文字を取得
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // サービス名に基づいた色を生成
  const getServiceColor = (name: string) => {
    const colors = [
      'from-red-500 to-pink-500',
      'from-orange-500 to-amber-500',
      'from-yellow-500 to-lime-500',
      'from-green-500 to-emerald-500',
      'from-teal-500 to-cyan-500',
      'from-blue-500 to-indigo-500',
      'from-indigo-500 to-purple-500',
      'from-purple-500 to-pink-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 背景のデコレーション */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Password Manager</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">ログアウト</span>
          </button>
        </header>

        {/* 検索バーとアクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="サービス名で検索..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline">生成</span>
            </button>
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">新規追加</span>
            </button>
          </div>
        </div>

        {/* パスワード一覧 */}
        {filteredPasswords.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? '検索結果がありません' : 'パスワードがありません'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery
                ? '別のキーワードで検索してみてください'
                : '「新規追加」ボタンから最初のパスワードを追加しましょう'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowFormModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                パスワードを追加
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPasswords.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* サービスアイコン */}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${getServiceColor(
                      entry.serviceName
                    )} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-lg">
                      {getInitial(entry.serviceName)}
                    </span>
                  </div>

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {entry.serviceName}
                      </h3>
                      {entry.category && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-slate-400">
                          {entry.category}
                        </span>
                      )}
                    </div>

                    {/* ユーザー名 */}
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm truncate">{entry.username}</span>
                      <button
                        onClick={() => copyToClipboard(entry.username, `user-${entry.id}`)}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        title="ユーザー名をコピー"
                      >
                        {copiedId === `user-${entry.id}` ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* パスワード */}
                    <div className="flex items-center gap-2 text-slate-400">
                      <Key className="w-4 h-4" />
                      <span className="text-sm font-mono">
                        {visiblePasswords.has(entry.id)
                          ? entry.password
                          : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(entry.id)}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        title={visiblePasswords.has(entry.id) ? '非表示' : '表示'}
                      >
                        {visiblePasswords.has(entry.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(entry.password, `pass-${entry.id}`)}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        title="パスワードをコピー"
                      >
                        {copiedId === `pass-${entry.id}` ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* URL */}
                    {entry.url && (
                      <div className="flex items-center gap-2 text-slate-500 mt-2">
                        <Globe className="w-4 h-4" />
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm truncate hover:text-purple-400 transition-colors"
                        >
                          {entry.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                      title="編集"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    {deleteConfirmId === entry.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-400"
                          title="削除を確定"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
                          title="キャンセル"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(entry.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                        title="削除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 統計情報 */}
        {passwords.length > 0 && (
          <div className="mt-8 text-center text-slate-500 text-sm">
            {passwords.length}件のパスワードを管理中
          </div>
        )}
      </div>

      {/* パスワード追加/編集モーダル */}
      {showFormModal && (
        <PasswordForm
          entry={editingEntry}
          onClose={closeFormModal}
          onSave={handleSaveComplete}
        />
      )}

      {/* パスワード生成モーダル */}
      {showGeneratorModal && (
        <PasswordGenerator onClose={() => setShowGeneratorModal(false)} />
      )}
    </div>
  );
}

