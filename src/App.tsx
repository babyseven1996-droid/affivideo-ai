import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
// Kiểm tra chính xác đường dẫn các component & pages:
import CreateVideo from './components/CreateVideo' // Hoặc './components/CreateVideo' tùy vào vị trí file CreateVideo.tsx
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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tab, setTab] = useState<AppTab>('create')
  const [videos, setVideos] = useState<VideoRecord[]>(DEFAULT_MOCK_VIDEOS)
  const [voices, setVoices] = useState<string[]>(['Nam miền Bắc trầm ấm', 'Nữ miền Nam ngọt ngào'])
  const [referral, setReferral] = useState({ code: 'AFFI123', successfulReferrals: 0 })
  const [toastMessage, setToastMessage] = useState<string>('')

  // Khởi tạo Credits an toàn
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

  // Lưu Credits xuống LocalStorage
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
        <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            Đang hoạt động
          </div>

          <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ⚡ {credits} Credits
          </div>

          <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>
            🌙
          </button>

          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
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
              onOpenPricing={() => {}}
              onAddVoice={handleAddVoice}
              onRemoveVoice={handleRemoveVoice}
              onToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notification (Khung thông báo nổi) */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

    </div>
  )
}