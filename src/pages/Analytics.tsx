import React from 'react'

export default function Analytics() {
  const stats = [
    { title: 'Tổng Video Đã Tạo', value: '24', change: '+12% tuần này', color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Lượt Xem Ước Tính', value: '145.2K', change: '+28% tháng này', color: '#10b981', bg: '#f0fdf4' },
    { title: 'Hoa Hồng Affiliate', value: '2.450.000đ', change: '+45% tăng trưởng', color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Credits Đã Dùng', value: '120', change: 'Còn lại tối ưu', color: '#8b5cf6', bg: '#f5f3ff' },
  ]

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {stats.map((item, idx) => (
          <div key={idx} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>{item.title}</span>
              <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: item.bg, color: item.color, fontSize: '12px', fontWeight: 'bold' }}>
                {item.change}
              </span>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Chart & Performance Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Main Chart Card */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>Hiệu suất Video & Tương tác</h3>
          <div style={{ height: '260px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((day, i) => {
              const heights = ['40%', '65%', '50%', '85%', '95%', '70%', '60%']
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{ width: '32px', height: heights[i], background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', borderRadius: '8px 8px 0 0', transition: 'height 0.3s' }}></div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{day}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '16px', textAlign: 'center' }}>Biểu đồ thể hiện lượt phân phối video tự động lên TikTok, Reels & Shorts.</p>
        </div>

        {/* Top Product Performance */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>Sản phẩm Hot nhất</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f" alt="prod" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Máy xay sinh tố cầm tay</p>
                  <span style={{ fontSize: '12px', color: '#10b981' }}>52.4K views • 45 đơn</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9" alt="prod" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Tai nghe Bluetooth TWS</p>
                  <span style={{ fontSize: '12px', color: '#10b981' }}>38.1K views • 29 đơn</span>
                </div>
              </div>
            </div>
          </div>
          <button style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', color: '#0f172a', cursor: 'pointer', marginTop: '16px' }}>
            Xem báo cáo chi tiết
          </button>
        </div>

      </div>
    </div>
  )
}