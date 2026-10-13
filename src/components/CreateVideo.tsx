import React, { useState } from 'react'

interface CreateVideoProps {
  credits: number
  voices: string[]
  onVideoCreated: (title: string, script: string, videoUrl?: string, image?: string) => void
  onSpendCredits: (amount: number) => boolean
  onToast: (msg: string) => void
}

export default function CreateVideo({
  credits,
  voices = [],
  onVideoCreated,
  onSpendCredits,
  onToast,
}: CreateVideoProps) {
  const [productUrl, setProductUrl] = useState('')
  const [title, setTitle] = useState('')
  const [script, setScript] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(voices[0] || 'Nam miền Bắc trầm ấm')
  const [isGenerating, setIsGenerating] = useState(false)

  // Phân tích thông minh URL Shopee/TikTok (Sửa Lỗi 3)
  const handleAnalyzeProduct = () => {
    if (!productUrl.trim()) {
      onToast('Vui lòng nhập đường dẫn (URL) sản phẩm!')
      return
    }
    if (credits < 5) {
      onToast('Bạn không đủ credits! Cần tối thiểu 5 credits.')
      return
    }

    // Tách tên sản phẩm sạch từ đường link Shopee
    let extractedTitle = 'Sản phẩm Shopee HOT'
    try {
      const urlPath = new URL(productUrl).pathname
      const parts = urlPath.split('/').filter(Boolean)
      if (parts.length > 0) {
        const rawName = parts[0].replace(/-/g, ' ')
        extractedTitle = decodeURIComponent(rawName)
      }
    } catch {
      extractedTitle = 'Sản phẩm Affiliate Xu Hướng'
    }

    setTitle(extractedTitle)
    setScript(
      `Hook: Đừng mua ${extractedTitle} nếu bạn chưa biết 3 bí mật này!\n\nBody: Thiết kế cực kỳ sang trọng, chất liệu bền bỉ và mức giá đang được giảm đến 40% trong hôm nay.\n\nCall to Action: Bấm ngay vào góc trái màn hình để sở hữu ngay nhé!`
    )
    onToast('AI đã phân tích link và tạo kịch bản tối ưu thành công!')
  }

  const handleGenerateVoiceAndVideo = async () => {
    if (!title.trim() || !script.trim()) {
      onToast('Vui lòng nhập tiêu đề và kịch bản!')
      return
    }

    const success = onSpendCredits(5)
    if (!success) return

    setIsGenerating(true)
    onToast('Đang khởi tạo video AI...')

    setTimeout(() => {
      setIsGenerating(false)
      const mockVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'
      const mockImage = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f'

      onVideoCreated(title, script, mockVideoUrl, mockImage)
      setTitle('')
      setScript('')
      setProductUrl('')
    }, 2000)
  }

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Tạo Video AI Affiliate</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Link sản phẩm (TikTok, Shopee, Lazada):</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Dán URL Shopee/TikTok vào đây..."
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <button onClick={handleAnalyzeProduct} style={{ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Phân tích AI
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Tiêu đề Video:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Nội dung kịch bản:</label>
        <textarea
          rows={5}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <button
        onClick={handleGenerateVoiceAndVideo}
        disabled={isGenerating}
        style={{ width: '100%', padding: '14px', background: isGenerating ? '#94a3b8' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: isGenerating ? 'not-allowed' : 'pointer' }}
      >
        {isGenerating ? '⏳ Đang tạo Video AI...' : '🚀 Tạo Video Ngay (Tốn 5 Credits)'}
      </button>
    </div>
  )
}