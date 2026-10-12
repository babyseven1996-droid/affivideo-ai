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
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 1. Thanh Menu bên trái */}
      <Sidebar activeTab={tab} onTabChange={setTab} credits={credits} />

      {/* 2. Nội dung chính bên phải */}
      <div style={{ flex: 1, padding: '24px', backgroundColor: '#f8fafc' }}>
        <Header user={user} credits={credits} />

        <div className="page-heading" style={{ marginBottom: '24px' }}>
          <p className="eyebrow" style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>
            AFFIVIDEOS AI •
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>{TAB_TITLES[tab]}</h1>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Không gian sáng tạo của bạn</span>
        </div>

        <main className="main-content">
          {tab === 'create' && (
            <CreateVideo
              credits={credits}
              voices={voices}
              onVideoCreated={handleSaveNewVideo}
              onSpendCredits={handleSpendCredits}
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

          {tab === 'analytics' && <Analytics />}

          {tab === 'settings' && (
            <VoiceSettings
              credits={credits}
              voices={voices}
              onAddVoice={handleAddVoice}
              onRemoveVoice={handleRemoveVoice}
              onToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  )
}