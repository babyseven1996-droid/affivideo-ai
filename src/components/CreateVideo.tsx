import React, { useState } from 'react'
import { renderAntiCopyrightVideo } from '../services/creatomate'

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
  const [previewData, setPreviewData] = useState<{ playUrl: string; cover: string; rawTitle: string } | null>(null)

  // Xử lý chuẩn hóa link đầu vào
  const cleanAndExtractUrl = (rawUrl: string): string => {
    let cleaned = rawUrl.trim()
    const match = cleaned.match(/(https?:\/\/[^\s]+)/g)
    if (match && match.length > 0) {
      cleaned = match[0]
    }
    return cleaned
  }

  // 1. PHÂN TÍCH & BÓC TÁCH VIDEO THẬT
  const handleAnalyzeSourceVideo = async () => {
    const targetUrl = cleanAndExtractUrl(sourceUrl)
    if (!targetUrl) {
      onToast('Vui lòng dán liên kết (URL) video hợp lệ!')
      return
    }

    onToast('🔍 Đang kết nối lấy dữ liệu video gốc...')
    setIsProcessing(true)
    setProcessStatus('⏳ Đang bóc tách file video không watermark...')

    try {
      // Sử dụng API công khai để lấy video thực tế từ TikTok/Douyin/Shorts
      const apiEndpoint = `https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}&hd=1`
      const res = await fetch(apiEndpoint)
      const json = await res.json()

      if (json.code === 0 && json.data) {
        const videoData = {
          playUrl: json.data.play || json.data.wmplay,
          cover: json.data.cover || json.data.origin_cover,
          rawTitle: json.data.title || 'Video Reup Affiliate HOT',
        }
        setPreviewData(videoData)
        setTitle(videoData.rawTitle)
        onToast('✅ Bóc tách video gốc thành công!')
      } else {
        throw new Error('API không trả về dữ liệu video từ link này.')
      }
    } catch (err: any) {
      console.error(err)
      onToast('Không thể tải video từ link trang chủ này. Vui lòng dùng link chia sẻ trực tiếp (VD: https://vt.tiktok.com/... hoặc link video cụ thể)!')
    } finally {
      setIsProcessing(false)
      setProcessStatus('')
    }
  }

  // 2. REUP & LÁCH BẢN QUYỀN
  const handleProcessReupVideo = async () => {
    const targetUrl = cleanAndExtractUrl(sourceUrl)
    if (!targetUrl) {
      onToast('Vui lòng nhập liên kết video nguồn!')
      return
    }

    if (!previewData?.playUrl) {
      onToast('Vui lòng bấm nút "Lấy Video Thật" trước khi Reup!')
      return
    }

    const cost = 5
    const success = onSpendCredits(cost)
    if (!success) return

    setIsProcessing(true)

    try {
      setProcessStatus('✂️ Đang áp dụng thuật toán lách bản quyền qua Creatomate...')
      
      // 👇 DÁN HOẶC THAY THẾ ĐOẠN NÀY VÀO: Gọi hàm xào nấu video gốc thành video an toàn
      const processedVideoUrl = await renderAntiCopyrightVideo(previewData.playUrl)

      setProcessStatus('🚀 Đang lưu video hoàn chỉnh vào Kho video...')
      await new Promise(r => setTimeout(r, 1000))

      // 👇 Dùng link đã xào nấu (`processedVideoUrl`) thay cho link gốc
      const finalPlayUrl = processedVideoUrl 
      const finalCover = previewData.cover
      const finalTitle = title || previewData.rawTitle
      const description = `Nguồn: ${targetUrl} | Lách bản quyền: Lật hình (${autoFlip ? 'Có' : 'Không'}), Tốc độ 1.05x (${changeSpeed ? 'Có' : 'Không'})`

      onVideoCreated(finalTitle, description, finalPlayUrl, finalCover)
      onToast('🎉 Reup & Lách bản quyền video thành công!')

      // Reset form
      setSourceUrl('')
      setTitle('')
      setPreviewData(null)
    } catch (err) {
      onToast('Có lỗi xảy ra trong quá trình xử lý!')
    } finally {
      setIsProcessing(false)
      setProcessStatus('')
    }
  }

  return (
    <div style={{ background: '#ffffff', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
          🔄 Reup Video AI Tự Động (Chạy Thật 100%)
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Dán link chia sẻ trực tiếp từ TikTok hoặc Douyin để tải file MP4 sạch không logo.
        </p>
      </div>

      {/* Dán Link Video */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
          Dán Link Chia Sẻ Video Gốc:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Dán link chia sẻ (VD: https://vt.tiktok.com/... hoặc link video Douyin cụ thể)"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
          <button
            onClick={handleAnalyzeSourceVideo}
            disabled={isProcessing}
            style={{ padding: '12px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', fontSize: '14px' }}
          >
            Lấy Video Thật
          </button>
        </div>
      </div>

      {/* Xem trước Video Bóc Tách Được */}
      {previewData && (
        <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img src={previewData.cover} alt="Cover" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669', margin: '0 0 4px 0' }}>✓ ĐÃ LẤY THÀNH CÔNG VIDEO GỐC SẠCH KHÔNG LOGO</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{previewData.rawTitle}</p>
            <a href={previewData.playUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>▶ Xem thử file MP4 gốc</a>
          </div>
        </div>
      )}

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

      {/* Cấu hình Lách Bản Quyền */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px' }}>
          ⚙️ Cấu hình AI Lách Thuật Toán Bản Quyền:
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
        </div>
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