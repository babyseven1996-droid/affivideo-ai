import type { UserProfile } from '../types'

type StoredCredential = UserProfile & {
  salt: string
  passwordHash: string
  iterations: number
}

export type AuthenticationResult =
  | { ok: true; user: UserProfile; isNewAccount: boolean }
  | { ok: false; message: string }

const CREDENTIALS_KEY = 'affivideo:credentials:v1'
const PASSWORD_ITERATIONS = 210_000

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string) {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) throw new Error('Invalid salt')
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16))
}

function readCredentials(): StoredCredential[] {
  const stored = window.localStorage.getItem(CREDENTIALS_KEY)
  if (!stored) return []
  const parsed: unknown = JSON.parse(stored)
  if (!Array.isArray(parsed)) throw new Error('Credential store is invalid')
  return parsed.filter((record): record is StoredCredential => (
    typeof record?.email === 'string'
    && validEmail(record.email)
    && typeof record?.name === 'string'
    && typeof record?.salt === 'string'
    && /^[0-9a-f]{32}$/i.test(record.salt)
    && typeof record?.passwordHash === 'string'
    && /^[0-9a-f]{64}$/i.test(record.passwordHash)
    && typeof record?.iterations === 'number'
    && Number.isSafeInteger(record.iterations)
    && record.iterations >= 100_000
    && record.iterations <= 1_000_000
  ))
}

async function hashPassword(password: string, salt: Uint8Array, iterations: number) {
  if (!window.crypto?.subtle) throw new Error('Secure cryptography is unavailable')
  const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const result = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return toHex(new Uint8Array(result))
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return difference === 0
}

function cryptoError(): AuthenticationResult {
  return { ok: false, message: 'Trình duyệt không hỗ trợ xác thực bảo mật. Hãy mở ứng dụng qua HTTPS hoặc localhost.' }
}

export function isRegisteredAccount(email: string) {
  try {
    return readCredentials().some((record) => record.email === normalizeEmail(email))
  } catch {
    return false
  }
}

export function requestPasswordRecovery(email: string): AuthenticationResult {
  const normalizedEmail = normalizeEmail(email)
  if (!validEmail(normalizedEmail)) return { ok: false, message: 'Vui lòng nhập địa chỉ email hợp lệ.' }
  try {
    const credential = readCredentials().find((record) => record.email === normalizedEmail)
    if (!credential) return { ok: false, message: 'Email này chưa được đăng ký. Hãy kiểm tra lại địa chỉ email.' }
    return { ok: true, user: { name: credential.name, email: credential.email }, isNewAccount: false }
  } catch {
    return { ok: false, message: 'Không thể kiểm tra tài khoản trên thiết bị này. Hãy thử lại.' }
  }
}

export async function resetAccountPassword(email: string, password: string): Promise<AuthenticationResult> {
  const normalizedEmail = normalizeEmail(email)
  if (!validEmail(normalizedEmail)) return { ok: false, message: 'Vui lòng nhập địa chỉ email hợp lệ.' }
  if (password.length < 6) return { ok: false, message: 'Mật khẩu mới cần có ít nhất 6 ký tự.' }
  try {
    const credentials = readCredentials()
    const accountIndex = credentials.findIndex((record) => record.email === normalizedEmail)
    if (accountIndex < 0) return { ok: false, message: 'Email này chưa được đăng ký. Hãy kiểm tra lại địa chỉ email.' }
    if (!window.crypto?.getRandomValues || !window.crypto?.subtle) return cryptoError()

    const salt = window.crypto.getRandomValues(new Uint8Array(16))
    const passwordHash = await hashPassword(password, salt, PASSWORD_ITERATIONS)
    const currentCredential = credentials[accountIndex]
    credentials[accountIndex] = { ...currentCredential, salt: toHex(salt), passwordHash, iterations: PASSWORD_ITERATIONS }
    window.localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
    return { ok: true, user: { name: currentCredential.name, email: currentCredential.email } }
  } catch {
    return { ok: false, message: 'Không thể cập nhật mật khẩu trên thiết bị này. Hãy thử lại.' }
  }
}

export async function registerAccount(name: string, email: string, password: string): Promise<AuthenticationResult> {
  const normalizedEmail = normalizeEmail(email)
  const cleanName = name.trim()
  if (!validEmail(normalizedEmail)) return { ok: false, message: 'Vui lòng nhập địa chỉ email hợp lệ.' }
  if (cleanName.length < 2) return { ok: false, message: 'Tên hiển thị cần có ít nhất 2 ký tự.' }
  if (password.length < 6) return { ok: false, message: 'Mật khẩu cần có ít nhất 6 ký tự.' }
  try {
    const credentials = readCredentials()
    if (credentials.some((record) => record.email === normalizedEmail)) {
      return { ok: false, message: 'Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.' }
    }
    if (!window.crypto?.getRandomValues || !window.crypto?.subtle) return cryptoError()

    const salt = window.crypto.getRandomValues(new Uint8Array(16))
    const passwordHash = await hashPassword(password, salt, PASSWORD_ITERATIONS)
    const user = { name: cleanName, email: normalizedEmail }
    credentials.push({ ...user, salt: toHex(salt), passwordHash, iterations: PASSWORD_ITERATIONS })
    window.localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
    return { ok: true, user, isNewAccount: true }
  } catch {
    return { ok: false, message: 'Không thể lưu tài khoản trên thiết bị này. Hãy kiểm tra quyền lưu trữ của trình duyệt.' }
  }
}

export async function authenticateAccount(email: string, password: string): Promise<AuthenticationResult> {
  const normalizedEmail = normalizeEmail(email)
  if (!validEmail(normalizedEmail)) return { ok: false, message: 'Vui lòng nhập địa chỉ email hợp lệ.' }
  if (password.length < 6) return { ok: false, message: 'Mật khẩu cần có ít nhất 6 ký tự.' }

  try {
    const credential = readCredentials().find((record) => record.email === normalizedEmail)
    if (!credential) return { ok: false, message: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.' }
    if (!window.crypto?.subtle) return cryptoError()

    const candidateHash = await hashPassword(password, fromHex(credential.salt), credential.iterations)
    if (!constantTimeEqual(candidateHash, credential.passwordHash)) {
      return { ok: false, message: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.' }
    }
    return { ok: true, user: { name: credential.name, email: credential.email }, isNewAccount: false }
  } catch {
    return { ok: false, message: 'Không thể xác minh tài khoản trên thiết bị này. Hãy thử lại.' }
  }
}
