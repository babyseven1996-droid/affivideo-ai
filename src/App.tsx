import { useEffect, useState } from 'react'
import CreateVideo from './pages/CreateVideo'
import Library from './pages/Library'
import Referral from './pages/Referral'
import VoiceSettings from './pages/VoiceSettings'
import Analytics from './pages/Analytics'
import Header from './components/Header'
import AuthScreen from './components/AuthScreen'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import PricingModal from './components/PricingModal'
import Toast from './components/Toast'
import { MOCK_VIDEOS } from './data/mockData'
import { clearUserSession, readLastUser, readStoredUser, readUserCredits, readUserReferral, readUserTransactions, readUserVideos, readUserVoices, saveUserCredits, saveUserReferral, saveUserSession, saveUserTransactions, saveUserVideos, saveUserVoices } from './lib/appStorage'
import type { AppTab, CreditTransaction, ReferralProfile, UserProfile, VideoRecord } from './types'

const TAB_TITLES: Record<AppTab, string> = {
  create: 'Tạo video',
  library: 'Kho video',
  referral: 'Giới thiệu',
  analytics: 'Thống kê',
  settings: 'Cài đặt',
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => readStoredUser())
  const [tab, setTab] = useState<AppTab>('create')
  const [credits, setCredits] = useState(() => {
    const storedUser = readStoredUser()
    return storedUser ? readUserCredits(storedUser.email) : 50
  })
  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => {
    const storedUser = readStoredUser()
    return storedUser ? readUserTransactions(storedUser.email) : []
  })
  const [referral, setReferral] = useState<ReferralProfile>(() => {
    const storedUser = readStoredUser()
    return storedUser ? readUserReferral(storedUser.email) : { code: '', successfulReferrals: 0, rewardCredits: 0 }
  })
  const [videos, setVideos] = useState<VideoRecord[]>(() => {
    const storedUser = readStoredUser()
    return storedUser ? readUserVideos(storedUser.email) : MOCK_VIDEOS
  })
  const [voices, setVoices] = useState<string[]>(() => {
    const storedUser = readStoredUser()
    return storedUser ? readUserVoices(storedUser.email) : ['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào']
  })
  const [darkMode, setDarkMode] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [authNotice, setAuthNotice] = useState('')

  useEffect(() => {
    if (!user) return
    saveUserSession(user)
    saveUserCredits(user.email, credits)
    saveUserReferral(user.email, referral)
    saveUserTransactions(user.email, transactions)
    saveUserVideos(user.email, videos)
    saveUserVoices(user.email, voices)
  }, [user, credits, referral, transactions, videos, voices])

  function recordTransaction(amount: number, description: string) {
    const transaction: CreditTransaction = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      amount,
      description,
      createdAt: new Date().toISOString(),
    }
    setTransactions((current) => [transaction, ...current].slice(0, 100))
  }

  function showToast(message: string) {
    setToastMessage(message)
  }

  function addVideo(video: VideoRecord) {
    setVideos((current) => [video, ...current])
    setTab('library')
    showToast('Video đã xuất và được thêm vào kho.')
  }

  function spendCredits(amount: number, action: string) {
    if (!user) return false
    if (credits < amount) {
      showToast(credits <= 0
        ? 'Bạn đã hết Credits, vui lòng nạp thêm để tiếp tục!'
        : `Bạn chưa đủ Credits để ${action}. Hiện còn ${credits}, cần ${amount}. Vui lòng nạp thêm!`)
      setPricingOpen(true)
      return false
    }
    const nextBalance = credits - amount
    setCredits(nextBalance)
    recordTransaction(-amount, action)
    saveUserCredits(user.email, nextBalance)
    showToast(`-${amount} Credits đã được trừ cho ${action}. Số dư: ${nextBalance} Credits.`)
    return true
  }

  function authenticate(nextUser: UserProfile, isNewAccount: boolean) {
    saveUserSession(nextUser)
    setUser(nextUser)
    const initialCredits = isNewAccount ? 20 : readUserCredits(nextUser.email)
    setCredits(initialCredits)
    if (isNewAccount) saveUserCredits(nextUser.email, initialCredits)
    setReferral(readUserReferral(nextUser.email))
    setTransactions(readUserTransactions(nextUser.email))
    setVideos(readUserVideos(nextUser.email))
    setVoices(readUserVoices(nextUser.email))
    setAuthNotice('')
  }

  function logout() {
    clearUserSession()
    setUser(null)
    setAuthNotice('Bạn đã đăng xuất thành công.')
  }

  function deleteVideo(id: string) {
    setVideos((current) => current.filter((video) => video.id !== id))
    showToast('Video đã được xóa khỏi kho.')
  }

  function purchaseCredits(amount: number, plan: string) {
    setCredits((current) => current + amount)
    recordTransaction(amount, `Nạp credits · ${plan}`)
    setPricingOpen(false)
    showToast(`Thanh toán thành công! Đã cộng ${amount.toLocaleString('vi-VN')} credits từ gói ${plan}.`)
  }

  if (!user) {
    return <AuthScreen lastUser={readLastUser()} notice={authNotice} onAuthenticate={authenticate} />
  }

  return (
    <div className={`app-shell${darkMode ? ' theme-dark' : ''}`}>
      <Header
        credits={credits}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        onOpenPricing={() => setPricingOpen(true)}
        onGoToSettings={() => setTab('settings')}
        user={user}
        onLogout={logout}
      />
      <Sidebar active={tab} onChange={setTab} />
      <main className="workspace" key={tab}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">AFFIVIDEO AI <span className="eyebrow-dot" /></p>
            <h1>{TAB_TITLES[tab]}</h1>
          </div>
          <span className="heading-date">Không gian sáng tạo của bạn</span>
        </div>
        {tab === 'create' && <CreateVideo voices={voices} onVideoCreated={addVideo} onSpendCredits={spendCredits} onToast={showToast} />}
        {tab === 'library' && <Library videos={videos} onDelete={deleteVideo} onToast={showToast} />}
        {tab === 'referral' && <Referral referral={referral} user={user} onToast={showToast} />}
        {tab === 'analytics' && <Analytics videos={videos} transactions={transactions} />}
        {tab === 'settings' && (
          <VoiceSettings
            credits={credits}
            transactions={transactions}
            voices={voices}
            onOpenPricing={() => setPricingOpen(true)}
            onAddVoice={(voice) => setVoices((current) => [...current, voice])}
            onRemoveVoice={(voice) => setVoices((current) => current.filter((item) => item !== voice))}
          />
        )}
      </main>
      <BottomNav active={tab} onChange={setTab} />
      {pricingOpen && <PricingModal onClose={() => setPricingOpen(false)} onConfirmPayment={purchaseCredits} />}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />}
    </div>
  )
}
