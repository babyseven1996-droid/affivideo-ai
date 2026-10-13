import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import CreateVideo from './components/CreateVideo'
import Library from './pages/Library'
import Referral from './pages/Referral'
import Analytics from './pages/Analytics'
import VoiceSettings from './pages/VoiceSettings'

export type AppTab = 'create' | 'library' | 'referral' | 'analytics' | 'settings'

export interface VideoRecord {
  id: string
  title: string
  script: string
  status: string
  videoUrl: string
  createdAt: string
  date: string
  credits: number
  price: string
  image: string
  voice: string
}

export interface UserProfile {
  id?: string
  email?: string
  name?: string
}

const FALLBACK_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae'
]

const TAB_TITLES: Record<AppTab, string> = {
  create: 'Tạo video',
  library: 'Kho video',
  referral: 'Giới thiệu',
  analytics: 'Thống kê',
  settings: 'Cài đặt',
}

const DEFAULT_MOCK_VIDEOS: VideoRecord[] = [
  {
    id: 'vid_sample_1',
    title: 'Máy xay sinh tố cầm tay mini',
    script: 'Hook: Chuẩn bị sinh tố nhanh gọn ngay tại bàn làm việc!',
    status: 'completed',
    videoUrl: 'https://example.com/sample.mp4',
    createdAt: new Date().toISOString(),
    date: new Date().toLocaleDateString('vi-VN'),
    credits: 5,
    price: '0đ',
    image: FALLBACK_PRODUCT_IMAGES[0],
    voice: 'Nam miền Bắc trầm ấm',
  }
]

export default function App() {
  const [selectedPackage, setSelectedPackage] = useState<{
    name: string
    credits: number
    price: number
    priceText: string
  } | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tab, setTab] = useState<AppTab>('create')
  const [videos, setVideos] = useState<VideoRecord[]>(DEFAULT_MOCK_VIDEOS)
  const [voices, setVoices] = useState<string[]>(['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào'])
  const [referral, setReferral] = useState({ code: 'AFFI123', successfulReferrals: 0 })
  const [toastMessage, setToastMessage] = useState<string>('')

  // State điều khiển Modal nạp tiền & User Menu
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Form Đăng nhập / Đăng ký khi chưa authed
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // Khởi tạo Credits an toàn từ LocalStorage
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

  // Lưu Credits xuống LocalStorage khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('affivideo_credits', String(credits))
    } catch (e) {
      console.error(e)
    }
  }, [credits])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // 1. Đồng bộ Supabase Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authUser: UserProfile = {
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          id: session.user.id,
        }
        setUser(authUser)
      } else {
        setUser(null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser: UserProfile = {
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          id: session.user.id,
        }
        setUser(authUser)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Fetch danh sách Videos từ Supabase
  const fetchSupabaseVideos = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Lỗi lấy dữ liệu Supabase:', error.message)
        return
      }

      if (data && data.length > 0) {
        const formattedList: VideoRecord[] = data.map((v: Record<string, any>, idx: number) => ({
          id: v.id || `vid_${idx}`,
          title: v.title || 'Video sản phẩm Affiliate',
          script: v.script || '',
          status: v.status || 'completed',
          videoUrl: v.video_url || 'https://example.com/sample.mp4',
          createdAt: v.created_at || new Date().toISOString(),
          date: new Date(v.created_at || Date.now()).toLocaleDateString('vi-VN'),
          credits: 5,
          price: '0đ',
          image: FALLBACK_PRODUCT_IMAGES[idx % FALLBACK_PRODUCT_IMAGES.length],
          voice: voices[0] || 'Nam miền Bắc trầm ấm',
        }))
        setVideos(formattedList)
      }
    } catch (err) {
      console.error('Lỗi fetchSupabaseVideos:', err)
    }
  }

  useEffect(() => {
    fetchSupabaseVideos()
  }, [user])

  // Xử lý Đăng nhập / Đăng ký
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail || !authPassword) {
      showToast('Vui lòng nhập đầy đủ Email và Mật khẩu!')
      return
    }
    setAuthLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        showToast('Đăng ký thành công! Vui lòng kiểm tra email để xác thực hoặc đăng nhập.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        showToast('Đăng nhập thành công!')
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi xác thực tài khoản!')
    } finally {
      setAuthLoading(false)
    }
  }

  // Xử lý Đăng xuất
  const handleSignOut = async () => {
    setShowUserMenu(false)
    await supabase.auth.signOut()
    setUser(null)
    showToast('Đã đăng xuất thành công!')
  }

  // Lưu Video mới tạo
  const handleSaveNewVideo = async (title: string, script: string, videoUrl?: string, image?: string) => {
    const chosenImage = image || FALLBACK_PRODUCT_IMAGES[Math.floor(Math.random() * FALLBACK_PRODUCT_IMAGES.length)]
    
    const tempVideo: VideoRecord = {
      id: `vid_${Date.now()}`,
      title: title || 'Video sản phẩm mới',
      script: script || '',
      status: 'completed',
      videoUrl: videoUrl || 'https://example.com/sample.mp4',
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('vi-VN'),
      credits: 5,
      price: '0đ',
      image: chosenImage,
      voice: voices[0] || 'Nam miền Bắc trầm ấm',
    }

    setVideos((prev) => [tempVideo, ...prev])
    showToast('Đã tạo và lưu video vào Kho video thành công!')

    try {
      const currentUserId = user?.id
      if (currentUserId) {
        await supabase.from('videos').insert([
          {
            user_id: currentUserId,
            title: tempVideo.title,
            script: tempVideo.script,
            status: 'completed',
            video_url: tempVideo.videoUrl,
          },
        ])
        fetchSupabaseVideos()
      }
    } catch (err) {
      console.error('Lỗi lưu Supabase:', err)
    }
  }

  const handleDeleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id))
    showToast('Đã xóa video khỏi Kho video.')
  }

  const handleAddVoice = (newVoice: string) => {
    if (!voices.includes(newVoice)) {
      setVoices((prev) => [...prev, newVoice])
      showToast(`Đã thêm giọng đọc: ${newVoice}`)
    }
  }

  const handleRemoveVoice = (voiceToRemove: string) => {
    setVoices((prev) => prev.filter((v) => v !== voiceToRemove))
    showToast(`Đã xóa giọng đọc: ${voiceToRemove}`)
  }

  // ================= 0. GIAO DIỆN ĐĂNG NHẬP (HIỆN KHI CHƯA ĐĂNG NHẬP) =================
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '40px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#059669', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', marginBottom: '12px' }}>
              ✦
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              AffiVideo <span style={{ color: '#059669' }}>AI</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
              {isSignUp ? 'Tạo tài khoản mới để bắt đầu' : 'Đăng nhập để quản lý sáng tạo video'}
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                placeholder="yours@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: authLoading ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'background 0.2s' }}
            >
              {authLoading ? '⏳ Đang xử lý...' : (isSignUp ? 'Tạo Tài Khoản' : 'Đăng Nhập Ngay')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: '#059669', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
            </button>
          </div>

        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '14px', zIndex: 9999 }}>
            {toastMessage}
          </div>
        )}
      </div>
    )
  }

  // ================= MAIN APP (HIỆN KHI ĐÃ ĐĂNG NHẬP) =================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* ================= 1. SIDEBAR MENU BÊN TRÁI ================= */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 16px', flexShrink: 0 }}>
        <div>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              ✦
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
              AffiVideo <span style={{ color: '#059669' }}>AI</span>
            </span>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '8px' }}>
            MENU CHÍNH
          </p>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'create', label: 'Tạo video', icon: '🎬' },
              { id: 'library', label: 'Kho video', icon: '田' },
              { id: 'referral', label: 'Giới thiệu', icon: '🎁' },
              { id: 'analytics', label: 'Thống kê', icon: '📊' },
              { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
            ].map((item) => {
              const isActive = tab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as AppTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isActive ? '#e6f4ea' : 'transparent',
                    color: isActive ? '#047857' : '#475569',
                    fontWeight: isActive ? '600' : 'normal',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Khung Giọng nói ở chân Sidebar */}
        <div 
          onClick={() => setTab('settings')}
          style={{ backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #dcfce7' }}
        >
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#166534', margin: 0 }}>Giọng nói của bạn</p>
          <p style={{ fontSize: '11px', color: '#15803d', margin: '2px 0 0 0' }}>Sẵn sàng sáng tạo</p>
        </div>
      </aside>

      {/* ================= 2. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header trên cùng */}
        <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: '16px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            Đang hoạt động
          </div>

          {/* Nút Nạp Credits */}
          <button
            onClick={() => setShowPricingModal(true)}
            style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #fde68a',
              cursor: 'pointer',
            }}
            title="Nhấp để nạp thêm Credits"
          >
            ⚡ {credits} Credits <span style={{ fontSize: '11px', backgroundColor: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>Nạp +</span>
          </button>

          <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>
            🌙
          </button>

          {/* Avatar & User Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
              title="Tài khoản của bạn"
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* Menu thả xuống khi click vào Avatar */}
            {showUserMenu && (
              <div style={{ position: 'absolute', right: 0, top: '44px', width: '220px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px', zIndex: 1000 }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Creator'}
                </p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      setTab('settings')
                    }}
                    style={{ textAlign: 'left', background: 'none', border: 'none', padding: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '6px' }}
                  >
                    ⚙️ Cài đặt tài khoản
                  </button>
                  <button
                    onClick={handleSignOut}
                    style={{ textAlign: 'left', background: '#fef2f2', border: 'none', padding: '8px', fontSize: '13px', color: '#dc2626', cursor: 'pointer', borderRadius: '6px', fontWeight: '600' }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Thân trang (Body Content) */}
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
          
          {/* Tiêu đề trang */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                AFFIVIDEOS AI •
              </p>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                {TAB_TITLES[tab]}
              </h1>
            </div>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Không gian sáng tạo của bạn</span>
          </div>

          {/* Render Nội dung từng Tab */}
          {tab === 'create' && (
            <CreateVideo
              credits={credits}
              voices={voices || ['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào']}
              onVideoCreated={handleSaveNewVideo}
              onSpendCredits={(amount) => {
                let hasEnough = true
                setCredits((prev) => {
                  const current = isNaN(Number(prev)) ? 50 : Number(prev)
                  const deduct = Number(amount) || 0
                  if (current < deduct) {
                    hasEnough = false
                    return current
                  }
                  return current - deduct
                })
                if (!hasEnough) {
                  showToast('Bạn đã hết credits! Vui lòng nạp thêm để tiếp tục.')
                  return false
                }
                return true
              }}
              onToast={showToast}
            />
          )}

          {tab === 'library' && (
            <Library
              videos={videos && videos.length > 0 ? videos : DEFAULT_MOCK_VIDEOS}
              onDelete={handleDeleteVideo}
              onToast={showToast}
            />
          )}

          {tab === 'referral' && (
            <Referral
              referral={referral || { code: 'AFFI123', successfulReferrals: 0 }}
              user={user || { name: 'Creator', email: 'user@affivideo.ai' }}
              onToast={showToast}
            />
          )}

          {tab === 'analytics' && (
            <Analytics />
          )}

          {tab === 'settings' && (
            <VoiceSettings
              credits={credits}
              transactions={[]}
              voices={voices || ['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào']}
              onOpenPricing={() => setShowPricingModal(true)}
              onAddVoice={handleAddVoice}
              onRemoveVoice={handleRemoveVoice}
              onToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modal Nạp Credits (Bao gồm 3 Gói Nạp: Cơ bản, Chuyên nghiệp & VIP) */}
      {/* Modal Nạp Credits Tích hợp VietQR Thanh Toán */}
      {showPricingModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: selectedPackage ? '560px' : '520px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button
              onClick={() => {
                setShowPricingModal(false)
                setSelectedPackage(null)
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: '#64748b' }}
            >
              ✕
            </button>

            {!selectedPackage ? (
              <>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', textAlign: 'center' }}>Nạp Thêm Credits Sáng Tạo</h3>
                <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>Chọn gói credits phù hợp để tiếp tục tạo video tự động hàng loạt.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  
                  {/* Gói 1 */}
                  <div 
                    onClick={() => setSelectedPackage({ name: 'Gói Cơ Bản', credits: 100, price: 99000, priceText: '99.000đ' })}
                    style={{ padding: '18px', border: '2px solid #10b981', borderRadius: '16px', cursor: 'pointer', backgroundColor: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#065f46', margin: 0, fontSize: '15px' }}>Gói Cơ Bản (100 Credits)</p>
                      <p style={{ fontSize: '12px', color: '#047857', margin: '3px 0 0 0' }}>Tạo khoảng 20 video ngắn</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '17px' }}>99.000đ</span>
                  </div>

                  {/* Gói 2 */}
                  <div 
                    onClick={() => setSelectedPackage({ name: 'Gói Chuyên Nghiệp', credits: 500, price: 399000, priceText: '399.000đ' })}
                    style={{ padding: '18px', border: '2px solid #3b82f6', borderRadius: '16px', cursor: 'pointer', backgroundColor: '#eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#1e40af', margin: 0, fontSize: '15px' }}>Gói Chuyên Nghiệp (500 Credits) 🔥</p>
                      <p style={{ fontSize: '12px', color: '#1d4ed8', margin: '3px 0 0 0' }}>Tạo khoảng 100 video ngắn</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '17px' }}>399.000đ</span>
                  </div>

                  {/* Gói 3 */}
                  <div 
                    onClick={() => setSelectedPackage({ name: 'Gói VIP Doanh Nghiệp', credits: 1000, price: 699000, priceText: '699.000đ' })}
                    style={{ padding: '18px', border: '2px solid #8b5cf6', borderRadius: '16px', cursor: 'pointer', backgroundColor: '#f5f3ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#5b21b6', margin: 0, fontSize: '15px' }}>Gói VIP Doanh Nghiệp (1.000 Credits) 👑</p>
                      <p style={{ fontSize: '12px', color: '#6d28d9', margin: '3px 0 0 0' }}>Tạo 200 video + Ưu tiên server AI</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '17px' }}>699.000đ</span>
                  </div>

                </div>
              </>
            ) : (
              /* MÀN HÌNH QUÉT MÃ QR THANH TOÁN */
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setSelectedPackage(null)}
                  style={{ background: 'none', border: 'none', color: '#059669', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', float: 'left' }}
                >
                  ← Chọn lại gói khác
                </button>
                <div style={{ clear: 'both' }}></div>

                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                  Thanh Toán: {selectedPackage.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                  Quét mã QR dưới đây bằng App Ngân hàng (MBBank, Vietcombank, Momo, VPBank...)
                </p>

                {/* Khung Hiển thị Mã VietQR */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '20px' }}>
                  <img
                    src={`https://img.vietqr.io/image/MB-0333333333-compact2.png?amount=${selectedPackage.price}&addInfo=${encodeURIComponent(`NAP ${selectedPackage.credits} CREDITS AFFIVIDEO`)}&accountName=${encodeURIComponent('AFFIVIDEO AI')}`}
                    alt="Mã QR Thanh Toán"
                    style={{ width: '240px', height: '240px', objectFit: 'contain', borderRadius: '12px' }}
                  />
                  <div style={{ marginTop: '12px', textAlign: 'left', fontSize: '13px', color: '#334155' }}>
                    <p style={{ margin: '4px 0' }}>Số tiền: <strong style={{ color: '#059669', fontSize: '15px' }}>{selectedPackage.priceText}</strong></p>
                    <p style={{ margin: '4px 0' }}>Nội dung chuyển khoản: <strong style={{ color: '#2563eb' }}>NAP {selectedPackage.credits} CREDITS</strong></p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setCredits(prev => prev + selectedPackage.credits)
                      setShowPricingModal(false)
                      setSelectedPackage(null)
                      showToast(`Thanh toán thành công! Hệ thống đã cộng ${selectedPackage.credits} Credits vào tài khoản!`)
                    }}
                    style={{ flex: 1, padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                  >
                    ✓ Tôi đã chuyển khoản xong
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowPricingModal(false)}
              style={{ width: '100%', padding: '12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '14px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

    </div>
  )
}