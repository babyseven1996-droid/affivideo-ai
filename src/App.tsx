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
      try {
        // Lấy trực tiếp toàn bộ danh sách video từ bảng videos để hiển thị ngay vào Kho video
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Lỗi lấy dữ liệu Supabase:', error.message)
          return
        }

        if (data && data.length > 0) {
          const formattedList = data.map((v: Record<string, any>, idx: number) => ({
            id: v.id,
            title: v.title || 'Video sản phẩm Affiliate',
            script: v.script || '',
            status: v.status || 'completed',
            videoUrl: v.video_url || 'https://example.com/sample-video.mp4',
            createdAt: v.created_at || new Date().toISOString(),
            date: new Date(v.created_at || Date.now()).toLocaleDateString('vi-VN'),
            credits: 5,
            price: '0đ',
            image: FALLBACK_PRODUCT_IMAGES[idx % FALLBACK_PRODUCT_IMAGES.length],
            voice: voices[0] || 'Nam miền Bắc trầm ấm',
          }))
          setVideos(formattedList as VideoRecord[])
        }
      } catch (err) {
        console.error('Lỗi fetchSupabaseVideos:', err)
      }
    }

    fetchSupabaseVideos()
  }, [])

  // 3. Lưu Video mới vào Kho video (Library) & Supabase
  const handleSaveNewVideo = async (title: string, script: string, videoUrl?: string, image?: string) => {
    const chosenImage = image || FALLBACK_PRODUCT_IMAGES[Math.floor(Math.random() * FALLBACK_PRODUCT_IMAGES.length)]
    
    // 1. Tạo đối tượng hiển thị ngay lập tức trên giao diện
    const tempVideo: VideoRecord = {
      id: `vid_${Date.now()}`,
      title: title || 'Video sản phẩm mới',
      script: script || '',
      status: 'completed',
      videoUrl: videoUrl || 'https://example.com/sample-video.mp4',
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('vi-VN'),
      credits: 5,
      price: '0đ',
      image: chosenImage,
      voice: voices[0] || 'Nam miền Bắc trầm ấm',
    } as unknown as VideoRecord

    // Cập nhật State cho Kho video ngay lập tức
    setVideos((prev) => [tempVideo, ...prev])
    showToast('Đã tạo và lưu video vào Kho video thành công!')

    // 2. Lưu ngầm lên Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id || (user as { id?: string })?.id

      if (currentUserId) {
        const { data, error } = await supabase.from('videos').insert([
          {
            user_id: currentUserId,
            title: tempVideo.title,
            script: tempVideo.script,
            status: 'completed',
            video_url: tempVideo.videoUrl,
          },
        ]).select()

        // Nếu Supabase trả về ID thật, cập nhật lại để đồng bộ
        if (data && data[0]) {
          fetchVideos()
        }
      }
    } catch (err) {
      console.error('Lỗi đồng bộ Supabase:', err)
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
          credits={credits}
            voices={voices}
            onVideoCreated={handleSaveNewVideo}
            onSpendCredits={(amount) => {
              let hasEnough = true
              setCredits((prev) => {
                const current = isNaN(Number(prev)) ? 50 : Number(prev)
                const deduct = Number(amount) || 0
                
                
                // Nếu số dư không đủ -> giữ nguyên điểm và bật cờ chặn
                if (current < deduct) {
                  hasEnough = false
                  return current
                }
                return current - deduct
              })

              if (!hasEnough) {
                showToast('Bạn đã hết credits! Vui lòng nạp thêm để tiếp tục.')
                return false // Trả về false để chặn tuyệt đối không cho chạy tiếp
              }
              return true
            }}
            onToast={showToast}
          />
        )}
      </main>
{/* Render Kho video */}
        {tab === 'library' && (
          <Library
            videos={videos}
            onDelete={handleDeleteVideo}
            onToast={showToast}
          />
        )}

        {/* Render Giới thiệu / Referral */}
        {tab === 'referral' && (
          <Referral
            referral={referral}
            user={user}
            onToast={showToast}
          />
        )}

        {/* Render Thống kê */}
        {tab === 'analytics' && (
          <Analytics />
        )}

        {/* Render Cài đặt / Giọng nói */}
        {tab === 'settings' && (
          <VoiceSettings
            voices={voices}
            onToast={showToast}
          />
        )}
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