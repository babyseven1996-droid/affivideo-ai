import React, { useState } from 'react'

interface CreateVideoProps {
  credits: number
  voices: string[]
  onVideoCreated: (title: string, script: string, videoUrl?: string, image?: string) => void
  onSpendCredits: (amount: number) => boolean
  onToast: (msg: string) => void
}

const TEMPLATES = [
  {
    id: 'tpl_1',
    name: 'Review Sản Phẩm Nổi Bật',
    category: 'Affiliate',
    script: 'Hook: Bạn đã biết đến sản phẩm siêu hot này chưa?\n\nBody: Thiết kế cực kỳ nhỏ gọn, chất liệu cao cấp và giá thành thì siêu hợp lý.\n\nCall to action: Nhấp ngay vào giỏ hàng góc trái để nhận ưu đãi nhé!',
  },
  {
    id: 'tpl_2',
    name: 'Mẹo Hay Hằng Ngày',
    category: 'Lifestyle',
    script: 'Hook: 3 mẹo cực hay giúp bạn tiết kiệm thời gian mỗi sáng!\n\nBody: Mẹo 1... Mẹo 2... Mẹo 3...\n\nCall to action: Lưu lại video này ngay nếu bạn thấy hữu ích!',
  },
]

export default function CreateVideo({
  credits,
  voices = [],
  onVideoCreated,
  onSpendCredits,
  onToast,
}: CreateVideoProps) {
  const safeVoices = Array.isArray(voices) ? voices : []
  const [productUrl, setProductUrl] = useState('')
  const [title, setTitle] = useState('')
  const [script, setScript] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(safeVoices[0] || 'Nam miền Bắc trầm ấm')
  const [isGenerating, setIsGenerating] = useState(false)

  // 1. Hàm áp dụng Template kịch bản
  const handleApplyTemplate = (tplScript: string) => {
    if (credits < 5) {
      onToast('Bạn cần tối thiểu 5 credits để chọn template kịch bản!')
      return
    }
    setScript(tplScript)
    onToast('Đã áp dụng kịch bản mẫu thành công!')
  }

  // 2. Hàm phân tích sản phẩm từ Link
  const handleAnalyzeProduct = () => {
    if (!productUrl.trim()) {
      onToast('Vui lòng nhập đường dẫn (URL) sản phẩm!')
      return
    }
    if (credits < 5) {
      onToast('Bạn không đủ credits! Cần ít nhất 5 credits để phân tích sản phẩm.')
      return
    }

    // Giả lập phân tích AI
    setTitle('Sản phẩm Affiliate AI HOT')
    setScript(
      `Hook: Đừng mua ${productUrl} nếu bạn chưa biết điều này!\n\nBody: Đây là sản phẩm đang làm mưa làm gió với chất lượng vượt trội.\n\nCall to action: Bấm ngay giỏ hàng bên dưới!`
    )
    onToast('AI đã phân tích link sản phẩm và tạo kịch bản thành công!')
  }

  // 3. Hàm Tạo Video & Giọng nói (Tiêu tốn 5 Credits)
  const handleGenerateVoiceAndVideo = async () => {
    if (!title.trim() && !script.trim()) {
      onToast('Vui lòng nhập tiêu đề hoặc nội dung kịch bản!')
      return
    }

    // Hard block kiểm tra credits trước
    if (credits < 5) {
      onToast('Số dư credits không đủ (< 5). Vui lòng nạp thêm để tạo video!')
      return
    }

    // Thực hiện trừ credits
    const success = onSpendCredits(5)
    if (!success) return

    setIsGenerating(true)
    onToast('Đang khởi tạo video AI và lồng tiếng, vui lòng chờ trong giây lát...')

    setTimeout(() => {
      setIsGenerating(false)
      const mockVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'
      const mockImage = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f'

      // Gọi callback để lưu vào State App & Supabase
      onVideoCreated(
        title || 'Video Affiliate Mới Tạo',
        script,
        mockVideoUrl,
        mockImage
      )

      // Reset form sau khi tạo xong
      setTitle('')
      setScript('')
      setProductUrl('')
    }, 2500)
  }

  return (
    <div className="create-video-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Tạo Video AI Affiliate</h2>

        {/* Khung Phân Tích Link Sản Phẩm */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Link sản phẩm (TikTok, Shopee, Lazada):
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Dán URL sản phẩm vào đây..."
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <button
              onClick={handleAnalyzeProduct}
              style={{ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Phân tích AI
            </button>
          </div>
        </div>

        {/* Khung Chọn Kịch Bản Mẫu */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Hoặc chọn Kịch bản mẫu nhanh:
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl.script)}
                style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                ✨ {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tiêu đề & Kịch bản */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Tiêu đề Video:</label>
          <input
            type="text"
            placeholder="Nhập tiêu đề video..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Nội dung kịch bản:</label>
          <textarea
            rows={5}
            placeholder="Nội dung kịch bản video sẽ xuất hiện ở đây..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
          />
        </div>

        {/* Chọn Giọng Đọc */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Chọn Giọng đọc AI:</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            {safeVoices.map((voice, idx) => (
              <option key={idx} value={voice}>{voice}</option>
            ))}
          </select>
        </div>

        {/* Nút Tạo Video */}
        <button
          onClick={handleGenerateVoiceAndVideo}
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: '14px',
            background: isGenerating ? '#94a3b8' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isGenerating ? '⏳ Đang tạo video & lồng tiếng AI...' : '🚀 Tạo Video Ngay (Tốn 5 Credits)'}
        </button>
      </div>
    </div>
  )
}