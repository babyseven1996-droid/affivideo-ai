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
      if (onToast) onToast('Đã sao chép liên kết giới thiệu vào bộ nhớ tạm!')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      if (onToast) onToast('Không thể sao chép liên kết trên trình duyệt này.')
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner Card */}
      <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', padding: '36px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Giới thiệu bạn bè - Nhận ngay Credits miễn phí!</h2>
        <p style={{ fontSize: '15px', opacity: 0.9, maxWidth: '600px', lineHeight: '1.5', margin: 0 }}>
          Mời người dùng mới tham gia nền tảng AffiVideo AI. Bạn sẽ nhận ngay 20 Credits cho mỗi lượt đăng ký thành công qua liên kết giới thiệu của bạn.
        </p>
      </div>

      {/* Share Section */}
      <div style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
            Liên kết giới thiệu độc quyền của bạn:
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155' }}
            />
            <button 
              onClick={copyReferralLink}
              style={{ padding: '14px 24px', background: copied ? '#059669' : '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s' }}
            >
              {copied ? '✓ Đã sao chép' : 'Sao chép link'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0' }}>Tổng số bạn bè mời</p>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', margin: 0 }}>{safeReferral.successfulReferrals} người</h3>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0' }}>Credits nhận được</p>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>{safeReferral.successfulReferrals * 20} Credits</h3>
          </div>
        </div>
      </div>

    </div>
  )
}