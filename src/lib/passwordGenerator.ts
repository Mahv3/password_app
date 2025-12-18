/**
 * パスワード生成ユーティリティ
 * カスタマイズ可能な強力なパスワードを生成
 */

// 文字セット定義
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// パスワード生成オプションの型定義
export interface PasswordOptions {
  length: number;           // パスワードの長さ
  includeLowercase: boolean; // 小文字を含む
  includeUppercase: boolean; // 大文字を含む
  includeNumbers: boolean;   // 数字を含む
  includeSymbols: boolean;   // 記号を含む
}

// デフォルトオプション
export const defaultPasswordOptions: PasswordOptions = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
};

/**
 * パスワードを生成
 * @param options パスワード生成オプション
 * @returns 生成されたパスワード
 */
export function generatePassword(options: PasswordOptions = defaultPasswordOptions): string {
  // 使用する文字セットを構築
  let charset = '';
  const requiredChars: string[] = [];
  
  if (options.includeLowercase) {
    charset += LOWERCASE;
    // 最低1文字は含める
    requiredChars.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
  }
  
  if (options.includeUppercase) {
    charset += UPPERCASE;
    requiredChars.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
  }
  
  if (options.includeNumbers) {
    charset += NUMBERS;
    requiredChars.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
  }
  
  if (options.includeSymbols) {
    charset += SYMBOLS;
    requiredChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }
  
  // 文字セットが空の場合はエラー
  if (charset.length === 0) {
    throw new Error('少なくとも1つの文字種類を選択してください');
  }
  
  // パスワード長が必須文字数より少ない場合は調整
  const effectiveLength = Math.max(options.length, requiredChars.length);
  
  // ランダムな文字を生成（暗号学的に安全な乱数を使用）
  const randomValues = new Uint32Array(effectiveLength - requiredChars.length);
  crypto.getRandomValues(randomValues);
  
  // パスワードを構築
  const passwordChars = [...requiredChars];
  for (const value of randomValues) {
    passwordChars.push(charset[value % charset.length]);
  }
  
  // シャッフル（Fisher-Yatesアルゴリズム）
  const shuffleValues = new Uint32Array(passwordChars.length);
  crypto.getRandomValues(shuffleValues);
  
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = shuffleValues[i] % (i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }
  
  return passwordChars.join('');
}

/**
 * パスワード強度を評価
 * @param password パスワード
 * @returns 強度スコア（0-100）と評価
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  // 長さによるスコア
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (password.length >= 20) score += 10;
  
  // 文字種類によるスコア
  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('小文字を追加してください');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('大文字を追加してください');
  }
  
  if (/[0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push('数字を追加してください');
  }
  
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    score += 15;
  } else {
    feedback.push('記号を追加してください');
  }
  
  // 連続文字のペナルティ
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('同じ文字の連続を避けてください');
  }
  
  // 一般的なパターンのペナルティ
  const commonPatterns = ['123', 'abc', 'qwerty', 'password', 'admin'];
  for (const pattern of commonPatterns) {
    if (password.toLowerCase().includes(pattern)) {
      score -= 15;
      feedback.push('一般的なパターンを避けてください');
      break;
    }
  }
  
  // スコアを0-100に正規化
  score = Math.max(0, Math.min(100, score));
  
  // レベル判定
  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 30) {
    level = 'weak';
    if (password.length < 8) {
      feedback.unshift('パスワードが短すぎます');
    }
  } else if (score < 50) {
    level = 'fair';
  } else if (score < 75) {
    level = 'good';
  } else {
    level = 'strong';
    if (feedback.length === 0) {
      feedback.push('強力なパスワードです！');
    }
  }
  
  return { score, level, feedback };
}

