import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Crown, CreditCard, QrCode, ShieldCheck, Sparkles, X } from 'lucide-react'

const PLANS = [
  { name: 'Gói Khởi Đầu', price: 50000, credits: 100, description: 'Làm quen với quy trình video AI.', icon: Sparkles, features: ['100 credits', '20 lượt phân tích hoặc xuất', 'Dùng trong 12 tháng'] },
  { name: 'Gói Pro', price: 100000, credits: 250, description: 'Dành cho nhà sáng tạo nội dung đều đặn.', icon: Crown, featured: true, features: ['250 credits', '50 lượt phân tích hoặc xuất', 'Ưu tiên xử lý AI'] },
  { name: 'Gói Business', price: 250000, credits: 700, description: 'Thêm dung lượng cho hoạt động bán hàng.', icon: CreditCard, features: ['700 credits', '140 lượt phân tích hoặc xuất', 'Hỗ trợ ưu tiên'] },
]

type Plan = typeof PLANS[number]
type PaymentMethod = 'bank' | 'momo'

type PricingModalProps = {
  onClose: () => void
  onConfirmPayment: (credits: number, plan: string) => void
}

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')}đ`
}

export default function PricingModal({ onClose, onConfirmPayment }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank')
  const [reference] = useState(() => {
    const randomValue = typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase()
      : Math.random().toString(36).slice(2, 9).toUpperCase()
    return `AFFI${randomValue.slice(0, 7).padStart(7, '0')}`
  })

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className={`pricing-modal${selectedPlan ? ' payment-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="pricing-title" onClick={(event) => event.stopPropagation()}>
        {selectedPlan ? <>
          <div className="modal-heading payment-heading"><div><span className="modal-eyebrow">THANH TOÁN MÔ PHỎNG</span><h2 id="pricing-title">Hoàn tất nạp credits</h2><p>{selectedPlan.name} · {selectedPlan.credits.toLocaleString('vi-VN')} credits · {formatPrice(selectedPlan.price)}</p></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={19} /></button></div>
          <button className="payment-back" onClick={() => setSelectedPlan(null)}><ArrowLeft size={15} /> Quay lại các gói</button>
          <div className="payment-methods" role="tablist" aria-label="Phương thức thanh toán">
            <button className={paymentMethod === 'bank' ? 'is-selected' : ''} role="tab" aria-selected={paymentMethod === 'bank'} onClick={() => setPaymentMethod('bank')}><QrCode size={16} />Chuyển khoản QR</button>
            <button className={paymentMethod === 'momo' ? 'is-selected' : ''} role="tab" aria-selected={paymentMethod === 'momo'} onClick={() => setPaymentMethod('momo')}><span className="momo-mark">m</span>Ví MoMo</button>
          </div>
          <div className="payment-content">
            <div className={`payment-qr${paymentMethod === 'momo' ? ' payment-qr-momo' : ''}`} role="img" aria-label={`Mã QR ${paymentMethod === 'momo' ? 'MoMo' : 'ngân hàng'} demo cho giao dịch ${reference}, số tiền ${formatPrice(selectedPlan.price)}`}><span className="qr-corner qr-corner-top-left" /><span className="qr-corner qr-corner-top-right" /><span className="qr-corner qr-corner-bottom-left" /><span className="qr-center-mark">{paymentMethod === 'momo' ? 'm' : <QrCode size={22} />}</span></div>
            <p className="payment-qr-caption">{paymentMethod === 'momo' ? 'Mã QR MoMo mô phỏng' : 'Mã QR ngân hàng mô phỏng'}</p>
            <div className="payment-details">
              <div><span>Ngân hàng / Ví</span><strong>{paymentMethod === 'momo' ? 'MoMo Demo' : 'Vietcombank · AFFIVIDEO'}</strong></div>
              <div><span>Tài khoản nhận</span><strong>{paymentMethod === 'momo' ? '09•• ••• 888' : '1028 6688 2026'}</strong></div>
              <div><span>Nội dung chuyển khoản</span><strong className="payment-reference">{reference}</strong></div>
              <div className="payment-total"><span>Tổng thanh toán</span><strong>{formatPrice(selectedPlan.price)}</strong></div>
            </div>
          </div>
          <div className="payment-security"><ShieldCheck size={15} /> Demo: không có giao dịch hay khoản tiền thật nào được thực hiện.</div>
          <button className="button button-primary payment-confirm" onClick={() => onConfirmPayment(selectedPlan.credits, selectedPlan.name)}><CheckCircle2 size={17} />Xác nhận đã thanh toán</button>
        </> : <>
          <div className="modal-heading"><div><span className="modal-eyebrow">GÓI CREDITS</span><h2 id="pricing-title">Nạp Credits &amp; Nâng cấp tài khoản</h2><p>Credits được cộng vào số dư sau khi xác nhận thanh toán mô phỏng.</p></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={19} /></button></div>
          <div className="pricing-grid">
            {PLANS.map(({ name, price, credits, description, icon: Icon, featured, features }) => (
              <article className={`plan-card${featured ? ' plan-featured' : ''}`} key={name}>
                {featured && <span className="plan-popular">HOT</span>}
                <span className="plan-icon"><Icon size={18} /></span><h3>{name}</h3><p>{description}</p>
                <div className="plan-price">{formatPrice(price)}<span> / gói</span></div><div className="plan-credit-count"><Sparkles size={14} />{credits.toLocaleString('vi-VN')} credits</div>
                <ul>{features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>
                <button className={`button ${featured ? 'button-primary' : 'button-outline'} plan-action`} onClick={() => setSelectedPlan(PLANS.find((plan) => plan.name === name) ?? null)}>Nạp ngay <ArrowRight className="plan-action-arrow" size={15} /></button>
              </article>
            ))}
          </div>
          <p className="pricing-disclaimer"><ShieldCheck size={13} /> Đây là cổng thanh toán demo. Không nhập thông tin thẻ hoặc chuyển tiền thật.</p>
        </>}
      </section>
    </div>
  )
}
