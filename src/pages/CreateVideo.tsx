import { useState } from 'react'
import { ArrowRight, Check, Clipboard, Link2, LoaderCircle, Sparkles, WandSparkles } from 'lucide-react'
import { analyzeMockProduct, createMockScript, TRENDING_TEMPLATES } from '../data/mockData'
import type { ProductPreview, VideoRecord } from '../types'

type CreateVideoProps = {
  voices: string[]
  onVideoCreated: (video: VideoRecord) => void
  onSpendCredits: (amount: number, action: string) => boolean
  onToast: (message: string) => void
}

export default function CreateVideo({ voices, onVideoCreated, onSpendCredits, onToast }: CreateVideoProps) {
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
    setMessage('Đã áp dụng mẫu. Bạn có thể chỉnh sửa tiêu đề và kịch bản ngay bên dưới.')
    onToast(`Đã áp dụng mẫu ${template.title} thành công!`)
  }

  function analyzeProduct() {
    if (!onSpendCredits(5, 'phân tích sản phẩm')) return
    setSelectedTemplateId(null)
    setPhase('analyzing')
    setProduct(null)
    setMessage('')
    window.setTimeout(() => {
      const analyzedProduct = analyzeMockProduct(link)
      setProduct(analyzedProduct)
      setScript(createMockScript(analyzedProduct))
      setPhase(null)
    }, 1150)
  }

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setMessage('Không thể sao chép trên trình duyệt này.')
    }
  }

  function saveScript() {
    try {
      window.localStorage.setItem('affivideo-saved-script', script)
      setMessage('Đã lưu kịch bản trên thiết bị này.')
    } catch {
      setMessage('Không thể lưu kịch bản trên thiết bị này.')
    }
  }

  function createVideo() {
    if (!product || !script.trim()) return
    if (!onSpendCredits(5, 'xuất video')) return
    setPhase('rendering')
    window.setTimeout(() => {
      onVideoCreated({
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
        title: product.title,
        date: new Intl.DateTimeFormat('vi-VN').format(new Date()),
        credits: 5,
        price: product.price,
        image: product.image,
        script,
        voice,
      })
      setPhase(null)
    }, 1350)
  }

  return (
    <div className="create-page">
      <section className="intro-copy">
        <div className="intro-icon"><WandSparkles size={19} /></div>
        <div><h2>Biến sản phẩm thành video bán hàng</h2><p>Chỉ cần một đường dẫn. AI sẽ giúp bạn lên kịch bản sẵn sàng chuyển đổi.</p></div>
      </section>

      <section className="template-section" aria-labelledby="template-heading">
        <div className="template-section-heading"><div><span className="template-eyebrow"><Sparkles size={13} /> ĐANG THỊNH HÀNH</span><h2 id="template-heading">Mẫu video xu hướng</h2></div><span>Chọn mẫu để điền sẵn nội dung</span></div>
        <div className="template-grid">{TRENDING_TEMPLATES.map((template) => <button type="button" key={template.id} className={`template-tile${selectedTemplateId === template.id ? ' is-selected' : ''}`} onClick={() => applyTemplate(template.id)}><span className="template-image"><img src={template.product.image} alt="" loading="lazy" /><span className="template-label">{template.label}</span><span className="template-use"><WandSparkles size={14} />Dùng mẫu</span></span><span className="template-title">{template.title}</span></button>)}</div>
      </section>

      <section className="panel input-panel">
        <div className="panel-heading"><div><span className="step-index">01</span><h3>Thông tin sản phẩm</h3></div><span className="optional-label">Khoảng 1 phút</span></div>
        <label className="field-label" htmlFor="product-link">Đường dẫn sản phẩm</label>
        <div className="input-with-icon"><Link2 size={18} /><input id="product-link" type="url" inputMode="url" value={link} onChange={(event) => { setLink(event.target.value); setSelectedTemplateId(null) }} placeholder="Dán link Shopee, TikTok Shop, Jimeng..." /></div>
        <p className="field-hint">Hỗ trợ link sản phẩm từ các sàn thương mại phổ biến.</p>

        <div className="form-bottom-row">
          <div className="voice-field"><label className="field-label" htmlFor="voice-select">Giọng đọc AI</label><select id="voice-select" value={voice} onChange={(event) => setVoice(event.target.value)}>{!voices.includes(voice) && <option value={voice}>{voice}</option>}{voices.map((item) => <option key={item} value={item}>{item}</option>)}{voices.length === 0 && <option value="Nam miền Bắc trầm ấm">Nam miền Bắc trầm ấm</option>}</select></div>
          <button className="button button-primary analyze-button" onClick={analyzeProduct} disabled={phase !== null}>
            {phase === 'analyzing' ? <><LoaderCircle className="spin" size={18} /> Đang AI phân tích...</> : <><Sparkles size={17} /> Phân tích &amp; Tạo kịch bản <span className="action-cost">5 credits</span><ArrowRight size={17} /></>}
          </button>
        </div>
        {phase === 'analyzing' && <div className="analysis-progress" role="status"><span className="progress-track"><span /></span><span>Đang AI phân tích sản phẩm, hình ảnh và thông tin...</span></div>}
      </section>

      {product && <section className="results-section fade-in" aria-live="polite">
        <div className="section-title-row"><div><span className="step-index">02</span><h3>Kết quả phân tích</h3></div><span className="ready-badge"><Check size={14} /> Hoàn tất</span></div>
        <article className="product-preview panel">
          <div className="product-image-wrap"><img src={product.image} alt={product.title} /><span className="image-tag">SẢN PHẨM NỔI BẬT</span></div>
          <div className="product-details"><span className="product-category">{product.category}</span><input className="product-title-input" aria-label="Tiêu đề sản phẩm" value={product.title} onChange={(event) => setProduct((current) => current ? { ...current, title: event.target.value } : current)} /><div className="product-meta"><span className="rating-star">★</span><strong>{product.rating}</strong><span className="meta-divider" />{product.sales}</div><p>{product.description}</p><div className="product-price-row"><strong>{product.price}</strong><span>Giá tham khảo</span></div></div>
        </article>

        <article className="panel script-panel">
          <div className="script-heading"><div><span className="step-index">03</span><div><h3>Kịch bản video</h3><p>Chỉnh sửa lời thoại theo phong cách của bạn.</p></div></div><span className="script-duration">~ 30 giây</span></div>
          <div className="script-outline"><span><i className="outline-dot hook-dot" />Hook</span><span><i className="outline-dot body-dot" />Thân bài</span><span><i className="outline-dot cta-dot" />Kêu gọi</span></div>
          <textarea aria-label="Chỉnh sửa kịch bản AI" className="script-editor" value={script} onChange={(event) => setScript(event.target.value)} />
          <div className="script-footer"><span>{script.trim().split(/\s+/).filter(Boolean).length} từ · Đã lưu tự động</span><div><button className="button button-subtle" onClick={copyScript}><Clipboard size={16} />{copied ? 'Đã sao chép' : 'Sao chép'}</button><button className="button button-subtle" onClick={saveScript}><Check size={16} />Lưu kịch bản</button></div></div>
          {message && <p className="inline-message" role="status">{message}</p>}
        </article>

        <div className="export-row"><div><strong>Sẵn sàng cho bước tiếp theo?</strong><span>Giọng đọc: {voice} · Xuất video: 5 credits</span></div><button className="button button-export" onClick={createVideo} disabled={phase !== null || !script.trim()}>{phase === 'rendering' ? <><LoaderCircle className="spin" size={18} /> Đang tạo video...</> : <>Tạo giọng đọc &amp; xuất video <span className="action-cost">5 credits</span><ArrowRight size={17} /></>}</button></div>
      </section>}
    </div>
  )
}
