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
  id: string
  email: string
  name: string
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

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tab, setTab] = useState<AppTab>('create')
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [voices, setVoices] = useState<string[]>(['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào'])
  const [referral, setReferral] = useState({ code: 'AFFI123', successfulReferrals: 0 })
  const [toastMessage, setToastMessage] = useState<string>('')

  // State Landing Page & Auth Modal
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false)
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // State nạp tiền & User Menu
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; credits: number; price: number; priceText: string } | null>(null)
  const [currentTxCode, setCurrentTxCode] = useState<string>('')
  const [isWaitingPayment, setIsWaitingPayment] = useState<boolean>(false)

  const [credits, setCredits] = useState<number>(50)

  useEffect(() => {
    if (user?.id) {
      const userCreditKey = `affivideo_credits_${user.id}`
      const saved = localStorage.getItem(userCreditKey)
      if (saved !== null) {
        setCredits(Number(saved) || 0)
      } else {
        localStorage.setItem(userCreditKey, '50')
        setCredits(50)
      }
    }
  }, [user])

  const updateCredits = (newAmount: number) => {
    setCredits(newAmount)
    if (user?.id) {
      localStorage.setItem(`affivideo_credits_${user.id}`, String(newAmount))
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Khởi tạo Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Creator',
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Creator',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchSupabaseVideos = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const formattedList: VideoRecord[] = data.map((v: Record<string, any>, idx: number) => ({
          id: v.id || `vid_${idx}`,
          title: v.title || 'Video Affiliate AI',
          script: v.script || '',
          status: v.status || 'completed',
          videoUrl: v.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4',
          createdAt: v.created_at || new Date().toISOString(),
          date: new Date(v.created_at || Date.now()).toLocaleDateString('vi-VN'),
          credits: 5,
          price: '0đ',
          image: v.image_url || FALLBACK_PRODUCT_IMAGES[idx % FALLBACK_PRODUCT_IMAGES.length],
          voice: v.voice || voices[0],
        }))
        setVideos(formattedList)
      }
    } catch (err) {
      console.error('Fetch videos error:', err)
    }
  }

  useEffect(() => {
    fetchSupabaseVideos()
  }, [user])

  // Lắng nghe Realtime Webhook VietQR
  useEffect(() => {
    if (!currentTxCode || !user?.id) return

    const channel = supabase
      .channel('public:transactions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `code=eq.${currentTxCode}`,
        },
        (payload) => {
          if (payload.new && payload.new.status === 'completed') {
            const addedCredits = payload.new.credits_added || 0
            updateCredits(credits + addedCredits)
            setShowPricingModal(false)
            setSelectedPackage(null)
            setIsWaitingPayment(false)
            showToast(`🎉 TỰ ĐỘNG XÁC NHẬN! Đã cộng ${addedCredits} Credits!`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentTxCode, user, credits])

  const handleSelectPackage = async (pkg: { name: string; credits: number; price: number; priceText: string }) => {
    setSelectedPackage(pkg)
    if (!user?.id) return

    const txCode = `AFFI${pkg.credits}_${Date.now().toString().slice(-6)}`
    setCurrentTxCode(txCode)
    setIsWaitingPayment(true)

    try {
      await supabase.from('transactions').insert([
        {
          user_id: user.id,
          code: txCode,
          amount: pkg.price,
          credits_added: pkg.credits,
          status: 'pending',
        },
      ])
    } catch (err) {
      console.error('Lỗi tạo transaction:', err)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail || !authPassword) {
      showToast('Vui lòng nhập Email và Mật khẩu!')
      return
    }
    setAuthLoading(true)

    try {
      if (isSignUpMode) {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        showToast('Đăng ký tài khoản thành công!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        showToast('Đăng nhập thành công!')
      }
      setShowAuthModal(false)
    } catch (err: any) {
      showToast(err.message || 'Lỗi đăng nhập/đăng ký!')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    setShowUserMenu(false)
    await supabase.auth.signOut()
    setUser(null)
    setVideos([])
    showToast('Đã đăng xuất tài khoản!')
  }

  const handleSaveNewVideo = async (title: string, script: string, videoUrl?: string, image?: string) => {
    const chosenImage = image || FALLBACK_PRODUCT_IMAGES[Math.floor(Math.random() * FALLBACK_PRODUCT_IMAGES.length)]
    const finalVideoUrl = videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'

    const tempVideo: VideoRecord = {
      id: `vid_${Date.now()}`,
      title: title || 'Video Reup Affiliate',
      script: script || '',
      status: 'completed',
      videoUrl: finalVideoUrl,
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('vi-VN'),
      credits: 5,
      price: '0đ',
      image: chosenImage,
      voice: voices[0] || 'Nam miền Bắc trầm ấm',
    }

    setVideos((prev) => [tempVideo, ...prev])
    showToast('Đã tạo và lưu video vào Kho thành công!')

    try {
      if (user?.id) {
        const { error } = await supabase.from('videos').insert([
          {
            user_id: user.id,
            title: tempVideo.title,
            script: tempVideo.script,
            status: 'completed',
            video_url: tempVideo.videoUrl,
            image_url: tempVideo.image,
          },
        ])

        if (!error) fetchSupabaseVideos()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteVideo = async (id: string) => {
  try {
    // 1. Gọi lệnh xóa vĩnh viễn khỏi bảng 'videos' trên Supabase
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Lỗi xóa trên Supabase:', error.message);
      showToast('Xóa thất bại do lỗi database!');
      return;
    }

    // 2. Xóa thành công ở database thì mới cập nhật lại giao diện
    setVideos((prev) => prev.filter((v) => v.id !== id));
    showToast('🗑️ Đã xóa video thành công!');
  } catch (err) {
    console.error('❌ Lỗi hệ thống khi xóa:', err);
  }
  }
  // ==========================================
  // GIAO DIỆN 1: LANDING PAGE CHO KHÁCH VÃNG LAI (!user)
  // ==========================================
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#0f172a' }}>
        
        {/* Navigation Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #e2e8f0', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
              ✦
            </div>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              AffiVideo <span style={{ color: '#059669' }}>AI</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setIsSignUpMode(false); setShowAuthModal(true) }}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#059669', border: '1px solid #059669', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setIsSignUpMode(true); setShowAuthModal(true) }}
              style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Dùng thử miễn phí
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '80px 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            🚀 Nền tảng Reup & Tạo Video AI Hàng Đầu Cho Affiliate
          </span>
          <h1 style={{ fontSize: '44px', fontWeight: '800', lineHeight: '1.2', margin: '20px 0', color: '#0f172a' }}>
            Tự động hóa Reup Video & Lách Bản Quyền <span style={{ color: '#059669' }}>Chỉ Với 1 Click</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
            Tải video sạch không logo từ TikTok, Douyin, Facebook Reels, Shorts. Tự động lật khung hình, chỉnh tốc độ và xuất bản hàng loạt cho nhà sáng tạo nội dung.
          </p>
          <button
            onClick={() => { setIsSignUpMode(true); setShowAuthModal(true) }}
            style={{ padding: '16px 36px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)' }}
          >
            Bắt đầu sáng tạo ngay ➔
          </button>
        </section>

        {/* Features Grid */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '40px' }}>Tính Năng Vượt Trội</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>📥</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Bóc Tách Không Watermark</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>Lấy link video gốc sắc nét từ TikTok, Douyin, YouTube Shorts không dính logo chỉ trong 2 giây.</p>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>🛡️</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Lách Bản Quyền Thông Minh</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>Tự động lật gương (Flip), đổi tốc độ nhẹ giúp vượt qua kiểm duyệt bản quyền tự động.</p>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚡</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Thanh Toán Auto-Bank 24/7</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>Hệ thống quét VietQR tự động cộng credits sau 3 giây khi chuyển khoản thành công.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Auth Modal */}
        {showAuthModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              
              <button
                onClick={() => setShowAuthModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
                  {isSignUpMode ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập AffiVideo AI'}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Truy cập hệ thống Reup video tự động hàng loạt</p>
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
                  style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: authLoading ? 'not-allowed' : 'pointer', marginTop: '6px' }}
                >
                  {authLoading ? '⏳ Đang xử lý...' : (isSignUpMode ? 'Đăng Ký Ngay' : 'Đăng Nhập')}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '18px' }}>
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(!isSignUpMode)}
                  style={{ background: 'none', border: 'none', color: '#059669', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSignUpMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
                </button>
              </div>

            </div>
          </div>
        )}

        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', zIndex: 9999 }}>
            {toastMessage}
          </div>
        )}

      </div>
    )
  }

  // ==========================================
  // GIAO DIỆN 2: DASHBOARD SAU KHI ĐĂNG NHẬP (user)
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 16px', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              ✦
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
              AffiVideo <span style={{ color: '#059669' }}>AI</span>
            </span>
          </div>

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
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div onClick={() => setTab('settings')} style={{ backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #dcfce7' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#166534', margin: 0 }}>Giọng nói của bạn</p>
          <p style={{ fontSize: '11px', color: '#15803d', margin: '2px 0 0 0' }}>Sẵn sàng sáng tạo</p>
        </div>
      </aside>

      {/* CONTENT MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: '16px' }}>
          <button
            onClick={() => setShowPricingModal(true)}
            style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #fde68a', cursor: 'pointer' }}
          >
            ⚡ {credits} Credits <span style={{ fontSize: '11px', backgroundColor: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>Nạp +</span>
          </button>

          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>

            {showUserMenu && (
              <div style={{ position: 'absolute', right: 0, top: '44px', width: '220px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px', zIndex: 1000 }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 2px 0' }}>{user.name}</p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>{user.email}</p>
                <button onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', background: '#fef2f2', border: 'none', padding: '8px', fontSize: '13px', color: '#dc2626', cursor: 'pointer', borderRadius: '6px', fontWeight: '600' }}>
                  🚪 Đăng xuất
                </button>
              </div>
            )}
          </div>
        </header>

        {/* MAIN BODY */}
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981', margin: '0 0 4px 0' }}>AFFIVIDEOS AI •</p>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{TAB_TITLES[tab]}</h1>
          </div>

          {tab === 'create' && (
            <CreateVideo
              credits={credits}
              voices={voices}
              onVideoCreated={handleSaveNewVideo}
              onSpendCredits={(amount) => {
                if (credits < amount) {
                  showToast('Hết credits! Vui lòng nạp thêm.')
                  return false
                }
                updateCredits(credits - amount)
                return true
              }}
              onToast={showToast}
            />
          )}

          {tab === 'library' && (
            <Library videos={videos} onDelete={handleDeleteVideo} onToast={showToast} />
          )}

          {tab === 'referral' && (
            <Referral referral={referral} user={user} onToast={showToast} />
          )}

          {tab === 'analytics' && (
            <Analytics videos={videos} />
          )}

          {tab === 'settings' && (
            <VoiceSettings
              user={user}
              credits={credits}
              voices={voices}
              onOpenPricing={() => setShowPricingModal(true)}
              onAddVoice={(v) => setVoices([...voices, v])}
              onRemoveVoice={(v) => setVoices(voices.filter((x) => x !== v))}
              onToast={showToast}
            />
          )}
        </main>
      </div>

      {/* MODAL NẠP CREDITS TÍCH HỢP VIETQR AUTO-BANK */}
      {showPricingModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: selectedPackage ? '560px' : '520px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button
              onClick={() => {
                setShowPricingModal(false)
                setSelectedPackage(null)
                setIsWaitingPayment(false)
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: '#64748b' }}
            >
              ✕
            </button>

            {!selectedPackage ? (
              <>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', textAlign: 'center' }}>Nạp Thêm Credits Sáng Tạo</h3>
                <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>Chọn gói credits phù hợp để tiếp tục Reup video tự động hàng loạt.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  
                  <div 
                    onClick={() => handleSelectPackage({ name: 'Gói Cơ Bản', credits: 100, price: 99000, priceText: '99.000đ' })}
                    style={{ padding: '18px', border: '2px solid #10b981', borderRadius: '16px', cursor: 'pointer', backgroundColor: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#065f46', margin: 0, fontSize: '15px' }}>Gói Cơ Bản (100 Credits)</p>
                      <p style={{ fontSize: '12px', color: '#047857', margin: '3px 0 0 0' }}>Reup khoảng 20 video không logo</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '17px' }}>99.000đ</span>
                  </div>

                  <div 
                    onClick={() => handleSelectPackage({ name: 'Gói Chuyên Nghiệp', credits: 500, price: 399000, priceText: '399.000đ' })}
                    style={{ padding: '18px', border: '2px solid #3b82f6', borderRadius: '16px', cursor: 'pointer', backgroundColor: '#eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#1e40af', margin: 0, fontSize: '15px' }}>Gói Chuyên Nghiệp (500 Credits) 🔥</p>
                      <p style={{ fontSize: '12px', color: '#1d4ed8', margin: '3px 0 0 0' }}>Reup khoảng 100 video không logo</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '17px' }}>399.000đ</span>
                  </div>

                  <div 
                    onClick={() => handleSelectPackage({ name: 'Gói VIP Doanh Nghiệp', credits: 1000, price: 699000, priceText: '699.000đ' })}
                    style={{ padding: '18px', border: '2px solid #8b5cf6', borderRadius: '16px', cursor: 'pointer', backgroundColor: '#f5f3ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#5b21b6', margin: 0, fontSize: '15px' }}>Gói VIP (1.000 Credits) 👑</p>
                      <p style={{ fontSize: '12px', color: '#6d28d9', margin: '3px 0 0 0' }}>Reup 200 video + Ưu tiên server Bóc tách</p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '17px' }}>699.000đ</span>
                  </div>

                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setSelectedPackage(null)
                    setIsWaitingPayment(false)
                  }}
                  style={{ background: 'none', border: 'none', color: '#059669', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', float: 'left' }}
                >
                  ← Chọn lại gói khác
                </button>
                <div style={{ clear: 'both' }}></div>

                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                  Thanh Toán Auto-Bank: {selectedPackage.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Quét mã QR bằng App Ngân hàng. Hệ thống sẽ tự động cộng Credits sau khi chuyển khoản thành công!
                </p>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '16px' }}>
                  <img
                    src={`https://img.vietqr.io/image/MB-0333333333-compact2.png?amount=${selectedPackage.price}&addInfo=${encodeURIComponent(currentTxCode)}&accountName=${encodeURIComponent('AFFIVIDEO AI')}`}
                    alt="VietQR Payment"
                    style={{ width: '220px', height: '220px', objectFit: 'contain', borderRadius: '12px' }}
                  />
                  <div style={{ marginTop: '12px', textAlign: 'left', fontSize: '13px', color: '#334155' }}>
                    <p style={{ margin: '4px 0' }}>Số tiền: <strong style={{ color: '#059669', fontSize: '15px' }}>{selectedPackage.priceText}</strong></p>
                    <p style={{ margin: '4px 0' }}>Nội dung chuyển khoản: <strong style={{ color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>{currentTxCode}</strong></p>
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#166534', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span>🔄</span> Đang chờ ngân hàng xác nhận giao dịch tự động...
                </div>

                <button
                  onClick={() => {
                    updateCredits(credits + selectedPackage.credits)
                    setShowPricingModal(false)
                    setSelectedPackage(null)
                    setIsWaitingPayment(false)
                    showToast(`Thanh toán thành công! Đã cộng ${selectedPackage.credits} Credits!`)
                  }}
                  style={{ width: '100%', padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  ✓ Tôi đã chuyển khoản xong (Xác nhận ngay)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

    </div>
  )
}