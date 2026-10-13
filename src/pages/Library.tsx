import React, { useState } from 'react'
import { VideoRecord } from '../App'

interface LibraryProps {
  videos?: VideoRecord[]
  onDelete?: (id: string) => void
  onToast?: (msg: string) => void
}

export default function Library({ videos = [], onDelete, onToast }: LibraryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {videos.length === 0 ? (
        <div style={{ background: '#fff', padding: '60px 20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '16px', color: '#64748b' }}>Chưa có video nào trong Kho của bạn.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {videos.map((video) => (
            <div key={video.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Ảnh bìa + Nút Xem thử video */}
              <div 
                onClick={() => setSelectedVideo(video)}
                style={{ position: 'relative', height: '180px', background: '#000', cursor: 'pointer' }}
              >
                <img src={video.image} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(5, 150, 105, 0.9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    ▶
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>{video.title}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.script}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{video.date}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a href={video.videoUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', padding: '6px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                      Tải về
                    </a>
                    {onDelete && (
                      <button onClick={() => onDelete(video.id)} style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Phát Video */}
      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', maxWidth: '600px', width: '100%', position: 'relative' }}>
            <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>{selectedVideo.title}</h3>
            <video controls autoPlay style={{ width: '100%', borderRadius: '12px', maxHeight: '400px' }}>
              <source src={selectedVideo.videoUrl} type="video/mp4" />
              Trình duyệt không hỗ trợ phát video.
            </video>
          </div>
        </div>
      )}
    </div>
  )
}