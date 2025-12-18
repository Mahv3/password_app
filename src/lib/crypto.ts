/**
 * 暗号化ユーティリティ
 * Web Crypto APIを使用したAES-256-GCM暗号化
 * 
 * セキュリティ方針:
 * - マスターパスワードからPBKDF2で暗号化キーを導出
 * - AES-256-GCMで暗号化（認証付き暗号化）
 * - ソルトとIVは暗号文と一緒に保存
 */

// PBKDF2のイテレーション回数（セキュリティと速度のバランス）
const PBKDF2_ITERATIONS = 100000;

// 暗号化アルゴリズム
const ALGORITHM = 'AES-GCM';

// キー長（256ビット = 32バイト）
const KEY_LENGTH = 256;

// ソルト長（128ビット = 16バイト）
const SALT_LENGTH = 16;

// IV長（96ビット = 12バイト、AES-GCMの推奨値）
const IV_LENGTH = 12;

/**
 * マスターパスワードから暗号化キーを導出
 * @param password マスターパスワード
 * @param salt ソルト（指定しない場合は新規生成）
 * @returns 導出されたキーとソルト
 */
async function deriveKey(
  password: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  // ソルトがない場合は新規生成
  const usedSalt = salt || crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  
  // パスワードをエンコード
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // パスワードからキーマテリアルを作成
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // PBKDF2でキーを導出
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: usedSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
  
  return { key, salt: usedSalt };
}

/**
 * データを暗号化
 * @param plaintext 平文
 * @param password マスターパスワード
 * @returns Base64エンコードされた暗号文（ソルト + IV + 暗号文）
 */
export async function encrypt(plaintext: string, password: string): Promise<string> {
  // キーを導出
  const { key, salt } = await deriveKey(password);
  
  // IVを生成
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // 平文をエンコード
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(plaintext);
  
  // 暗号化
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintextBuffer
  );
  
  // ソルト + IV + 暗号文を結合
  const combined = new Uint8Array(
    salt.length + iv.length + ciphertext.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
  
  // Base64エンコード
  return btoa(String.fromCharCode(...combined));
}

/**
 * データを復号
 * @param encryptedData Base64エンコードされた暗号文
 * @param password マスターパスワード
 * @returns 復号された平文
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
  // Base64デコード
  const combined = new Uint8Array(
    atob(encryptedData)
      .split('')
      .map((c) => c.charCodeAt(0))
  );
  
  // ソルト、IV、暗号文を分離
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);
  
  // キーを導出（同じソルトを使用）
  const { key } = await deriveKey(password, salt);
  
  // 復号
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );
  
  // デコード
  const decoder = new TextDecoder();
  return decoder.decode(plaintextBuffer);
}

/**
 * マスターパスワードの検証用ハッシュを生成
 * @param password マスターパスワード
 * @returns 検証用データ（Base64エンコード）
 */
export async function createPasswordVerifier(password: string): Promise<string> {
  // 固定の検証文字列を暗号化
  const verificationString = 'PASSWORD_VERIFICATION_STRING';
  return await encrypt(verificationString, password);
}

/**
 * マスターパスワードを検証
 * @param password 入力されたパスワード
 * @param verifier 保存されている検証用データ
 * @returns 検証結果
 */
export async function verifyPassword(password: string, verifier: string): Promise<boolean> {
  try {
    const decrypted = await decrypt(verifier, password);
    return decrypted === 'PASSWORD_VERIFICATION_STRING';
  } catch {
    // 復号に失敗した場合はパスワードが間違っている
    return false;
  }
}

