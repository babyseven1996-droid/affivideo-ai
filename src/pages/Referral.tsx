import React, { useState } from 'react'

interface ReferralProps {
  referral?: { code: string; successfulReferrals: number }
  user?: any
  onToast?: (message: string) => void
}

export default function Referral({ referral = { code: 'AFFI123', successfulReferrals: 0 }, user, onToast }: ReferralProps) {
  const [copied, setCopied] = useState(false)
  const safeReferral = referral || { code: 'AFFI123', successfulReferrals: 0 }
  const referralLink = `${window.location.origin}/?ref=${encodeURIComponent(safeReferral.code)}`

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      if (onToast) onToast('Đã sao chép liên kết giới thiệu!')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      if (onToast) onToast('Không thể sao chép liên kết trên trình duyệt này.')
    }
  }

  return (
    <section className="referral-page" style={{ padding: '20px' }}>
      <header className="referral-page-heading">
        <h2>Mời bạn bè, cùng nhận thưởng</h2>
        <p>Chia sẻ trải nghiệm sáng tạo video và nhận credits cho mỗi lời mời thành công.</p>
      </header>

      <div style={{ marginTop: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px', maxWidth: '500px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Mã giới thiệu của bạn:</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <button 
            onClick={copyReferralLink}
            style={{ padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            {copied ? 'Đã chép' : 'Sao chép'}
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
          Số lượt giới thiệu thành công: <strong>{safeReferral.successfulReferrals}</strong>
        </p>
      </div>
    </section>
  )
}