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
  credits = 0,
  transactions = [],
  voices = [],
  onOpenPricing,
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
      if (onToast) onToast('Giọng đọc này đã tồn tại!')
      return
    }
    if (onAddVoice) onAddVoice(cleanName)
    setVoiceName('')
  }

  return (
    <div className="settings-page" style={{ padding: '20px' }}>
      <h2>Cài Đặt Giọng Nói & Tài Khoản</h2>
      
      <div style={{ marginTop: '20px', maxWidth: '500px' }}>
        <h3>Danh sách giọng đọc</h3>
        <div style={{ display: 'flex', gap: '10px', margin: '16px 0' }}>
          <input
            type="text"
            placeholder="Nhập tên giọng đọc mới..."
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <button
            onClick={handleAdd}
            style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Thêm
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {safeVoices.map((v, i) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
              <span>{v}</span>
              {onRemoveVoice && (
                <button
                  onClick={() => onRemoveVoice(v)}
                  style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  Xóa
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}