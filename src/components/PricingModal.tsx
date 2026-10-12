import { useState } from 'react'
import { X, Check, ArrowRight, ShieldCheck, Crown, Sparkles, CreditCard, ArrowLeft, QrCode } from 'lucide-react'

type PricingPackage = {
  id: string
  name: string
  subtitle: string
  price: string
  rawPrice: number
  credits: number
  features: string[]
  hot?: boolean
  icon: 'sparkles' | 'crown' | 'card'
}

const PACKAGES: PricingPackage[] = [
  {
    id: 'starter',
    name: 'Gói Khởi Đầu',
    subtitle: 'Làm quen với quy trình video AI.',
    price: '50.000đ',
    rawPrice: 50000,
    credits: 100,
    icon: 'sparkles',
    features: [
      '100 credits',
      '20 lượt phân tích hoặc xuất',
      'Dùng trong 12 tháng',
    ],
  },
  {
    id: 'pro',
    name: 'Gói Pro',
    subtitle: 'Dành cho nhà sáng tạo nội dung đều đặn.',
    price: '100.000đ',
    rawPrice: 100000,
    credits: 250,
    hot: true,
    icon: 'crown',
    features: [
      '250 credits',
      '50 lượt phân tích hoặc xuất',
      'Ưu tiên xử lý AI',
    ],
  },
  {
    id: 'business',
    name: 'Gói Business',
    subtitle: 'Thêm dung lượng cho hoạt động bán hàng.',
    price: '250.000đ',
    rawPrice: 250000,
    credits: 700,
    icon: 'card',
    features: [
      '700 credits',
      '140 lượt phân tích hoặc xuất',
      'Hỗ trợ ưu tiên',
    ],
  },
]

type PricingModalProps = {
  onClose: () => void
  onConfirmPayment: (pkg: { id: string; name: string; credits: number; price: string }) => void
}

export default function PricingModal({ onClose, onConfirmPayment }: PricingModalProps) {
  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCompletePayment = () => {
    if (!selectedPkg) return
    setIsSuccess(true)
    setTimeout(() => {
      onConfirmPayment({
        id: selectedPkg.id,
        name: selectedPkg.name,
        credits: selectedPkg.credits,
        price: selectedPkg.price,
      })
    }, 1200)
  }

  const renderIcon = (iconType: 'sparkles' | 'crown' | 'card') => {
    if (iconType === 'sparkles') return <Sparkles size={20} style={{ color: '#059669' }} />
    if (iconType === 'crown') return <Crown size={20} style={{ color: '#059669' }} />
    return <CreditCard size={20} style={{ color: '#059669' }} />
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: selectedPkg ? '540px' : '920px',
          width: '100%',
          padding: '32px 36px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Nút đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          <X size={18} />
        </button>

        {!selectedPkg ? (
          /* BƯỚC 1: MÀN HÌNH CHỌN GÓI NẠP (CHUẨN ĐẸP NHƯ ẢNH) */
          <>
            <div style={{ marginBottom: '28px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                GÓI CREDITS
              </span>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                Nạp Credits & Nâng cấp tài khoản
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Credits được cộng vào số dư sau khi xác nhận thanh toán mô phỏng.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
              {PACKAGES.map((pkg) => {
                const isHot = pkg.hot
                return (
                  <div
                    key={pkg.id}
                    style={{
                      border: isHot ? '2px solid #059669' : '1px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '24px 20px',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      position: 'relative',
                    }}
                  >
                    {isHot && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-13px',
                          right: '20px',
                          background: '#059669',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        HOT
                      </span>
                    )}

                    <div>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#ecfdf5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        {renderIcon(pkg.icon)}
                      </div>

                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                        {pkg.name}
                      </h3>
                      <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#6b7280', minHeight: '32px', lineHeight: '1.4' }}>
                        {pkg.subtitle}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{pkg.price}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>/ gói</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                        <Sparkles size={14} style={{ color: '#d97706' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#d97706' }}>
                          {pkg.credits} credits
                        </span>
                      </div>

                      <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '20px' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                        {pkg.features.map((feat, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                            <Check size={14} style={{ color: '#059669', flexShrink: 0 }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPkg(pkg)}
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        borderRadius: '10px',
                        border: isHot ? 'none' : '1px solid #d1d5db',
                        background: isHot ? '#059669' : '#ffffff',
                        color: isHot ? '#ffffff' : '#111827',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      Nạp ngay
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#9ca3af', fontSize: '12px' }}>
              <ShieldCheck size={14} />
              <span>Đây là cổng thanh toán demo. Không nhập thông tin thẻ hoặc chuyển tiền thật.</span>
            </div>
          </>
        ) : (
          /* BƯỚC 2: MÀN HÌNH QUÉT MÃ QR THANH TOÁN (BANKING) */
          <div>
            <button
              onClick={() => {
                setSelectedPkg(null)
                setIsSuccess(false)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#4b5563',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={16} /> Quay lại chọn gói
            </button>

            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: '64px', height: '64px', background: '#d1fae5', color: '#059669', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Check size={36} />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#065f46' }}>Thanh toán thành công!</h3>
                <p style={{ margin: 0, color: '#047857', fontSize: '14px' }}>
                  Đã cộng <b>+{selectedPkg.credits} Credits</b> vào tài khoản của bạn.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700 }}>Chuyển khoản Ngân hàng (VietQR)</h3>
                <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '13px' }}>
                  Quét mã QR để thanh toán cho gói <b>{selectedPkg.name}</b> (+{selectedPkg.credits} credits)
                </p>

                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'inline-block', marginBottom: '20px' }}>
                  <img
                    src={`https://img.vietqr.io/image/MB-9999999999-qr_only.png?amount=${selectedPkg.rawPrice}&addInfo=AFFIVIDEO%20${selectedPkg.id.toUpperCase()}`}
                    alt="Mã QR Chuyển khoản"
                    style={{ width: '200px', height: '200px', borderRadius: '12px', display: 'block', margin: '0 auto 12px auto' }}
                  />
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                    Số tiền: {selectedPkg.price}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Nội dung: <b>AFFIVIDEO {selectedPkg.id.toUpperCase()}</b>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleCompletePayment}
                    style={{
                      width: '100%',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <QrCode size={18} /> Tôi đã chuyển khoản thành công
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}