export type AppTab = 'create' | 'library' | 'referral' | 'analytics' | 'settings'

export type UserProfile = {
  name: string
  email: string
}

export type CreditTransaction = {
  id: string
  amount: number
  description: string
  createdAt: string
}

export type VideoRecord = {
  id: string
  title: string
  date: string
  credits: number
  price: string
  image: string
  script: string
  voice: string
}

export type ProductPreview = {
  title: string
  category: string
  price: string
  image: string
  description: string
  rating: string
  sales: string
}

export type TrendingTemplate = {
  id: string
  title: string
  label: string
  product: ProductPreview
  script: string
  voice: string
}

export type ReferralProfile = {
  code: string
  successfulReferrals: number
  rewardCredits: number
}
