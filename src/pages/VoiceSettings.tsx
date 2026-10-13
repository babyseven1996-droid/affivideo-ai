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

  // Kiểm tra trạng thái kết nối mạng xã hội từ Supabase bằng user.id
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

  // Xử lý Liên kết tài khoản OAuth (TikTok / Facebook)
  const handleConnectPlatform = async (platform: 'tiktok' | 'facebook') => {
    setLoadingPlatform(platform)
    
    if (!user?.id) {
      onToast('Vui lòng đăng nhập lại!')
      setLoadingPlatform(null)
      return
    }

    try {
      await new Promise((r) => setTimeout(r, 1200))

      const mockToken = `access_token_${platform}_${Date.now()}`
      const mockAccountName = platform === 'tiktok' ? '@creator_tiktok_vn' : 'Page Facebook Reels Pro'

      // Lưu token vào bảng social_accounts trên Supabase
      const { error } = await supabase.from('social_accounts').upsert(
        [
          {
            user_id: user.id,
            platform: platform,
            access_token: mockToken,
            platform_user_name: mockAccountName,
          },
        ],
        { onConflict: 'user_id, platform' }
      )

      if (error) throw error

      setConnectedPlatforms((prev) => ({ ...prev, [platform]: true }))
      onToast(`🎉 Liên kết thành công tài khoản ${platform === 'tiktok' ? 'TikTok' : 'Facebook'}!`)
    } catch (err: any) {
      console.error(err)
      onToast(err.message || 'Lỗi liên kết tài khoản!')
    } finally {
      setLoadingPlatform(null)
    }
  }

  // Ngắt kết nối mạng xã hội
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
    onToast('Đã thêm giọng đọc AI mới thành công!')
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* PHẦN 1: LIÊN KẾT TÀI KHOẢN MẠNG XÃ HỘI */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🔗 Liên Kết Tài Khoản Đăng Bài Tự Động
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          Kết nối tài khoản mạng xã hội để hệ thống tự động xuất bản video trực tiếp bằng Access Token của bạn.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* TikTok Card */}
          <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🎵</span>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>TikTok Creator</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                {connectedPlatforms.tiktok ? '✅ Đã kết nối tài khoản TikTok' : 'Chưa kết nối tài khoản'}
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
                disabled={loadingPlatform === 'tiktok'}
                style={{ padding: '10px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {loadingPlatform === 'tiktok' ? 'Đang kết nối...' : 'Kết nối TikTok'}
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
                {connectedPlatforms.facebook ? '✅ Đã kết nối Fanpage / Reels' : 'Chưa kết nối tài khoản'}
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

      {/* PHẦN 2: QUẢN LÝ GIỌNG ĐỌC AI */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🎙️ Quản Lý Giọng Đọc Lồng Tiếng AI
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          Thêm các cấu hình giọng đọc mới cho hệ thống Reup & Tạo video.
        </p>

        <form onSubmit={handleAddCustomVoice} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Nhập tên giọng đọc mới (VD: Nam miền Trung truyền cảm)..."
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