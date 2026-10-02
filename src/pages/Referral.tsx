import { useState } from 'react'
import { Award, Check, Coins, Copy, Gift, Link2, UsersRound, Zap } from 'lucide-react'
import type { ReferralProfile, UserProfile } from '../types'

type ReferralProps = {
  referral: ReferralProfile
  user: UserProfile
  onToast: (message: string) => void
}

export default function Referral({ referral, user, onToast }: ReferralProps) {
  const [copied, setCopied] = useState(false)
  const referralLink = `${window.location.origin}/?ref=${encodeURIComponent(referral.code)}`

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      onToast('Đã sao chép liên kết giới thiệu!')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      onToast('Không thể sao chép liên kết trên trình duyệt này.')
    }
  }

  return (
    <section className="referral-page">
      <header className="referral-page-heading">
        <span className="referral-heading-icon"><Gift size={21} /></span>
        <div>
          <p className="referral-kicker">AFFIVIDEO REWARDS</p>
          <h2>Mời bạn bè, cùng nhận thưởng</h2>
          <p>Chia sẻ trải nghiệm sáng tạo video và nhận credits cho mỗi lời mời thành công.</p>
        </div>
      </header>

      <section className="referral-card referral-invite-card">
        <div className="referral-card-heading">
          <div><span className="referral-card-icon"><Award size={17} /></span><div><h3>Mã giới thiệu cá nhân</h3><p>Mã này gắn với tài khoản của {user.name}.</p></div></div>
          <span className="referral-private-badge">CỦA BẠN</span>
        </div>
        <div className="referral-code-box"><span>MÃ GIỚI THIỆU</span><strong>{referral.code}</strong></div>
        <div className="referral-link-row">
          <div className="referral-link-field"><Link2 size={17} /><div><span>LIÊN KẾT CHIA SẺ</span><code>{referralLink}</code></div></div>
          <button className={`button referral-copy-button${copied ? ' is-copied' : ''}`} onClick={copyReferralLink} aria-live="polite">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Đã sao chép' : 'Sao chép'}</button>
        </div>
      </section>

      <section className="referral-stats-section" aria-labelledby="referral-stats-title">
        <div className="referral-stats-heading"><div><h3 id="referral-stats-title">Tổng quan phần thưởng</h3><p>Số liệu giới thiệu của tài khoản bạn.</p></div><span className="referral-live-badge"><span /> Đang cập nhật</span></div>
        <div className="referral-stat-grid">
          <article className="referral-stat-card"><span className="referral-stat-icon referrals-icon"><UsersRound size={19} /></span><div><p>Bạn bè đã giới thiệu</p><strong>{referral.successfulReferrals}</strong><span className="referral-stat-caption">lượt mời thành công</span></div></article>
          <article className="referral-stat-card"><span className="referral-stat-icon credits-icon"><Coins size={19} /></span><div><p>Credits thưởng nhận được</p><strong>{referral.rewardCredits}<small> credits</small></strong><span className="referral-stat-caption">tổng phần thưởng tích lũy</span></div></article>
          <article className="referral-stat-card"><span className="referral-stat-icon bonus-icon"><Zap size={19} /></span><div><p>Mức thưởng mỗi lượt mời</p><strong>+20<small> credits</small></strong><span className="referral-stat-caption">khi lời mời được xác nhận</span></div></article>
        </div>
      </section>
    </section>
  )
}
