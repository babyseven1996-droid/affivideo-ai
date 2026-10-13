import React, { useState } from 'react'
import { VideoRecord } from '../App'
import { supabase } from '../lib/supabase'

interface LibraryProps {
  videos: VideoRecord[]
  onDelete: (id: string) => void
  onToast: (msg: string) => void
}

export default function Library({ videos, onDelete, onToast }: LibraryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
  const [isPosting, setIsPosting] = useState<string | null>(null)

  // Xử lý Đăng Tự Động Facebook Reels & TikTok
  const handleAutoPublish = async (video: VideoRecord, platform: 'tiktok' | 'facebook') => {
    setIsPosting(video.id)
    onToast(`🔍 Đang kiểm tra liên kết tài khoản ${platform.toUpperCase()}...`)

    try {
      // 1. Lấy thông tin user hiện tại trực tiếp từ Supabase Auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        onToast('⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!')
        setIsPosting(null)
        return
      }

      // 2. Kiểm tra xem user đã kết nối tài khoản mạng xã hội này chưa
      const { data: socialAcc, error: dbError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single()

      if (dbError || !socialAcc) {
        onToast(`⚠️ Bạn chưa kết nối tài khoản ${platform.toUpperCase()}! Hãy vào mục "Cài đặt" để liên kết.`)
        setIsPosting(null)
        return
      }

      // 3. XỬ LÝ ĐĂNG BÀI REELS CHO FACEBOOK FANPAGE (CHUẨN CHỈNH)
      if (platform === 'facebook') {
        const userAccessToken = socialAcc.access_token

        onToast('🔍 Đang lấy danh sách Fanpage Facebook...')
        
        // Lấy danh sách Fanpage
        const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`)
        const pagesData = await pagesRes.json()

        if (pagesData.error) {
          onToast(`❌ Lỗi token Facebook: ${pagesData.error.message}`)
          setIsPosting(null)
          return
        }

        if (!pagesData.data || pagesData.data.length === 0) {
          onToast('⚠️ Tài khoản Facebook của bạn chưa quản lý Fanpage nào!')
          setIsPosting(null)
          return
        }

        const targetPage = pagesData.data[0]
        const pageId = targetPage.id
        const pageAccessToken = targetPage.access_token

        onToast(`🚀 Đang khởi tạo phiên đăng Reels trên Fanpage "${targetPage.name}"...`)

        // BƯỚC 1: Khởi tạo phiên Reels chuẩn Meta API (Bắt buộc dùng upload_phase: 'start' đơn thuần)
        const initRes = await fetch(`https://graph.facebook.com/v18.0/${pageId}/video_reels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            upload_phase: 'start',
            access_token: pageAccessToken,
          }),
        })
        const initData = await initRes.json()

        if (initData.error || !initData.video_id) {
          console.error('Lỗi khởi tạo Reels:', initData)
          onToast(`❌ Lỗi từ Facebook: ${initData.error?.message || 'Không thể tạo phiên Reels'}`)
          setIsPosting(null)
          return
        }

        const videoId = initData.video_id
        onToast(`📤 Đang tải video lên Facebook (Video ID: ${videoId})...`)

        // BƯỚC 2: Hoàn tất và xuất bản Reels công khai kèm file_url chuẩn định dạng POST
        const publishRes = await fetch(`https://graph.facebook.com/v18.0/${pageId}/video_reels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            upload_phase: 'finish',
            access_token: pageAccessToken,
            video_id: videoId,
            video_state: 'PUBLISHED',
            description: video.title || 'Video Reels tự động #viral #reels',
            file_url: video.videoUrl,
          }),
        })
        const publishData = await publishRes.json()

        console.log('Facebook Publish Response:', publishData)

        if (publishData.success || publishData.id) {
          onToast(`🎉 ĐÃ ĐĂNG REELS THÀNH CÔNG LÊN FANPAGE "${targetPage.name}"!`)
        } else {
          const errMsg = publishData.error?.message || 'Lỗi không xác định từ Facebook'
          onToast(`❌ Không thể xuất bản: ${errMsg}`)
        }

      } else if (platform === 'tiktok') {
        onToast('⏳ TikTok App đang chờ xét duyệt từ TikTok Developer Center!')
      }

    } catch (err: any) {
      onToast(`❌ Lỗi kết nối: ${err.message || 'Không thể thực hiện đăng bài'}`)
    } finally {
      setIsPosting(null)
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
        📁 Kho Video Đã Tạo
      </h1>

      {videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Chưa có video nào trong kho. Hãy sang trang "Tạo video" để bắt đầu sáng tạo!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {videos.map((video) => (
            <div key={video.id} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Thẻ Video */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '133%', backgroundColor: '#000' }}>
                <video
                  src={video.videoUrl}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  controls
                />
              </div>

              {/* Thông tin Video */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {video.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
                    📅 {video.createdAt}
                  </p>
                </div>

                {/* Nút thao tác Đăng bài & Tải về */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Nút Đăng Tự Động */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                      onClick={() => handleAutoPublish(video, 'tiktok')}
                      disabled={isPosting === video.id}
                      style={{ padding: '8px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', opacity: isPosting === video.id ? 0.6 : 1 }}
                    >
                      {isPosting === video.id ? '⏳ ...' : '🎵 Đăng TikTok'}
                    </button>

                    <button
                      onClick={() => handleAutoPublish(video, 'facebook')}
                      disabled={isPosting === video.id}
                      style={{ padding: '8px', backgroundColor: '#1877f2', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', opacity: isPosting === video.id ? 0.6 : 1 }}
                    >
                      {isPosting === video.id ? '⏳ ...' : '📘 Đăng Reels'}
                    </button>
                  </div>

                  {/* Nút Tải về & Xóa */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={video.videoUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#f1f5f9', color: '#334155', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      📥 Tải File MP4
                    </a>
                    <button
                      onClick={() => onDelete(video.id)}
                      style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}