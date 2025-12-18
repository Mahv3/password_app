/**
 * ストレージユーティリティ
 * ローカルストレージを使用したデータ永続化
 * 
 * 注意: 本番環境ではSupabaseなどのバックエンドに移行することを推奨
 */

import { encrypt, decrypt, createPasswordVerifier, verifyPassword } from './crypto';

// パスワードエントリの型定義
export interface PasswordEntry {
  id: string;
  serviceName: string;    // サービス名（例: Gmail, Amazon）
  username: string;       // ユーザー名/メールアドレス
  password: string;       // パスワード（暗号化済み）
  url?: string;           // サービスのURL（任意）
  notes?: string;         // メモ（任意）
  category?: string;      // カテゴリ（任意）
  createdAt: string;      // 作成日時
  updatedAt: string;      // 更新日時
}

// ストレージキー
const STORAGE_KEYS = {
  PASSWORD_VERIFIER: 'pm_password_verifier',
  ENCRYPTED_DATA: 'pm_encrypted_data',
  IS_INITIALIZED: 'pm_initialized',
} as const;

/**
 * アプリが初期化済みかどうかを確認
 */
export function isAppInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED) === 'true';
}

/**
 * マスターパスワードを設定（初回セットアップ）
 * @param masterPassword マスターパスワード
 */
export async function initializeApp(masterPassword: string): Promise<void> {
  // パスワード検証用データを作成
  const verifier = await createPasswordVerifier(masterPassword);
  
  // 空のパスワードリストを暗号化して保存
  const encryptedData = await encrypt(JSON.stringify([]), masterPassword);
  
  // ローカルストレージに保存
  localStorage.setItem(STORAGE_KEYS.PASSWORD_VERIFIER, verifier);
  localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);
  localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
}

/**
 * マスターパスワードを検証
 * @param masterPassword 入力されたパスワード
 * @returns 検証結果
 */
export async function validateMasterPassword(masterPassword: string): Promise<boolean> {
  const verifier = localStorage.getItem(STORAGE_KEYS.PASSWORD_VERIFIER);
  if (!verifier) return false;
  
  return await verifyPassword(masterPassword, verifier);
}

/**
 * パスワードリストを取得
 * @param masterPassword マスターパスワード
 * @returns パスワードエントリのリスト
 */
export async function getPasswords(masterPassword: string): Promise<PasswordEntry[]> {
  const encryptedData = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
  if (!encryptedData) return [];
  
  try {
    const decrypted = await decrypt(encryptedData, masterPassword);
    return JSON.parse(decrypted);
  } catch {
    throw new Error('データの復号に失敗しました');
  }
}

/**
 * パスワードリストを保存
 * @param passwords パスワードエントリのリスト
 * @param masterPassword マスターパスワード
 */
async function savePasswords(
  passwords: PasswordEntry[],
  masterPassword: string
): Promise<void> {
  const encryptedData = await encrypt(JSON.stringify(passwords), masterPassword);
  localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);
}

/**
 * パスワードエントリを追加
 * @param entry 追加するエントリ（idは自動生成）
 * @param masterPassword マスターパスワード
 * @returns 追加されたエントリ
 */
export async function addPassword(
  entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>,
  masterPassword: string
): Promise<PasswordEntry> {
  const passwords = await getPasswords(masterPassword);
  
  const newEntry: PasswordEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  passwords.push(newEntry);
  await savePasswords(passwords, masterPassword);
  
  return newEntry;
}

/**
 * パスワードエントリを更新
 * @param id 更新するエントリのID
 * @param updates 更新内容
 * @param masterPassword マスターパスワード
 * @returns 更新されたエントリ
 */
export async function updatePassword(
  id: string,
  updates: Partial<Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>>,
  masterPassword: string
): Promise<PasswordEntry | null> {
  const passwords = await getPasswords(masterPassword);
  const index = passwords.findIndex((p) => p.id === id);
  
  if (index === -1) return null;
  
  passwords[index] = {
    ...passwords[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await savePasswords(passwords, masterPassword);
  return passwords[index];
}

/**
 * パスワードエントリを削除
 * @param id 削除するエントリのID
 * @param masterPassword マスターパスワード
 * @returns 削除成功したかどうか
 */
export async function deletePassword(
  id: string,
  masterPassword: string
): Promise<boolean> {
  const passwords = await getPasswords(masterPassword);
  const index = passwords.findIndex((p) => p.id === id);
  
  if (index === -1) return false;
  
  passwords.splice(index, 1);
  await savePasswords(passwords, masterPassword);
  
  return true;
}

/**
 * パスワードを検索
 * @param query 検索クエリ
 * @param masterPassword マスターパスワード
 * @returns 検索結果
 */
export async function searchPasswords(
  query: string,
  masterPassword: string
): Promise<PasswordEntry[]> {
  const passwords = await getPasswords(masterPassword);
  const lowerQuery = query.toLowerCase();
  
  return passwords.filter(
    (p) =>
      p.serviceName.toLowerCase().includes(lowerQuery) ||
      p.username.toLowerCase().includes(lowerQuery) ||
      (p.url && p.url.toLowerCase().includes(lowerQuery)) ||
      (p.notes && p.notes.toLowerCase().includes(lowerQuery)) ||
      (p.category && p.category.toLowerCase().includes(lowerQuery))
  );
}

/**
 * すべてのデータをリセット（アプリの初期化状態に戻す）
 */
export function resetApp(): void {
  localStorage.removeItem(STORAGE_KEYS.PASSWORD_VERIFIER);
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_DATA);
  localStorage.removeItem(STORAGE_KEYS.IS_INITIALIZED);
}

