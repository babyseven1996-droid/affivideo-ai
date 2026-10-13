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

  // State điều khiển Modal nạp tiền & User Menu
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; credits: number; price: number; priceText: string } | null>(null)

  // Form Đăng nhập / Đăng ký
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // Quản lý Credits độc lập theo User ID (Sửa Lỗi 2)
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

  // Fetch danh sách Videos theo User từ Supabase
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

  // Xử lý Auth Đăng nhập / Đăng ký
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail || !authPassword) {
      showToast('Vui lòng nhập Email và Mật khẩu!')
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
        showToast('Đăng ký tài khoản thành công!')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        showToast('Đăng nhập thành công!')
      }
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

  // Lưu Video mới tạo
  const handleSaveNewVideo = async (title: string, script: string, videoUrl?: string, image?: string) => {
    const chosenImage = image || FALLBACK_PRODUCT_IMAGES[Math.floor(Math.random() * FALLBACK_PRODUCT_IMAGES.length)]
    
    const tempVideo: VideoRecord = {
      id: `vid_${Date.now()}`,
      title: title || 'Video Affiliate Mới',
      script: script || '',
      status: 'completed',
      videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('vi-VN'),
      credits: 5,
      price: '0đ',
      image: chosenImage,
      voice: voices[0],
    }

    setVideos((prev) => [tempVideo, ...prev])
    showToast('Đã lưu video vào Kho video thành công!')

    try {
      if (user?.id) {
        await supabase.from('videos').insert([
          {
            user_id: user.id,
            title: tempVideo.title,
            script: tempVideo.script,
            status: 'completed',
            video_url: tempVideo.videoUrl,
            image_url: tempVideo.image,
          },
        ])
      }
    } catch (err) {
      console.error('Save to Supabase error:', err)
    }
  }

  const handleDeleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id))
    showToast('Đã xóa video.')
  }

  // Giao diện Đăng nhập / Đăng ký
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
              {isSignUp ? 'Tạo tài khoản mới để bắt đầu' : 'Đăng nhập vào không gian sáng tạo'}
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
              style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: authLoading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
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

        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', zIndex: 9999 }}>
            {toastMessage}
          </div>
        )}
      </div>
    )
  }

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

      {/* CONTENT */}
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

      {/* PRICING MODAL WITH VIETQR */}
      {showPricingModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '520px', width: '100%', position: 'relative' }}>
            <button onClick={() => { setShowPricingModal(false); setSelectedPackage(null) }} style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>

            {!selectedPackage ? (
              <>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>Nạp Credits</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div onClick={() => setSelectedPackage({ name: 'Gói Cơ Bản', credits: 100, price: 99000, priceText: '99.000đ' })} style={{ padding: '16px', border: '2px solid #10b981', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gói Cơ Bản (100 Credits)</span>
                    <strong>99.000đ</strong>
                  </div>
                  <div onClick={() => setSelectedPackage({ name: 'Gói Pro', credits: 500, price: 399000, priceText: '399.000đ' })} style={{ padding: '16px', border: '2px solid #3b82f6', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gói Chuyên Nghiệp (500 Credits) 🔥</span>
                    <strong>399.000đ</strong>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3>Quét VietQR Thanh Toán</h3>
                <img
                  src={`https://img.vietqr.io/image/MB-0333333333-compact2.png?amount=${selectedPackage.price}&addInfo=${encodeURIComponent(`NAP ${selectedPackage.credits} CREDITS`)}`}
                  alt="VietQR"
                  style={{ width: '220px', height: '220px', margin: '12px 0' }}
                />
                <button
                  onClick={() => {
                    updateCredits(credits + selectedPackage.credits)
                    setShowPricingModal(false)
                    setSelectedPackage(null)
                    showToast(`Nạp thành công ${selectedPackage.credits} Credits!`)
                  }}
                  style={{ width: '100%', padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Xác nhận đã chuyển khoản
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