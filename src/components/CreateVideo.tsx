// src/components/CreateVideo.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { renderAntiCopyrightVideo } from '../services/creatomate';

interface CreateVideoProps {
  user: any;
  credits: number;
  onToast?: (msg: string) => void;
  showToast?: (msg: string) => void;
  fetchSupabaseVideos?: () => void;
  onSpendCredits?: (amount: number) => void;
}

export default function CreateVideo({
  user,
  credits,
  onToast,
  showToast,
  fetchSupabaseVideos,
  onSpendCredits,
}: CreateVideoProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  
  // Checkbox lách bản quyền
  const [autoFlip, setAutoFlip] = useState(true);
  const [changeSpeed, setChangeSpeed] = useState(true);

  const [previewData, setPreviewData] = useState<{
    playUrl: string;
    cover: string;
    rawTitle: string;
  } | null>(null);

  // Hàm thông báo an toàn (hỗ trợ cả onToast và showToast)
  const notify = (msg: string) => {
    if (onToast) onToast(msg);
    else if (showToast) showToast(msg);
    else console.log(msg);
  };

  // Hàm làm sạch link
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

  // Bước 1: Lấy video thật từ TikTok qua API
  const handleAnalyzeSourceVideo = async () => {
    const targetUrl = cleanAndExtractUrl(sourceUrl);
    if (!targetUrl) {
      notify('Vui lòng dán liên kết (URL) video hợp lệ!');
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
        notify('🎉 Lấy video gốc thành công!');
      } else {
        notify('❌ Không thể lấy dữ liệu video từ link này.');
      }
    } catch (error) {
      console.error('Lỗi phân tích video:', error);
      notify('❌ Đã xảy ra lỗi kết nối khi lấy video.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Bước 2: Xào nấu qua Creatomate & Lưu trực tiếp vào Supabase
  const handleProcessReupVideo = async () => {
    if (!previewData || !previewData.playUrl) {
      notify('Vui lòng bấm nút "Lấy Video Thật" trước khi Reup!');
      return;
    }

    const cost = 5;
    if (credits < cost) {
      notify('⚠️ Bạn không đủ Credits để thực hiện!');
      return;
    }

    setIsProcessing(true);

    try {
      setProcessStatus('✂️ Đang áp dụng thuật toán xào nấu Ultra HD qua Creatomate...');
      
      // Gọi hàm xào nấu kèm theo trạng thái checkbox
      const safeVideoUrl = await renderAntiCopyrightVideo(previewData.playUrl, {
        flip: autoFlip,
        speed: changeSpeed,
      });

      setProcessStatus('🚀 Đang lưu video hoàn chỉnh vào Kho video (Supabase)...');

      // Lấy id người dùng chuẩn xác (hoặc lấy từ session nếu user prop trống)
      const currentUserId = user?.id || (await supabase.auth.getUser()).data.user?.id;

      // Lưu vĩnh viễn vào bảng 'videos' trên Supabase
      const { error } = await supabase
        .from('videos')
        .insert([{
          user_id: currentUserId || null,
          title: videoTitle || previewData.rawTitle,
          video_url: safeVideoUrl,
          image_url: previewData.cover,
          status: 'completed',
        }]);

      if (error) {
        console.error('Lỗi Supabase:', error.message);
        notify(`❌ Lỗi lưu kho Supabase: ${error.message}`);
        setIsProcessing(false);
        return;
      }

      // Trừ credits & làm mới kho video nếu có hàm truyền vào
      if (onSpendCredits) onSpendCredits(cost);
      if (fetchSupabaseVideos) fetchSupabaseVideos();

      notify('🎉 Đã xào nấu và lưu video thành công vào kho!');
      
      // Reset form
      setSourceUrl('');
      setVideoTitle('');
      setPreviewData(null);
    } catch (err) {
      console.error('Lỗi xử lý Reup:', err);
      notify('❌ Quá trình xử lý video thất bại.');
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
              }}
            >
              Lấy Video Thật
            </button>
          </div>
        </div>

        {/* Tiêu đề video */}
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

        {/* Preview video */}
        {previewData && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img src={previewData.cover} alt="Cover" style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '6px' }} />
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#222' }}>{previewData.rawTitle}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#009955', fontWeight: 600 }}>✅ Đã sẵn sàng xào nấu Ultra HD!</p>
            </div>
          </div>
        )}

        {/* Cấu hình lách bản quyền */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#fcfcfc', borderRadius: '8px', border: '1px solid #eaeaea' }}>
          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚙️</span> Cấu hình AI Lách Thuật Toán Bản Quyền:
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={autoFlip}
                onChange={(e) => setAutoFlip(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Lật gương video (Horizontal Flip)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={changeSpeed}
                onChange={(e) => setChangeSpeed(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Tăng tốc độ video nhẹ (1.04x)
            </label>
          </div>
        </div>

        {/* Trạng thái */}
        {isProcessing && processStatus && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#e6f4ea', color: '#137333', borderRadius: '8px', textAlign: 'center', fontWeight: 500, fontSize: '14px' }}>
            ⏳ {processStatus}
          </div>
        )}

        {/* Nút thực thi */}
        <button
          onClick={handleProcessReupVideo}
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
          }}
        >
          {isProcessing ? '⏳ Đang xử lý Reup Video...' : '🚀 Bắt Đầu Reup & Lách Bản Quyền (Tốn 5 Credits)'}
        </button>

      </div>
    </div>
  );
}