import React from 'react'
import { VideoRecord } from '../App'

interface AnalyticsProps {
  videos?: VideoRecord[]
}

export default function Analytics({ videos = [] }: AnalyticsProps) {
  const totalVideos = videos.length
  const estimatedViews = (totalVideos * 3200).toLocaleString('vi-VN')
  const totalCreditsUsed = totalVideos * 5

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Dynamic Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Tổng Video Đã Tạo</span>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: '8px 0 0 0' }}>{totalVideos}</h2>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Lượt Xem Ước Tính</span>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', margin: '8px 0 0 0' }}>{estimatedViews}</h2>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Credits Đã Tiêu Dùng</span>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6', margin: '8px 0 0 0' }}>{totalCreditsUsed}</h2>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Tỷ lệ phân phối trên các nền tảng</h3>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Hệ thống tự động đồng bộ video lên <strong>TikTok, Facebook Reels, YouTube Shorts</strong> khi khởi tạo thành công.
        </p>
      </div>

    </div>
  )
}