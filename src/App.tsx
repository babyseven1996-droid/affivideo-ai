import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
// Sửa lại các đường dẫn Import cho đúng vị trí file thực tế:
import CreateVideo from './components/CreateVideo'
import Library from './pages/Library'
import Referral from './pages/Referral'
import Analytics from './pages/Analytics'
import VoiceSettings from './VoiceSettings' // <-- Sửa từ './pages/VoiceSettings' thành './VoiceSettings'

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
    <div className="app-container">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            AFFIVIDEOS AI <span className="eyebrow-dot"></span>
          </p>
          <h1>{TAB_TITLES[tab]}</h1>
        </div>
        <span className="heading-date">Không gian sáng tạo của bạn</span>
      </div>

      <main className="main-content">
        {/* Tab 1: Tạo video */}
        {tab === 'create' && (
          <CreateVideo
            credits={credits}
            voices={voices || []}
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

        {/* Tab 2: Kho video */}
        {tab === 'library' && (
          <Library
            videos={videos && videos.length > 0 ? videos : DEFAULT_MOCK_VIDEOS}
            onDelete={handleDeleteVideo}
            onToast={showToast}
          />
        )}

        {/* Tab 3: Giới thiệu */}
        {tab === 'referral' && (
          <Referral
            referral={referral || { code: 'AFFI123', successfulReferrals: 0 }}
            user={user || { name: 'Creator', email: 'user@affivideo.ai' }}
            onToast={showToast}
          />
        )}

        {/* Tab 4: Thống kê */}
        {tab === 'analytics' && (
          <Analytics />
        )}

        {/* Tab 5: Cài đặt */}
        {tab === 'settings' && (
          <VoiceSettings
            credits={credits}
            transactions={[]}
            voices={voices || []}
            onOpenPricing={() => {}}
            onAddVoice={handleAddVoice}
            onRemoveVoice={handleRemoveVoice}
            onToast={showToast}
          />
        )}
      </main>
    </div>
  )
}