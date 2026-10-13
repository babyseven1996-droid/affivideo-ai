import React, { useState } from 'react'

interface ReupVideoProps {
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
}: ReupVideoProps) {
  const [sourceUrl, setSourceUrl] = useState('')
  const [title, setTitle] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(voices[0] || 'Nam miền Bắc trầm ấm')
  
  // Tùy chọn lách bản quyền
  const [autoFlip, setAutoFlip] = useState(true)
  const [changeSpeed, setChangeSpeed] = useState(true)
  const [autoSub, setAutoSub] = useState(true)
  const [aiDubbing, setAiDubbing] = useState(true)

  const [isProcessing, setIsProcessing] = useState(false)
  const [processStatus, setProcessStatus] = useState('')

  // 1. Phân tích & Tải thông tin Video Gốc
  const handleAnalyzeSourceVideo = async () => {
    if (!sourceUrl.trim()) {
      onToast('Vui lòng dán liên kết (URL) video cần Reup!')
      return
    }

    onToast('🔍 Đang kiểm tra & phân tích liên kết video...')
    
    // Tách tiêu đề gợi ý từ link
    try {
      let tempTitle = 'Video Reup Trend TikTok/Douyin'
      if (sourceUrl.includes('tiktok.com')) tempTitle = 'Video TikTok Affiliate HOT'
      else if (sourceUrl.includes('douyin.com')) tempTitle = 'Video Douyin Trung Quốc Trends'
      else if (sourceUrl.includes('facebook.com') || sourceUrl.includes('fb.watch')) tempTitle = 'Video Facebook Reels'
      else if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) tempTitle = 'Video YouTube Shorts'

      setTitle(tempTitle)
      onToast('✅ Đã tải thông tin video thành công! Bạn có thể chọn các chế độ lách bản quyền bên dưới.')
    } catch {
      setTitle('Video Reup Sản Phẩm')
    }
  }

  // 2. Bắt đầu Reup & Lách Bản Quyền AI
  const handleProcessReupVideo = async () => {
    if (!sourceUrl.trim()) {
      onToast('Vui lòng nhập liên kết video nguồn!')
      return
    }

    const cost = 5
    const success = onSpendCredits(cost)
    if (!success) return

    setIsProcessing(true)
    setProcessStatus('⏬ 1/4 Đang tải video gốc (Không logo/watermark)...')

    try {
      // Giả lập tiến trình xử lý video
      await new Promise(r => setTimeout(r, 1500))
      setProcessStatus('✂️ 2/4 Đang xử lý lách bản quyền (Lật hình, chỉnh tốc độ 1.05x, lọc âm)...')

      await new Promise(r => setTimeout(r, 2000))
      setProcessStatus('🎙️ 3/4 Đang lồng tiếng AI & tạo phụ đề tự động...')

      await new Promise(r => setTimeout(r, 1500))
      setProcessStatus('🚀 4/4 Đang xuất file MP4 HD hoàn chỉnh...')

      await new Promise(r => setTimeout(r, 1000))

      // Xuất video kết quả
      const finalVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'
      const finalImage = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'
      const description = `Reup từ: ${sourceUrl} | Cấu hình: Lật hình (${autoFlip ? 'Bật' : 'Tắt'}), Tốc độ 1.05x (${changeSpeed ? 'Bật' : 'Tắt'}), Lồng tiếng AI (${aiDubbing ? selectedVoice : 'Không'})`

      onVideoCreated(title || 'Video Reup Đã Lách Bản Quyền', description, finalVideoUrl, finalImage)
      onToast('🎉 Reup & Lách bản quyền Video thành công!')

      // Reset form
      setSourceUrl('')
      setTitle('')
    } catch (err) {
      onToast('Có lỗi xảy ra trong quá trình xử lý video!')
    } finally {
      setIsProcessing(false)
      setProcessStatus('')
    }
  }

  return (
    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🔄 Reup Video AI Tự Động
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Tải video không logo từ TikTok, Douyin, Facebook Reels, Shorts & Tự động lách thuật toán bản quyền.
        </p>
      </div>

      {/* Dán Link Video */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
          Dán Link Video Gốc (TikTok, Douyin, Facebook, YouTube):
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="https://vt.tiktok.com/... hoặc https://v.douyin.com/..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
          <button
            onClick={handleAnalyzeSourceVideo}
            style={{ padding: '12px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            Lấy Video
          </button>
        </div>
      </div>

      {/* Tiêu đề Reup */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
          Tên Video / Tiêu đề mới:
        </label>
        <input
          type="text"
          placeholder="Nhập tiêu đề quản lý video..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Cấu hình Lách Bản Quyền (Anti-Copyright Features) */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px' }}>
          ⚙️ Cấu hình AI Lách Bản Quyền & Edit Tự Động:
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoFlip} onChange={(e) => setAutoFlip(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#059669' }} />
            Lật gương video (Horizontal Flip)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={changeSpeed} onChange={(e) => setChangeSpeed(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#059669' }} />
            Tăng tốc độ video nhẹ (1.05x)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoSub} onChange={(e) => setAutoSub(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#059669' }} />
            Tự động tạo Phụ đề tiếng Việt
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={aiDubbing} onChange={(e) => setAiDubbing(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#059669' }} />
            Đè giọng lồng tiếng AI mới
          </label>
        </div>

        {aiDubbing && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
              Chọn Giọng Đọc Lồng Tiếng AI Mới:
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
            >
              {voices.map((v, i) => (
                <option key={i} value={v}>{v}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Trạng thái xử lý */}
      {isProcessing && (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px', color: '#166534', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
          {processStatus}
        </div>
      )}

      {/* Nút bấm Reup */}
      <button
        onClick={handleProcessReupVideo}
        disabled={isProcessing}
        style={{
          width: '100%',
          padding: '16px',
          background: isProcessing ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
        }}
      >
        {isProcessing ? '⏳ Đang xử lý Reup Video...' : '🚀 Bắt Đầu Reup & Lách Bản Quyền (Tốn 5 Credits)'}
      </button>

    </div>
  )
}