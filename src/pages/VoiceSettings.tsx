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

// ⚙️ CẤU HÌNH KHÓA API TẬP TRUNG CỦA NỀN TẢNG
const PLATFORM_CONFIG = {
  FACEBOOK_APP_ID: '1456158176610583',
  TIKTOK_CLIENT_KEY: 'awnvpl6f41iwlhc2',
  TIKTOK_IS_IN_REVIEW: true,
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

  // 1. Kiểm tra trạng thái liên kết tài khoản từ Supabase
  useEffect(() => {
    async function checkSocialConnections() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.id) return

      const { data, error } = await supabase
        .from('social_accounts')
        .select('platform')
        .eq('user_id', currentUser.id)

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

  // 2. Xử lý nhận Token từ Facebook OAuth khi chuyển hướng quay lại (Đảm bảo lấy đúng user từ Supabase Auth)
  useEffect(() => {
    async function handleOAuthCallback() {
      const REDIRECT_CLEAN_URL = window.location.origin + window.location.pathname

      // --- XỬ LÝ FACEBOOK CALLBACK ---
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))
      const fbAccessToken = hashParams.get('access_token')

      if (fbAccessToken) {
        onToast('🔄 Đang xác thực và lưu kết nối Fanpage Facebook...')
        
        // Lấy trực tiếp user từ Supabase Auth để tránh lỗi mất phiên sau khi redirect
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser?.id) {
          onToast('⚠️ Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!')
          return
        }

        try {
          const { error } = await supabase.from('social_accounts').upsert(
            [
              {
                user_id: authUser.id,
                platform: 'facebook',
                access_token: fbAccessToken,
                platform_user_name: 'Facebook Fanpage Connected',
              },
            ],
            { onConflict: 'user_id, platform' }
          )

          if (error) throw error

          setConnectedPlatforms((prev) => ({ ...prev, facebook: true }))
          onToast('🎉 Kết nối Fanpage Facebook thành công!')
          window.history.replaceState({}, document.title, REDIRECT_CLEAN_URL)
        } catch (err) {
          onToast('❌ Lỗi khi lưu thông tin kết nối vào cơ sở dữ liệu!')
        }
        return
      }

      // --- XỬ LÝ TIKTOK CALLBACK ---
      const urlParams = new URLSearchParams(window.location.search)
      const tiktokCode = urlParams.get('code')

      if (tiktokCode) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser?.id) {
          onToast('⚠️ Vui lòng đăng nhập lại!')
          return
        }

        onToast('🔄 Đang xác thực tài khoản TikTok...')
        try {
          const { error } = await supabase.from('social_accounts').upsert(
            [
              {
                user_id: authUser.id,
                platform: 'tiktok',
                access_token: `tiktok_token_${tiktokCode}`,
                platform_user_name: 'TikTok Creator Connected',
              },
            ],
            { onConflict: 'user_id, platform' }
          )

          if (error) throw error

          setConnectedPlatforms((prev) => ({ ...prev, tiktok: true }))
          onToast('🎉 Kết nối tài khoản TikTok thành công!')
          window.history.replaceState({}, document.title, REDIRECT_CLEAN_URL)
        } catch (err) {
          onToast('❌ Lỗi khi kết nối TikTok!')
        }
      }
    }

    handleOAuthCallback()
  }, [])

  // 3. Hàm chuyển hướng sang trang cấp quyền
  const handleConnectPlatform = async (platform: 'tiktok' | 'facebook') => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser?.id) {
      onToast('Vui lòng đăng nhập lại!')
      return
    }

    const REDIRECT_URI = window.location.origin + window.location.pathname

    if (platform === 'facebook') {
      setLoadingPlatform('facebook')
      if (!PLATFORM_CONFIG.FACEBOOK_APP_ID) {
        onToast('⚠️ Chưa cấu hình Facebook App ID!')
        setLoadingPlatform(null)
        return
      }

      const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${PLATFORM_CONFIG.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=token&scope=pages_manage_posts,pages_show_list,pages_read_engagement`

      window.location.href = fbAuthUrl

    } else if (platform === 'tiktok') {
      if (PLATFORM_CONFIG.TIKTOK_IS_IN_REVIEW) {
        onToast('⏳ TikTok App đang được duyệt, vui lòng thử lại sau!')
        return
      }

      setLoadingPlatform('tiktok')
      const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${PLATFORM_CONFIG.TIKTOK_CLIENT_KEY}&scope=user.info.basic,video.upload&response_type=code&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}`

      window.location.href = tiktokAuthUrl
    }
  }

  // 4. Ngắt kết nối
  const handleDisconnectPlatform = async (platform: 'tiktok' | 'facebook') => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser?.id) return

    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', authUser.id)
        .eq('platform', platform)

      if (error) throw error

      setConnectedPlatforms((prev) => ({ ...prev, [platform]: false }))
      onToast(`Đã ngắt kết nối tài khoản ${platform === 'tiktok' ? 'TikTok' : 'Facebook'}.`)
    } catch (err) {
      onToast('Có lỗi xảy ra khi ngắt kết nối.')
    }
  }

  const handleAddCustomVoice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVoiceName.trim()) return
    if (voices.includes(newVoiceName.trim())) {
      onToast('Giọng đọc này đã tồn tại!')
      return
    }
    onAddVoice(newVoiceName.trim())
    setNewVoiceName('')
    onToast('Đã thêm giọng đọc AI thành công!')
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTION 1: KẾT NỐI MẠNG XÃ HỘI */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🔗 Liên Kết Tài Khoản Đăng Bài Tự Động
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          Ủy quyền kênh mạng xã hội để hệ thống tự động xuất bản video trực tiếp từ kho video của bạn.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* TikTok Creator Card */}
          <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🎵</span>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>TikTok Creator</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                {connectedPlatforms.tiktok
                  ? '✅ Đã kết nối kênh TikTok'
                  : PLATFORM_CONFIG.TIKTOK_IS_IN_REVIEW
                  ? '⏳ Đang chờ TikTok duyệt App...'
                  : 'Chưa kết nối tài khoản'}
              </p>
            </div>

            {connectedPlatforms.tiktok ? (
              <button
                onClick={() => handleDisconnectPlatform('tiktok')}
                style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                Ngắt kết nối
              </button>
            ) : (
              <button
                onClick={() => handleConnectPlatform('tiktok')}
                disabled={loadingPlatform === 'tiktok' || PLATFORM_CONFIG.TIKTOK_IS_IN_REVIEW}
                style={{
                  padding: '10px',
                  backgroundColor: PLATFORM_CONFIG.TIKTOK_IS_IN_REVIEW ? '#cbd5e1' : '#000000',
                  color: PLATFORM_CONFIG.TIKTOK_IS_IN_REVIEW ? '#475569' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: PLATFORM_CONFIG.TIKTOK_IS_IN_REVIEW ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingPlatform === 'tiktok'
                  ? 'Đang chuyển hướng...'
                  : PLATFORM_CONFIG.TIKTOK_IS_IN_REVIEW
                  ? 'Chờ duyệt App'
                  : 'Kết nối TikTok'}
              </button>
            )}
          </div>

          {/* Facebook Reels Card */}
          <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>📘</span>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Facebook Reels</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                {connectedPlatforms.facebook ? '✅ Đã kết nối Fanpage Facebook' : 'Chưa kết nối Fanpage'}
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
                {loadingPlatform === 'facebook' ? 'Đang chuyển hướng...' : 'Kết nối Facebook'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* SECTION 2: QUẢN LÝ GIỌNG ĐỌC AI */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🎙️ Quản Lý Giọng Đọc Lồng Tiếng AI
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          Cấu hình thêm danh sách các giọng đọc AI sử dụng khi tạo video tự động.
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