import React, { useState } from 'react'
import { VideoRecord } from '../App'

interface LibraryProps {
  videos: VideoRecord[]
  onDelete: (id: string) => void
  onToast: (msg: string) => void
}

export default function Library({ videos, onDelete, onToast }: LibraryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
  const [isPosting, setIsPosting] = useState<string | null>(null) // Lưu ID video đang được xử lý đăng

  // Xử lý Đăng Video Tự Động lên Mạng Xã Hội (Auto-Publish)
  const handleAutoPublish = async (video: VideoRecord, platform: 'tiktok' | 'facebook' | 'youtube') => {
    setIsPosting(video.id)
    onToast(`🚀 Đang kết nối API để đăng tự động lên ${platform.toUpperCase()}...`)

    try {
      // Giả lập / Gọi Webhook API đăng video (N8N / Make / Direct API)
      await new Promise((r) => setTimeout(r, 2000))

      // Bạn có thể thay URL webhook bên dưới bằng Webhook n8n/Make của bạn
      /*
      await fetch('YOUR_N8N_OR_MAKE_WEBHOOK_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          videoUrl: video.videoUrl,
          caption: video.title,
        }),
      })
      */

      onToast(`🎉 Đã đăng video thành công lên ${platform === 'tiktok' ? 'TikTok' : platform === 'facebook' ? 'Facebook Reels' : 'YouTube Shorts'}!`)
    } catch (err) {
      onToast('Có lỗi xảy ra khi gọi API đăng video!')
    } finally {
      setIsPosting(null)
    }
  }

  if (videos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>Kho video đang trống</h3>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Hãy sang tab "Tạo video" để bóc tách & reup video đầu tiên nhé!</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Image Cover */}
            <div style={{ position: 'relative', height: '160px', backgroundColor: '#0f172a' }}>
              <img
                src={video.image}
                alt={video.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => setSelectedVideo(video)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  margin: 'auto',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 150, 105, 0.9)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                ▶
              </button>
            </div>

            {/* Content Info */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {video.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>📅 {video.date}</p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Nút Đăng Tự Động */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => handleAutoPublish(video, 'tiktok')}
                    disabled={isPosting === video.id}
                    style={{ padding: '8px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isPosting === video.id ? '⏳...' : '🎵 Đăng TikTok'}
                  </button>

                  <button
                    onClick={() => handleAutoPublish(video, 'facebook')}
                    disabled={isPosting === video.id}
                    style={{ padding: '8px', backgroundColor: '#1877f2', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isPosting === video.id ? '⏳...' : '📘 Đăng Reels'}
                  </button>
                </div>

                {/* Nút Tải về & Xóa */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <a
                    href={video.videoUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    📥 Tải File MP4
                  </a>

                  <button
                    onClick={() => onDelete(video.id)}
                    style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PREVIEW XEM VIDEO */}
      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', maxWidth: '480px', width: '100%', position: 'relative' }}>
            <button
              onClick={() => setSelectedVideo(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', paddingRight: '30px' }}>
              {selectedVideo.title}
            </h3>

            <video
              src={selectedVideo.videoUrl}
              controls
              autoPlay
              style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', backgroundColor: '#000' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}