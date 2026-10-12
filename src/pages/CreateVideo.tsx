import { useState } from 'react'
import { ArrowRight, Check, Clipboard, Link2, LoaderCircle, Sparkles, WandSparkles } from 'lucide-react'
import { analyzeMockProduct, createMockScript, TRENDING_TEMPLATES } from '../data/mockData'
import type { ProductPreview } from '../types'

type CreateVideoProps = {
  credits: number // Truyền trực tiếp số credits hiện tại vào
  voices: string[]
  onVideoCreated: (title: string, script: string, videoUrl?: string, image?: string) => void
  onSpendCredits: (amount: number, action: string) => boolean | void
  onToast: (message: string) => void
}

export default function CreateVideo({ credits, voices, onVideoCreated, onSpendCredits, onToast }: CreateVideoProps) {
  const [link, setLink] = useState('')
  const [voice, setVoice] = useState(voices[0] ?? 'Nam miền Bắc trầm ấm')
  const [phase, setPhase] = useState<'analyzing' | 'rendering' | null>(null)
  const [product, setProduct] = useState<ProductPreview | null>(null)
  const [script, setScript] = useState('')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  function applyTemplate(templateId: string) {
    const template = TRENDING_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return
    setSelectedTemplateId(template.id)
    setLink(`https://demo.affivideo.ai/product/${template.id}`)
    setVoice(voices.includes(template.voice) ? template.voice : voices[0] ?? template.voice)
    setProduct(template.product)
    setScript(template.script)
    setMessage('Đã áp dụng mẫu. Bạn có thể chỉnh sửa kịch bản bên dưới.')
    onToast(`Đã áp dụng mẫu ${template.title} thành công!`)
  }

  // Bước 1: Phân tích sản phẩm
  function analyzeProduct() {
    // CHẶN CỨNG 1: Kiểm tra số dư credits ngay lập tức
    if (credits < 5) {
      if (onToast) onToast('Bạn đã hết credits! Vui lòng nạp thêm để tiếp tục.')
      return
    }

    if (onSpendCredits) {
      onSpendCredits(5, 'phân tích sản phẩm')
    }

    setPhase('analyzing')
    setProduct(null)
    setMessage('')

    window.setTimeout(() => {
      const matchedTemplate = TRENDING_TEMPLATES.find(
        (t) => link.includes(t.id) || link.toLowerCase().includes(t.title.toLowerCase())
      )

      const analyzedProduct = matchedTemplate ? matchedTemplate.product : analyzeMockProduct(link)
      const generatedScript = matchedTemplate ? matchedTemplate.script : createMockScript(analyzedProduct)

      setProduct(analyzedProduct)
      setScript(generatedScript)
      setPhase(null)
      setMessage('Đã tạo kịch bản thành công! Kiểm tra lại và bấm xuất video ở bước 03 bên dưới.')

      if (onToast) {
        onToast('Phân tích sản phẩm và tạo kịch bản thành công!')
      }
    }, 1150)
  }

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
      onToast('Đã sao chép kịch bản vào bộ nhớ tạm!')
    } catch {
      onToast('Không thể sao chép kịch bản')
    }
  }

  // Bước 2: Tạo giọng đọc & xuất video
  function handleGenerateVoiceAndVideo() {
    // CHẶN CỨNG 2: Kiểm tra số dư credits ngay lập tức
    if (credits < 5) {
      if (onToast) onToast('Bạn đã hết credits! Vui lòng nạp thêm để tiếp tục.')
      return
    }

    if (onSpendCredits) {
      onSpendCredits(5, 'tạo giọng đọc & xuất video')
    }

    setPhase('rendering')
    setMessage('Đang tổng hợp giọng đọc AI và dựng video...')

    window.setTimeout(() => {
      setPhase(null)
      setMessage('Xuất video thành công!')

      if (onToast) {
        onToast('Đã tạo giọng đọc và xuất video thành công!')
      }

      if (onVideoCreated && product) {
        onVideoCreated(
          product.title || 'Video sản phẩm Affiliate',
          script || 'Kịch bản video...',
          'https://example.com/sample-video.mp4',
          product.image
        )
      }
    }, 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Hero Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderRadius: '12px', border: '1px solid #d1fae5' }}>
        <div style={{ background: '#10b981', color: '#fff', padding: '12px', borderRadius: '10px', display: 'flex' }}>
          <WandSparkles size={24} />
        </div>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#065f46' }}>Biến sản phẩm thành video bán hàng</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#047857' }}>Chỉ cần một đường dẫn. AI sẽ giúp bạn lên kịch bản sẵn sàng chuyển đổi.</p>
        </div>
      </div>

      {/* Mẫu video xu hướng */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} /> ĐANG THỊNH HÀNH
          </span>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Mẫu video xu hướng</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {TRENDING_TEMPLATES.map((template) => {
            const isSelected = selectedTemplateId === template.id
            return (
              <div
                key={template.id}
                onClick={() => applyTemplate(template.id)}
                style={{
                  border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: isSelected ? '#f0fdf4' : '#fff',
                  transition: 'all 0.2s',
                }}
              >
                <img
                  src={template.product.image}
                  alt={template.title}
                  style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '10px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', lineHeight: '1.3', height: '32px', overflow: 'hidden' }}>{template.title}</h4>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} /> {isSelected ? 'Đang dùng' : 'Dùng mẫu'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bước 01: Thông tin sản phẩm */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ background: '#e0e7ff', color: '#4f46e5', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>01</span>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Thông tin sản phẩm</h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Đường dẫn sản phẩm</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 12px', background: '#f9fafb' }}>
            <Link2 size={18} style={{ color: '#9ca3af', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Dán link Shopee, TikTok Shop, Jimeng..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{ width: '100%', padding: '10px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>Hỗ trợ link sản phẩm từ các sàn thương mại phổ biến.</span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Giọng đọc AI</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', fontSize: '14px' }}
            >
              {voices.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <button
            onClick={analyzeProduct}
            disabled={phase === 'analyzing'}
            style={{
              background: '#10b981', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '8px',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '42px'
            }}
          >
            {phase === 'analyzing' ? (
              <>
                <LoaderCircle className="spinner" size={18} /> Đang phân tích...
              </>
            ) : (
              <>
                <WandSparkles size={18} /> Phân tích & Tạo kịch bản <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>5 credits</span>
              </>
            )}
          </button>
        </div>
      </div>

      {message && <div style={{ padding: '12px 16px', background: '#eff6ff', color: '#1e40af', borderRadius: '8px', fontSize: '14px' }}>{message}</div>}

      {/* Bước 02: Kết quả phân tích (Preview) */}
      {product && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ background: '#e0e7ff', color: '#4f46e5', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>02</span>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Kết quả phân tích</h3>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f9fafb', padding: '16px', borderRadius: '10px' }}>
            <img
              src={product.image}
              alt={product.title}
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
            />
            <div>
              <span style={{ fontSize: '11px', background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{product.category}</span>
              <h4 style={{ margin: '6px 0 4px 0', fontSize: '15px' }}>{product.title}</h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#4b5563', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
              <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '14px' }}>{product.price}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bước 03: Kịch bản video & Nút xuất video */}
      {script && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ background: '#e0e7ff', color: '#4f46e5', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>03</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Kịch bản video</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Chỉnh sửa lời thoại theo phong cách của bạn.</p>
            </div>
          </div>

          <textarea
            rows={7}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', lineHeight: '1.5', outline: 'none', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{script.split(/\s+/).filter(Boolean).length} từ · Đã lưu tự động</span>
            <button
              onClick={copyScript}
              style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? <Check size={14} /> : <Clipboard size={14} />} {copied ? 'Đã sao chép' : 'Sao chép kịch bản'}
            </button>
          </div>

          {/* Nút Xuất Video & Lưu Supabase */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '20px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#065f46' }}>Sẵn sàng xuất bản?</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>Giọng đọc: {voice} · Chi phí: 5 credits</p>
            </div>
            <button
              onClick={handleGenerateVoiceAndVideo}
              disabled={phase === 'rendering'}
              style={{
                background: '#059669', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px',
                fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {phase === 'rendering' ? (
                <>
                  <LoaderCircle className="spinner" size={18} /> Đang xuất video...
                </>
              ) : ( 
                <>
                  Tạo giọng đọc & xuất video <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>5 credits</span> <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}