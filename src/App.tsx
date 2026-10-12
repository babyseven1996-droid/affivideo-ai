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
import type { AppTab, CreditTransaction, ReferralProfile, UserProfile, VideoRecord } from './types'
import { supabase } from './lib/supabase'

// Quản lý lưu trữ phiên đăng nhập
const STORAGE_USER_KEY = 'affivideo_user'

const readStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const saveUserSession = (user: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
  } catch (err) {
    console.error('Lỗi lưu session user:', err)
  }
}

const clearUserSession = () => {
  try {
    localStorage.removeItem(STORAGE_USER_KEY)
  } catch (err) {
    console.error('Lỗi xóa session user:', err)
  }
}

// Danh sách ảnh dự phòng cho video affiliate
const FALLBACK_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60',
]

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

  // KHỞI TẠO CREDITS AN TOÀN - TRIỆT TIÊU HOÀN TOÀN LỖI NaN
  const [credits, setCredits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('affivideo_credits')
      const parsed = Number(saved)
      if (isNaN(parsed) || parsed < 0) {
        localStorage.setItem('affivideo_credits', '50')
        return 50
      }
      return parsed
    } catch {
      return 50
    }
  })

  // Tự động đồng bộ credits xuống localStorage
  useEffect(() => {
    try {
      localStorage.setItem('affivideo_credits', String(credits))
    } catch {}
  }, [credits])

  const [transactions] = useState<CreditTransaction[]>([])
  const [referral] = useState<ReferralProfile>({ code: 'AFFI123', successfulReferrals: 0 })
  const [videos, setVideos] = useState<VideoRecord[]>(MOCK_VIDEOS)
  const [voices, setVoices] = useState<string[]>(['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào'])

  const [darkMode, setDarkMode] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [authNotice, setAuthNotice] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // 1. Đồng bộ Supabase Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authUser: UserProfile & { id?: string } = {
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          id: session.user.id,
        }
        setUser(authUser as UserProfile)
        saveUserSession(authUser as UserProfile)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser: UserProfile & { id?: string } = {
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          id: session.user.id,
        }
        setUser(authUser as UserProfile)
        saveUserSession(authUser as UserProfile)
      } else {
        setUser(null)
        clearUserSession()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Fetch danh sách Videos từ Supabase
  useEffect(() => {
    async function fetchSupabaseVideos() {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id || (user as { id?: string })?.id

      if (!currentUserId) return

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Lỗi lấy dữ liệu Supabase:', error.message)
      } else if (data && data.length > 0) {
        const formattedList = data.map((v: Record<string, any>, idx: number) => ({
          id: v.id,
          title: v.title || 'Video không tên',
          script: v.script || '',
          status: v.status || 'completed',
          videoUrl: v.video_url || 'https://example.com/sample.mp4',
          createdAt: v.created_at || new Date().toISOString(),
          date: v.created_at ? new Date(v.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          credits: 10,
          price: '0đ',
          image: v.image || FALLBACK_PRODUCT_IMAGES[idx % FALLBACK_PRODUCT_IMAGES.length],
          voice: voices[0] || 'Default',
        })) as unknown as VideoRecord[]

        setVideos(formattedList)
      }
    }

    fetchSupabaseVideos()
  }, [user])

  // 3. Lưu Video mới lên Supabase
  const handleSaveNewVideo = async (title: string, script: string, videoUrl?: string, image?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id || (user as { id?: string })?.id

    if (!currentUserId) {
      showToast('Vui lòng đăng nhập để lưu video!')
      return
    }

    const payload = {
      user_id: currentUserId,
      title: title || 'Video mới',
      script: script || '',
      status: 'completed',
      video_url: videoUrl || 'https://example.com/sample.mp4',
    }

    const { data, error } = await supabase
      .from('videos')
      .insert([payload])
      .select()

    if (error) {
      console.error('Lỗi INSERT dữ liệu Supabase:', error.message)
      showToast(`Lỗi lưu video: ${error.message}`)
    } else if (data && data[0]) {
      const created = data[0]
      const chosenImage = image || FALLBACK_PRODUCT_IMAGES[Math.floor(Math.random() * FALLBACK_PRODUCT_IMAGES.length)]
      
      const newVideoRecord = {
        id: created.id,
        title: created.title,
        script: created.script,
        status: created.status,
        videoUrl: created.video_url,
        createdAt: created.created_at,
        date: new Date(created.created_at || Date.now()).toLocaleDateString('vi-VN'),
        credits: 10,
        price: '0đ',
        image: chosenImage,
        voice: voices[0] || 'Default',
      } as unknown as VideoRecord

      setVideos((prev) => [newVideoRecord, ...prev])
      showToast('Tạo và lưu video thành công!')
    }
  }

  // 4. Xóa Video khỏi Supabase
  const handleDeleteVideo = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id || (user as { id?: string })?.id

    if (currentUserId) {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId)

      if (error) {
        console.error('Lỗi khi DELETE video:', error.message)
        showToast('Không thể xóa video trên database')
        return
      }
    }

    setVideos((prev) => prev.filter((v) => v.id !== id))
    showToast('Đã xóa video thành công!')
  }

  // 5. Đăng xuất
  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearUserSession()
    setUser(null)
    setAuthNotice('Đã đăng xuất thành công!')
  }

  if (!user) {
    return (
      <AuthScreen
        onLogin={(u) => {
          setUser(u)
          saveUserSession(u)
        }}
        notice={authNotice}
      />
    )
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <Header
        user={user}
        credits={credits}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenPricing={() => setPricingOpen(true)}
        onLogout={handleLogout}
      />
      <Sidebar active={tab} onChange={setTab} />

      <main className="workspace" key={tab}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              AFFIVIDEOS AI <span className="eyebrow-dot"></span>
            </p>
            <h1>{TAB_TITLES[tab]}</h1>
          </div>
          <span className="heading-date">Không gian sáng tạo của bạn</span>
        </div>

        {tab === 'create' && (
          <CreateVideo
            voices={voices}
            onVideoCreated={handleSaveNewVideo}
            onSpendCredits={(amount) => {
              setCredits((prev) => {
                const current = isNaN(Number(prev)) ? 50 : Number(prev)
                const deduct = Number(amount) || 0
                return Math.max(0, current - deduct)
              })
            }}
            onToast={showToast}
          />
        )}
        {tab === 'library' && (
          <Library
            videos={videos}
            onDelete={handleDeleteVideo}
            onToast={showToast}
          />
        )}
        {tab === 'referral' && (
          <Referral
            referral={referral}
            user={user}
            onToast={showToast}
          />
        )}
        {tab === 'analytics' && (
          <Analytics
            videos={videos}
            transactions={transactions}
          />
        )}
        {tab === 'settings' && (
          <VoiceSettings
            credits={credits}
            transactions={transactions}
            voices={voices}
            onOpenPricing={() => setPricingOpen(true)}
            onAddVoice={(v) => setVoices((curr) => [...curr, v])}
            onRemoveVoice={(v) => setVoices((curr) => curr.filter((item) => item !== v))}
            onToast={showToast}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {pricingOpen && (
        <PricingModal
          onClose={() => setPricingOpen(false)}
          onConfirmPayment={(pkg: any) => {
            setCredits((prev) => {
              const current = isNaN(Number(prev)) ? 50 : Number(prev)
              const add = Number(pkg?.credits) || Number(pkg?.amount) || 0
              return current + add
            })
            setPricingOpen(false)
            showToast(`Nạp thành công ${pkg?.credits || pkg?.amount || 0} credits!`)
          }}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
      )}
    </div>
  )
}