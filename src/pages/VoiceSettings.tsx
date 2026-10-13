import React, { useState } from 'react'

interface VoiceSettingsProps {
  credits?: number
  transactions?: any[]
  voices?: string[]
  onOpenPricing?: () => void
  onAddVoice?: (voice: string) => void
  onRemoveVoice?: (voice: string) => void
  onToast?: (msg: string) => void
}

export default function VoiceSettings({
  credits = 200,
  voices = [],
  onOpenPricing,
  onAddVoice,
  onRemoveVoice,
  onToast
}: VoiceSettingsProps) {
  const safeVoices = Array.isArray(voices) ? voices : []
  const [activeTab, setActiveTab] = useState<'profile' | 'voices' | 'history'>('voices')
  const [voiceName, setVoiceName] = useState('')

  // Giả lập thông tin API
  const [apiUrl, setApiUrl] = useState('https://api.affivideo.ai/v1')
  const [apiKey, setApiKey] = useState('affi_live_9928a8d11c094f2')

  function handleAdd() {
    const cleanName = voiceName.trim()
    if (!cleanName) return
    if (safeVoices.includes(cleanName)) {
      if (onToast) onToast('Giọng đọc này đã tồn tại trong danh sách!')
      return
    }
    if (onAddVoice) onAddVoice(cleanName)
    setVoiceName('')
    if (onToast) onToast(`Đã thêm giọng đọc "${cleanName}" thành công!`)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Thanh Menu Chuyển Tab Cài Đặt */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'voices', label: '🎙️ Giọng đọc & API', desc: 'Cấu hình AI Voice & API Key' },
          { id: 'profile', label: '👤 Thông tin tài khoản', desc: 'Quản lý thông tin & Gói' },
          { id: 'history', label: '📜 Lịch sử Credits', desc: 'Biến động số dư' },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? '#059669' : '#f8fafc',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 'bold' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ================= TAB 1: CẤU HÌNH GIỌNG ĐỌC & API ================= */}
      {activeTab === 'voices' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Khung Quản lý Giọng đọc */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              🎙️ Quản lý Giọng đọc AI
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Thêm các mẫu giọng lồng tiếng để chọn khi khởi tạo video tự động.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Nhập tên giọng mới (VD: Nữ miền Trung)..."
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <button
                onClick={handleAdd}
                style={{ padding: '10px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Thêm giọng
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {safeVoices.map((v, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>🔊 {v}</span>
                  {onRemoveVoice && (
                    <button
                      onClick={() => onRemoveVoice(v)}
                      style={{ color: '#dc2626', border: 'none', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Khung Cấu hình API Integration */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              🔑 Kết nối API Engine
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Cấu hình Endpoint và Secret Key để kết nối mô hình xử lý video AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>API Endpoint URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>API Secret Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                onClick={() => {
                  if (onToast) onToast('Đã lưu cấu hình API thành công!')
                }}
                style={{ padding: '12px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
              >
                Lưu cấu hình API
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: THÔNG TIN TÀI KHOẢN ================= */}
      {activeTab === 'profile' && (
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Gói tài khoản & Credits</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Thông tin số dư hiện tại của bạn trên hệ thống AffiVideo AI.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', margin: '0 0 4px 0' }}>GÓI HIỆN TẠI</p>
              <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', margin: 0 }}>Gói Chuyên Nghiệp (Pro Plan)</h4>
              <p style={{ fontSize: '13px', color: '#15803d', margin: '4px 0 0 0' }}>Số dư: <strong>{credits} Credits</strong></p>
            </div>
            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                style={{ padding: '12px 20px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
              >
                ⚡ Nạp thêm Credits
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: LỊCH SỬ CREDITS ================= */}
      {activeTab === 'history' && (
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>📜 Lịch sử biến động Credits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { type: 'minus', title: 'Tạo Video Affiliate (Máy xay sinh tố)', change: '-5 Credits', date: 'Hôm nay, 14:30' },
              { type: 'plus', title: 'Nạp thành công Gói Pro', change: '+200 Credits', date: 'Hôm qua, 09:15' },
              { type: 'plus', title: 'Thưởng giới thiệu bạn bè', change: '+20 Credits', date: '10/10/2026' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{item.title}</p>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.date}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.type === 'plus' ? '#10b981' : '#ef4444' }}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}