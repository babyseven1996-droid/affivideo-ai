import { MOCK_VIDEOS } from '../data/mockData'
import { isRegisteredAccount } from './credentials'
import type { CreditTransaction, ReferralProfile, UserProfile, VideoRecord } from '../types'

const SESSION_KEY = 'affivideo:session'
const LAST_USER_KEY = 'affivideo:last-user'
const DEFAULT_VOICES = ['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào']

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function userStorageKey(kind: string, email: string) {
  return `affivideo:${kind}:${encodeURIComponent(email.trim().toLowerCase())}`
}

export function readStoredUser() {
  const user = readStorage<UserProfile | null>(SESSION_KEY, null)
  return user && typeof user.name === 'string' && typeof user.email === 'string' && isRegisteredAccount(user.email) ? user : null
}

export function readLastUser() {
  const user = readStorage<UserProfile | null>(LAST_USER_KEY, null)
  return user && typeof user.name === 'string' && typeof user.email === 'string' ? user : null
}

export function saveUserSession(user: UserProfile) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    window.localStorage.setItem(LAST_USER_KEY, JSON.stringify(user))
  } catch {}
}

export function clearUserSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {}
}

export function readUserCredits(email: string) {
  const credits = readStorage<number | null>(userStorageKey('credits', email), null)
  return typeof credits === 'number' && Number.isFinite(credits) && credits >= 0 ? credits : 50
}

export function saveUserCredits(email: string, credits: number) {
  try {
    window.localStorage.setItem(userStorageKey('credits', email), JSON.stringify(credits))
  } catch {}
}

export function readUserTransactions(email: string): CreditTransaction[] {
  const transactions = readStorage<CreditTransaction[] | null>(userStorageKey('credit-transactions', email), null)
  return Array.isArray(transactions)
    ? transactions.filter((transaction) => (
      typeof transaction?.id === 'string'
      && typeof transaction?.amount === 'number'
      && Number.isFinite(transaction.amount)
      && typeof transaction?.description === 'string'
      && typeof transaction?.createdAt === 'string'
    ))
    : []
}

export function saveUserTransactions(email: string, transactions: CreditTransaction[]) {
  try {
    window.localStorage.setItem(userStorageKey('credit-transactions', email), JSON.stringify(transactions))
  } catch {}
}

function createReferralCode() {
  const random = new Uint8Array(4)
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random)
  else random.set(Array.from({ length: random.length }, () => Math.floor(Math.random() * 256)))
  const suffix = Array.from(random, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
  return `AFFI-${suffix}`
}

export function readUserReferral(email: string): ReferralProfile {
  const referral = readStorage<ReferralProfile | null>(userStorageKey('referral', email), null)
  if (referral
    && typeof referral.code === 'string'
    && /^AFFI-[A-F0-9]{8}$/.test(referral.code)
    && Number.isFinite(referral.successfulReferrals)
    && referral.successfulReferrals >= 0
    && Number.isFinite(referral.rewardCredits)
    && referral.rewardCredits >= 0) return referral
  const profile = { code: createReferralCode(), successfulReferrals: 0, rewardCredits: 0 }
  saveUserReferral(email, profile)
  return profile
}

export function saveUserReferral(email: string, referral: ReferralProfile) {
  try {
    window.localStorage.setItem(userStorageKey('referral', email), JSON.stringify(referral))
  } catch {}
}

export function readUserVideos(email: string): VideoRecord[] {
  const videos = readStorage<VideoRecord[] | null>(userStorageKey('videos', email), null)
  return Array.isArray(videos) ? videos : MOCK_VIDEOS
}

export function saveUserVideos(email: string, videos: VideoRecord[]) {
  try {
    window.localStorage.setItem(userStorageKey('videos', email), JSON.stringify(videos))
  } catch {}
}

export function readUserVoices(email: string) {
  return readStorage<string[]>(userStorageKey('voices', email), DEFAULT_VOICES)
}

export function saveUserVoices(email: string, voices: string[]) {
  try {
    window.localStorage.setItem(userStorageKey('voices', email), JSON.stringify(voices))
  } catch {}
}
