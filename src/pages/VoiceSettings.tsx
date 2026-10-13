import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../App'

interface VoiceSettingsProps {
  user: UserProfile
  credits: number
  voices: string[]
  onOpenPricing: () => void
  onAddVoice: (voice: string) => void
  onRemoveVoice: (voice: string) => void
  onToast: (msg: string) => void
}

export default function VoiceSettings({
  user,
  credits,
  voices,
  onOpenPricing,
  onAddVoice,
  onRemoveVoice,
  onToast,
}: VoiceSettingsProps) {
  const [newVoiceName, setNewVoiceName] = useState('')
  const [connectedPlatforms, setConnectedPlatforms] = useState<{ tiktok: boolean; facebook: boolean }>({
    tiktok: false,
    facebook: false,
  })
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null)

  // Kiểm tra trạng thái kết nối từ Supabase khi load trang
  useEffect(() => {
    async function checkSocialConnections() {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('social_accounts')
        .select('platform')
        .eq('user_id', user.id)

      if (!error && data) {
        const connected = { tiktok: false, facebook: false }
        data.forEach((item: any) => {
          if (item.platform === 'tiktok') connected.tiktok = true
          if (item.platform === 'facebook') connected.facebook = true
        })
        setConnectedPlatforms(connected)
      }
    }
    checkSocialConnections()
  }, [user])

  // Xử lý nhận Access Token từ Facebook OAuth khi chuyển hướng quay lại
  useEffect(() => {
    async function handleFacebookCallback() {
      // Facebook SDK / Dialog trả về token trên hash URL (#access_token=...) hoặc code
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))
      const accessToken = hashParams.get('access_token')

      if (accessToken && user?.id) {
        onToast('🔄 Đang xác thực và lưu kết nối Facebook Fanpage...')
        try {
          // Lưu token thật của Facebook vào Supabase
          const { error } = await supabase.from('social_accounts').upsert(
            [
              {
                user_id: user.id,
                platform: 'facebook',
                access_token: accessToken,
                platform_user_name: 'Facebook Page Connected',
              },
            ],
            { onConflict: 'user_id, platform' }
          )

          if (error) throw error

          setConnectedPlatforms((prev) => ({ ...prev, facebook: true }))
          onToast('🎉 Liên kết Fanpage Facebook Reels thành công!')

          // Xóa hash trên URL cho sạch
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          onToast('Lỗi lưu Token Facebook!')
        }
      }
    }
    handleFacebookCallback()
  }, [user])

  // Chuyển hướng sang trang đăng nhập/cấp quyền Facebook
  const handleConnectPlatform = async (platform: 'facebook' | 'tiktok') => {
    if (!user?.id) {
      onToast('Vui lòng đăng nhập lại!')
      return
    }

    if (platform === 'facebook') {
      setLoadingPlatform('facebook')
      
      // ⚠️ THAY BẰNG FACEBOOK APP ID CỦA BẠN VÀO ĐÂY:
      const FACEBOOK_APP_ID = '1456158176610583' 

      if (FACEBOOK_APP_ID === '1456158176610583') {
        onToast('⚠️ Bạn chưa dán Facebook App ID vào code!')
        setLoadingPlatform(null)
        return
      }

      const REDIRECT_URI = window.location.origin + window.location.pathname
      
      // Đường dẫn OAuth yêu cầu quyền quản lý trang và đăng bài Reels
      const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=token&scope=pages_manage_posts,pages_show_list,pages_read_engagement`

      window.location.href = fbAuthUrl
    } else {
      onToast('TikTok đang tạm dừng chờ kiểm duyệt!')
    }
  }

  // Ngắt kết nối
  const handleDisconnectPlatform = async (platform: 'tiktok' | 'facebook') => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform)

      if (error) throw error

      setConnectedPlatforms((prev) => ({ ...prev, [platform]: false }))
      onToast(`Đã ngắt kết nối ${platform === 'tiktok' ? 'TikTok' : 'Facebook'}.`)
    } catch (err) {
      onToast('Có lỗi khi ngắt kết nối.')
    }
  }

  const handleAddCustomVoice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVoiceName.trim()) return
    onAddVoice(newVoiceName.trim())
    setNewVoiceName('')
    onToast('Đã thêm giọng đọc mới!')
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* KẾT NỐI MẠNG XÃ HỘI */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🔗 Liên Kết Tài Khoản Đăng Bài Tự Động
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          Kết nối Facebook Fanpage để đăng bài Reels tự động bằng API.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* TikTok Card (Tạm ngưng) */}
          <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🎵</span>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>TikTok Creator</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                ⏳ Đang chờ TikTok duyệt App...
              </p>
            </div>
            <button
              disabled
              style={{ padding: '10px', backgroundColor: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'not-allowed' }}
            >
              Chờ duyệt App
            </button>
          </div>

          {/* Facebook Reels Card */}
          <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>📘</span>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Facebook Reels</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                {connectedPlatforms.facebook ? '✅ Đã kết nối Fanpage Facebook' : 'Chưa kết nối tài khoản'}
              </p>
            </div>

            {connectedPlatforms.facebook ? (
              <button
                onClick={() => handleDisconnectPlatform('facebook')}
                style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                Ngắt kết nối
              </button>
            ) : (
              <button
                onClick={() => handleConnectPlatform('facebook')}
                disabled={loadingPlatform === 'facebook'}
                style={{ padding: '10px', backgroundColor: '#1877f2', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {loadingPlatform === 'facebook' ? 'Đang kết nối...' : 'Kết nối Facebook'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* QUẢN LÝ GIỌNG ĐỌC AI */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🎙️ Quản Lý Giọng Đọc Lồng Tiếng AI
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          Cấu hình các giọng đọc sử dụng khi Reup video.
        </p>

        <form onSubmit={handleAddCustomVoice} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Nhập tên giọng đọc mới..."
            value={newVoiceName}
            onChange={(e) => setNewVoiceName(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
          <button
            type="submit"
            style={{ padding: '12px 24px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            Thêm Giọng
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {voices.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', padding: '8px 14px', borderRadius: '20px', border: '1px solid #bbf7d0', fontSize: '13px', fontWeight: '600', color: '#166534' }}>
              <span>🗣️ {v}</span>
              {voices.length > 1 && (
                <button
                  onClick={() => onRemoveVoice(v)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}