// src/components/CreateVideo.tsx
import React, { useState } from 'react';
import { renderAntiCopyrightVideo } from '../services/creatomate';

interface CreateVideoProps {
  credits: number;
  voices: any[];
  onVideoCreated: (video: any) => void;
  onSpendCredits: (amount: number) => void;
  onToast: (msg: string) => void;
}

export default function CreateVideo({
  credits,
  voices,
  onVideoCreated,
  onSpendCredits,
  onToast,
}: CreateVideoProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  
  // Tùy chọn lách bản quyền
  const [flipVideo, setFlipVideo] = useState(true);
  const [speedUp, setSpeedUp] = useState(true);

  const [previewData, setPreviewData] = useState<{
    playUrl: string;
    cover: string;
    rawTitle: string;
  } | null>(null);

  // 💡 Hàm chuẩn hóa & lọc sạch link đầu vào (Hỗ trợ TikTok)
  const cleanAndExtractUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    let cleaned = rawUrl.trim();
    const match = cleaned.match(/https?:\/\/[^\s]+/g);
    if (match && match.length > 0) {
      let url = match[0];
      url = url.replace(/[)}\],，。！？;]+$/, '');
      return url;
    }
    return cleaned;
  };

  // 💡 Bước 1: Phân tích & Bóc tách video thật từ link TikTok
  const handleAnalyzeSourceVideo = async () => {
    const targetUrl = cleanAndExtractUrl(sourceUrl);
    if (!targetUrl) {
      onToast('Vui lòng dán liên kết (URL) video hợp lệ');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('Đang kết nối lấy dữ liệu video gốc...');

    try {
      const apiEndpoint = `https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}&hd=1`;
      const res = await fetch(apiEndpoint);
      const json = await res.json();

      if (json.code === 0 && json.data) {
        const videoData = {
          playUrl: json.data.play || json.data.wmplay,
          cover: json.data.cover || json.data.origin_cover,
          rawTitle: json.data.title || 'Video Reup Affiliate HOT',
        };

        setPreviewData(videoData);
        if (!videoTitle) {
          setVideoTitle(videoData.rawTitle);
        }
        onToast('🎉 Lấy video gốc thành công!');
      } else {
        onToast('❌ Không thể lấy dữ liệu video từ link này. Vui lòng kiểm tra lại!');
      }
    } catch (error) {
      console.error('Lỗi phân tích video:', error);
      onToast('❌ Đã xảy ra lỗi kết nối khi lấy video.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // 💡 Bước 2: Bắt đầu Xào nấu & Lách bản quyền qua Creatomate API
  const handleProcessReup = async () => {
    if (!previewData || !previewData.playUrl) {
      onToast('Vui lòng lấy video gốc trước khi bắt đầu!');
      return;
    }

    if (credits < 5) {
      onToast('⚠️ Bạn không đủ Credit (Cần tối thiểu 5 Credits)!');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('🛡️ Đang áp dụng AI Lách bản quyền & Xào nấu Ultra HD...');

    try {
      // Trừ credits trước
      onSpendCredits(5);

      // Gọi service xào nấu video qua Creatomate
      const finalRenderedUrl = await renderAntiCopyrightVideo(previewData.playUrl);

      const newVideoRecord = {
        id: Date.now().toString(),
        title: videoTitle || previewData.rawTitle,
        url: finalRenderedUrl,
        cover: previewData.cover,
        createdAt: new Date().toISOString(),
      };

      onVideoCreated(newVideoRecord);
      onToast('🎉 Xào nấu và Lách bản quyền video thành công!');
      
      // Reset form
      setSourceUrl('');
      setVideoTitle('');
      setPreviewData(null);
    } catch (error) {
      console.error('Lỗi xử lý reup:', error);
      onToast('❌ Quá trình xào nấu video thất bại.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px', marginRight: '10px' }}>🔄</span>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#111' }}>Reup Video AI Tự Động (Chạy Thật 100%)</h2>
        </div>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
          Dán link chia sẻ trực tiếp từ TikTok để tải file MP4 sạch không logo và tự động xào nấu chống bản quyền.
        </p>

        {/* Ô nhập link */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#333' }}>
            Dán Link Chia Sẻ Video Gốc:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Dán link chia sẻ (VD: https://vt.tiktok.com/... hoặc link video)"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAnalyzeSourceVideo}
              disabled={isProcessing}
              style={{
                backgroundColor: '#009955',
                color: '#fff',
                border: 'none',
                padding: '0 24px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {isProcessing ? 'Đang xử lý...' : 'Lấy Video Thật'}
            </button>
          </div>
        </div>

        {/* Tiêu đề video mới */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#333' }}>
            Tên Video / Tiêu đề mới:
          </label>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Nhập tiêu đề quản lý video..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Preview video nếu đã lấy thành công */}
        {previewData && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img src={previewData.cover} alt="Cover" style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '6px' }} />
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#222' }}>{previewData.rawTitle}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#009955', fontWeight: 600 }}>✅ Đã sẵn sàng xào nấu chống bản quyền!</p>
            </div>
          </div>
        )}

        {/* Cấu hình AI lách bản quyền */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#fcfcfc', borderRadius: '8px', border: '1px solid #eaeaea' }}>
          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚙️</span> Cấu hình AI Lách Thuật Toán Bản Quyền:
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={flipVideo}
                onChange={(e) => setFlipVideo(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Lật gương video (Horizontal Flip)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={speedUp}
                onChange={(e) => setSpeedUp(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Tăng tốc độ video nhẹ (1.04x)
            </label>
          </div>
        </div>

        {/* Trạng thái xử lý */}
        {isProcessing && processStatus && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#e6f4ea', color: '#137333', borderRadius: '8px', textAlign: 'center', fontWeight: 500, fontSize: '14px' }}>
            ⏳ {processStatus}
          </div>
        )}

        {/* Nút thực thi chính */}
        <button
          onClick={handleProcessReup}
          disabled={isProcessing || !previewData}
          style={{
            width: '100%',
            backgroundColor: previewData ? '#00b074' : '#ccc',
            color: '#fff',
            border: 'none',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: previewData && !isProcessing ? 'pointer' : 'not-allowed',
            boxShadow: previewData ? '0 4px 12px rgba(0, 176, 116, 0.25)' : 'none',
            transition: 'background 0.2s',
          }}
        >
          {isProcessing ? '⏳ Đang xử lý Reup Video...' : '🚀 Bắt Đầu Reup & Lách Bản Quyền (Tốn 5 Credits)'}
        </button>

      </div>
    </div>
  );
}