/**
 * パスワード生成コンポーネント
 * カスタマイズ可能なパスワード生成ツール
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  generatePassword,
  evaluatePasswordStrength,
  type PasswordOptions,
} from '@/lib/passwordGenerator';
import {
  X,
  Copy,
  RefreshCw,
  Check,
  Sliders,
} from 'lucide-react';

interface PasswordGeneratorProps {
  onClose: () => void;
  onSelect?: (password: string) => void; // パスワードを選択した時のコールバック
}

export default function PasswordGenerator({ onClose, onSelect }: PasswordGeneratorProps) {
  // パスワード生成オプション
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  // 生成されたパスワード
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // パスワード強度
  const strength = password ? evaluatePasswordStrength(password) : null;

  // パスワードを生成
  const generate = () => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
      setCopied(false);
    } catch (error) {
      console.error('パスワード生成エラー:', error);
    }
  };

  // 初回レンダリング時にパスワードを生成
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // オプション変更時にパスワードを再生成
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  // クリップボードにコピー
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('コピーに失敗しました:', error);
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
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">パスワード生成</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 生成されたパスワード */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-lg font-mono text-white break-all flex-1">
                {password}
              </p>
              <button
                onClick={generate}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="再生成"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="コピー"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* 強度インジケーター */}
            {strength && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor(strength.level)} transition-all`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    strength.level === 'weak'
                      ? 'text-red-400'
                      : strength.level === 'fair'
                      ? 'text-yellow-400'
                      : strength.level === 'good'
                      ? 'text-blue-400'
                      : 'text-green-400'
                  }`}
                >
                  {getStrengthLabel(strength.level)}
                </span>
              </div>
            )}
          </div>

          {/* オプション */}
          <div className="space-y-4">
            {/* 長さ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  パスワードの長さ
                </label>
                <span className="text-sm font-mono text-purple-400">
                  {options.length}文字
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                value={options.length}
                onChange={(e) =>
                  setOptions({ ...options, length: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-gradient-to-r
                  [&::-webkit-slider-thumb]:from-purple-500
                  [&::-webkit-slider-thumb]:to-blue-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-purple-500/50"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>8</span>
                <span>32</span>
              </div>
            </div>

            {/* 文字種類の選択 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                含める文字
              </label>

              {/* 小文字 */}
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">小文字</span>
                  <span className="text-xs text-slate-500 font-mono">a-z</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) =>
                    setOptions({ ...options, includeLowercase: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
              </label>

              {/* 大文字 */}
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">大文字</span>
                  <span className="text-xs text-slate-500 font-mono">A-Z</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) =>
                    setOptions({ ...options, includeUppercase: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
              </label>

              {/* 数字 */}
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">数字</span>
                  <span className="text-xs text-slate-500 font-mono">0-9</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) =>
                    setOptions({ ...options, includeNumbers: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
              </label>

              {/* 記号 */}
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">記号</span>
                  <span className="text-xs text-slate-500 font-mono">!@#$%...</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) =>
                    setOptions({ ...options, includeSymbols: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
            >
              閉じる
            </button>
            {onSelect && (
              <button
                onClick={() => {
                  onSelect(password);
                  onClose();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
              >
                使用する
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

