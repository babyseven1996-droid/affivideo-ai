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
  voices = [],
  onAddVoice,
  onRemoveVoice,
  onToast
}: VoiceSettingsProps) {
  const safeVoices = Array.isArray(voices) ? voices : []
  const [voiceName, setVoiceName] = useState('')

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
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Quản lý Giọng đọc AI</h2>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Thêm các tùy chọn giọng đọc lồng tiếng tùy chỉnh để sử dụng khi tạo video tự động.</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Nhập tên giọng đọc mới (Ví dụ: Nam miền Trung truyền cảm)..."
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
        />
        <button
          onClick={handleAdd}
          style={{ padding: '12px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
        >
          Thêm giọng
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Danh sách hiện tại ({safeVoices.length})</h3>
        {safeVoices.map((v, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>🎙️ {v}</span>
            {onRemoveVoice && (
              <button
                onClick={() => onRemoveVoice(v)}
                style={{ color: '#dc2626', border: 'none', background: '#fef2f2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
              >
                Xóa
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}