import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, AudioLines, Check, CircleHelp, Coins, History, KeyRound, Plus, Save, Trash2 } from 'lucide-react'
import type { CreditTransaction } from '../types'

type VoiceSettingsProps = {
  credits: number
  transactions: CreditTransaction[]
  voices: string[]
  onOpenPricing: () => void
  onAddVoice: (voice: string) => void
  onRemoveVoice: (voice: string) => void
}

export default function VoiceSettings({ credits = 0, transactions = [], voices = [], onOpenPricing, onAddVoice, onRemoveVoice }: VoiceSettingsProps) {
  const safeVoices = Array.isArray(voices) ? voices : []
  
  // Trong hàm addVoice, đổi voices.includes thành safeVoices.includes:
  function addVoice() {
    const cleanName = voiceName.trim()
    if (!cleanName || safeVoices.includes(cleanName)) return
    onAddVoice(cleanName)
    setVoiceName('')
    setNotice(`Đã thêm giọng đọc "${cleanName}".`)
  }

  return (
    <div className="settings-page">
      <section className="settings-section">
        <div className="settings-section-heading"><span className="settings-icon"><KeyRound size={19} /></span><div><h2>Kết nối API</h2><p>Cấu hình kết nối dịch vụ AI của bạn.</p></div></div>
        <div className="settings-fields">
          <label className="setting-field"><span>API endpoint</span><input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="https://api.example.com/v1" /></label>
          <label className="setting-field"><span>API key</span><input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Nhập API key" autoComplete="off" /></label>
          <p className="settings-helper"><CircleHelp size={14} /> Khóa API chỉ được giữ trong phiên demo này, chưa gửi tới máy chủ.</p>
          <div className="settings-actions"><span className="settings-feedback" role="status">{notice}</span><button className="button button-primary" onClick={() => setNotice(apiUrl.trim() ? 'Cấu hình API đã được lưu trong phiên này.' : 'Vui lòng nhập API endpoint.')}><Save size={16} />Lưu cấu hình</button></div>
        </div>
      </section>

      <section className="settings-section credit-section">
        <div className="settings-section-heading"><span className="settings-icon credit-icon"><Coins size={20} /></span><div><h2>Credits</h2><p>Quản lý số dư cho các lượt tạo video.</p></div></div>
        <div className="credit-management"><div><span>Số dư hiện tại</span><strong>{credits} <small>credits</small></strong></div><button className="button button-outline" onClick={onOpenPricing}><Plus size={16} />Nạp thêm credits</button></div>
        <div className="credit-activity">
          <div className="credit-activity-heading"><h3><History size={15} /> Giao dịch gần đây</h3><span>Tối đa 5 giao dịch mới nhất</span></div>
          {transactions.length > 0 ? <div className="transaction-list">{transactions.slice(0, 5).map((transaction) => {
            const isTopUp = transaction.amount > 0
            const date = new Date(transaction.createdAt)
            const formattedDate = Number.isNaN(date.getTime()) ? 'Vừa cập nhật' : date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            return <div className="transaction-row" key={transaction.id}><span className={`transaction-icon${isTopUp ? ' is-top-up' : ''}`}>{isTopUp ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><div className="transaction-info"><strong>{transaction.description}</strong><span>{formattedDate}</span></div><strong className={`transaction-amount${isTopUp ? ' is-top-up' : ''}`}>{isTopUp ? '+' : ''}{transaction.amount} credits</strong></div>
          })}</div> : <p className="transaction-empty">Các lượt phân tích, xuất video và nạp credits sẽ được ghi nhận tại đây.</p>}
        </div>
      </section>

      <section className="settings-section voices-section">
        <div className="settings-section-heading"><span className="settings-icon voice-icon"><AudioLines size={19} /></span><div><h2>Giọng đọc</h2><p>Chọn giọng AI hoặc thêm giọng tùy chỉnh của bạn.</p></div></div>
        <form className="add-voice-form" onSubmit={(event) => { event.preventDefault(); addVoice() }}><input value={voiceName} onChange={(event) => setVoiceName(event.target.value)} placeholder="Ví dụ: Giọng thương hiệu của tôi" aria-label="Tên giọng tùy chỉnh" /><button className="button button-primary" type="submit" disabled={!voiceName.trim()}><Plus size={17} />Thêm giọng</button></form>
        <div className="voice-list">{voices.map((voice, index) => <div className="voice-list-item" key={voice}><span className="voice-play-mark"><AudioLines size={17} /></span><div><strong>{voice}</strong><span>{index < 2 ? 'Giọng AI có sẵn' : 'Giọng tùy chỉnh'}</span></div><span className="voice-ready"><Check size={14} /> Sẵn sàng</span>{index >= 2 && <button className="icon-button delete-button" aria-label={`Xóa ${voice}`} title="Xóa giọng" onClick={() => onRemoveVoice(voice)}><Trash2 size={16} /></button>}</div>)}</div>
      </section>
      {notice && <p className="settings-toast" role="status"><Check size={15} />{notice}</p>}
    </div>
  )
}
