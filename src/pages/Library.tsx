import React, { useState } from 'react'
import { VideoRecord } from '../App'

interface LibraryProps {
  videos?: VideoRecord[]
  onDelete?: (id: string) => void
  onToast?: (msg: string) => void
}

export default function Library({ videos = [], onDelete, onToast }: LibraryProps) {
  const safeVideos = Array.isArray(videos) ? videos : []
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVideos = safeVideos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Search & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm video theo tiêu đề..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '280px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff' }}
        />
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
          Tổng số: <span style={{ color: '#059669' }}>{safeVideos.length}</span> video
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div style={{ background: '#ffffff', padding: '60px 20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '16px' }}>Không tìm thấy video nào trong kho.</p>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Hãy chuyển sang tab "Tạo video" để sáng tạo video Affiliate đầu tiên ngay!</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredVideos.map((video) => (
            <div key={video.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ position: 'relative', height: '180px', background: '#000' }}>
                <img src={video.image} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(16, 185, 129, 0.9)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                  Đã hoàn thành
                </span>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', lineHeight: '1.4' }}>{video.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.script}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>📅 {video.date}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        if (onToast) onToast('Đang tải xuống video...')
                      }}
                      style={{ padding: '6px 12px', background: '#ecfdf5', color: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Tải về
                    </button>
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(video.id)}
                        style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
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
    </div>
  )
}