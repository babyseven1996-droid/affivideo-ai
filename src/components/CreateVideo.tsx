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
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link'); // Chế độ nhập
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Checkbox lách bản quyền
  const [autoFlip, setAutoFlip] = useState(true);
  const [changeSpeed, setChangeSpeed] = useState(true);

  // Dữ liệu video
  const [previewData, setPreviewData] = useState<{
    playUrl: string;
    cover: string;
    rawTitle: string;
    fileSize?: string;
  } | null>(null);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
    else if (showToast) showToast(msg);
    else console.log(msg);
  };

  const cleanAndExtractUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    let cleaned = rawUrl.trim();
    const match = cleaned.match(/https?:\/\/[^\s]+/g);
    if (match && match.length > 0) {
      return match[0].replace(/[)}\],，。！？;]+$/, '');
    }
    return cleaned;
  };

  // 1. Phân tích Link TikTok
  const handleAnalyzeSourceVideo = async () => {
    const targetUrl = cleanAndExtractUrl(sourceUrl);
    if (!targetUrl) {
      notify('Vui lòng dán liên kết TikTok hợp lệ!');
      return;
    }

    if (targetUrl.includes('douyin.com')) {
      notify('⚠️ Douyin đang khóa API tự động. Bạn chuyển sang tab "Tải File MP4" để xào nấu nhé!');
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
        if (!videoTitle) setVideoTitle(videoData.rawTitle);
        notify('🎉 Lấy video TikTok gốc thành công!');
      } else {
        notify('❌ Không thể lấy dữ liệu video từ link này.');
      }
    } catch (error) {
      console.error('Lỗi phân tích video:', error);
      notify('❌ Lỗi kết nối khi lấy video.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // 2. Upload file MP4 / Douyin lên Supabase Storage
  const processSelectedFile = async (file: File) => {
    if (!file) return;

    if (!file.type.includes('video')) {
      notify('⚠️ Vui lòng chọn file định dạng Video (MP4, MOV, WebM)!');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      notify('⚠️ Kích thước file quá lớn (Tối đa 100MB)!');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('📤 Đang tải video từ máy lên hệ thống...');

    try {
      const fileName = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const { error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.error('Lỗi upload:', error);
        notify(`❌ Lỗi upload file: ${error.message}`);
        setIsProcessing(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      const fileTitle = file.name.replace(/\.[^/.]+$/, "");
      const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      setPreviewData({
        playUrl: publicUrl,
        cover: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300',
        rawTitle: fileTitle,
        fileSize: formattedSize,
      });

      if (!videoTitle) setVideoTitle(fileTitle);
      notify('🎉 Upload file thành công! Sẵn sàng xào nấu.');
    } catch (err) {
      console.error('Lỗi upload:', err);
      notify('❌ Tải file lên thất bại.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // 3. Thực thi Xào nấu & Lách bản quyền
  const handleProcessReupVideo = async () => {
    if (!previewData || !previewData.playUrl) {
      notify('Vui lòng chọn video trước khi xào nấu!');
      return;
    }

    const cost = 5;
    if (credits < cost) {
      notify('⚠️ Bạn không đủ Credits!');
      return;
    }

    setIsProcessing(true);

    try {
      setProcessStatus('✂️ Đang áp dụng thuật toán xào nấu Ultra HD qua Creatomate...');
      
      const safeVideoUrl = await renderAntiCopyrightVideo(previewData.playUrl, {
        flip: autoFlip,
        speed: changeSpeed,
      });

      setProcessStatus('🚀 Đang lưu video hoàn chỉnh vào Kho video...');

      const currentUserId = user?.id || (await supabase.auth.getUser()).data.user?.id;

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
        notify(`❌ Lỗi lưu kho: ${error.message}`);
        setIsProcessing(false);
        return;
      }

      if (onSpendCredits) onSpendCredits(cost);
      if (fetchSupabaseVideos) fetchSupabaseVideos();

      notify('🎉 Đã xào nấu và lưu video thành công vào kho!');
      
      setSourceUrl('');
      setVideoTitle('');
      setPreviewData(null);
    } catch (err) {
      console.error('Lỗi Reup:', err);
      notify('❌ Quá trình xử lý video thất bại.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: '#e6f7f0', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <span style={{ fontSize: '24px' }}>✨</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>Reup Video AI Tự Động</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Tự động bóc tách và xào nấu lách bản quyền Meta & TikTok Content ID</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '10px', margin: '24px 0' }}>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              background: activeTab === 'link' ? '#fff' : 'transparent',
              color: activeTab === 'link' ? '#00b074' : '#6b7280',
              boxShadow: activeTab === 'link' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🔗 Dán Link TikTok
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              background: activeTab === 'upload' ? '#fff' : 'transparent',
              color: activeTab === 'upload' ? '#00b074' : '#6b7280',
              boxShadow: activeTab === 'upload' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            📁 Tải File MP4 / Douyin
          </button>
        </div>

        {/* TAB 1: Dán Link */}
        {activeTab === 'link' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '14px' }}>
              Liên kết video TikTok gốc:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="Dán link chia sẻ (VD: https://vt.tiktok.com/...)"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAnalyzeSourceVideo}
                disabled={isProcessing}
                style={{
                  backgroundColor: '#00b074',
                  color: '#fff',
                  border: 'none',
                  padding: '0 24px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                }}
              >
                Lấy Video
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Upload File Drag & Drop Zone */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              marginBottom: '20px',
              border: `2px dashed ${isDragging ? '#00b074' : '#cbd5e1'}`,
              background: isDragging ? '#f0fdf4' : '#fafafa',
              borderRadius: '14px',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              id="fileInput"
              accept="video/mp4,video/mov,video/webm"
              onChange={handleFileUpload}
              disabled={isProcessing}
              style={{ display: 'none' }}
            />
            <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ width: '56px', height: '56px', background: '#e6f7f0', color: '#00b074', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '26px' }}>
                ☁️
              </div>
              <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                Kéo & thả file video vào đây, hoặc <span style={{ color: '#00b074', textDecoration: 'underline' }}>bấm để chọn</span>
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                Hỗ trợ MP4, MOV, WebM (Tối đa 100MB) • Dành cho video Douyin đã tải về
              </p>
            </label>
          </div>
        )}

        {/* Xem trước video chọn */}
        {previewData && (
          <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img src={previewData.cover} alt="Cover" style={{ width: '64px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{previewData.rawTitle}</h4>
              {previewData.fileSize && <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#475569', fontWeight: 500 }}>{previewData.fileSize}</span>}
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#00b074', fontWeight: 600 }}>✅ Sẵn sàng xào nấu Ultra HD!</p>
            </div>
            <button onClick={() => setPreviewData(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Xóa</button>
          </div>
        )}

        {/* Tiêu đề video */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '14px' }}>
            Tên / Tiêu đề quản lý:
          </label>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Nhập tiêu đề quản lý video..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Cấu hình Lách bản quyền */}
        <div style={{ marginBottom: '24px', padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#1e293b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> Cấu hình AI Lách Bản Quyền Meta & TikTok:
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
              <input
                type="checkbox"
                checked={autoFlip}
                onChange={(e) => setAutoFlip(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#00b074' }}
              />
              Lật gương video (Horizontal Flip)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
              <input
                type="checkbox"
                checked={changeSpeed}
                onChange={(e) => setChangeSpeed(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#00b074' }}
              />
              Tăng tốc độ video nhẹ (1.04x)
            </label>
          </div>
        </div>

        {/* Trạng thái xử lý */}
        {isProcessing && processStatus && (
          <div style={{ marginBottom: '20px', padding: '14px', background: '#ecfdf5', color: '#047857', borderRadius: '10px', textAlign: 'center', fontWeight: 500, fontSize: '14px', border: '1px solid #a7f3d0' }}>
            ⏳ {processStatus}
          </div>
        )}

        {/* Nút hành động chính */}
        <button
          onClick={handleProcessReupVideo}
          disabled={isProcessing || !previewData}
          style={{
            width: '100%',
            backgroundColor: previewData ? '#00b074' : '#9ca3af',
            color: '#fff',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: previewData && !isProcessing ? 'pointer' : 'not-allowed',
            boxShadow: previewData ? '0 6px 20px rgba(0, 176, 116, 0.25)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {isProcessing ? '⏳ Đang xử lý Reup Video...' : '🚀 Bắt Đầu Reup & Lách Bản Quyền (Tốn 5 Credits)'}
        </button>

      </div>
    </div>
  );
}