import React, { useState, useEffect } from 'react'
import { VideoRecord } from '../App'

interface LibraryProps {
  videos?: VideoRecord[]
  onDelete?: (id: string) => void
  onToast?: (msg: string) => void
}

export default function Library({ videos = [], onDelete, onToast }: LibraryProps) {
  const safeVideos = Array.isArray(videos) ? videos : []
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<VideoRecord | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackTime, setPlaybackTime] = useState(0)

  useEffect(() => {
    if (!selectedVideo || !isPlaying) return
    const interval = window.setInterval(() => {
      setPlaybackTime((time) => Math.min(30, time + 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [selectedVideo, isPlaying])

  useEffect(() => {
    if (playbackTime >= 30) setIsPlaying(false)
  }, [playbackTime])

  return (
    <div className="library-page" style={{ padding: '20px' }}>
      <h2>Kho Video Của Bạn ({safeVideos.length})</h2>
      {safeVideos.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>Chưa có video nào trong kho. Hãy tạo video đầu tiên của bạn!</p>
        </div>
      ) : (
        <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {safeVideos.map((video) => (
            <div key={video.id} className="video-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
              <img src={video.image} alt={video.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{video.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', height: '36px', overflow: 'hidden' }}>{video.script}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{video.date}</span>
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(video.id)}
                      style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}