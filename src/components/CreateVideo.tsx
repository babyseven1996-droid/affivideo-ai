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
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // 💡 Cấu hình Nâng cao: Tắt tiếng gốc, thêm Nhạc, Voice & Text chú dẫn
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(true);
  const [customCaption, setCustomCaption] = useState('');
  const [bgMusicUrl, setBgMusicUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [enableFlip, setEnableFlip] = useState(true);
  const [enableSpeed, setEnableSpeed] = useState(true);

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
    else if (onToast) onToast(msg);
    else alert(msg);
  };

  // Upload file an toàn bằng Fetch API qua ArrayBuffer
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
    setProcessStatus('📤 Đang tải video lên hệ thống...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileExt = file.name.split('.').pop() || 'mp4';
      const cleanFileName = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `uploads/${cleanFileName}`;

      const supabaseUrl = (supabase as any).supabaseUrl;
      const supabaseKey = (supabase as any).supabaseKey;
      const uploadEndpoint = `${supabaseUrl}/storage/v1/object/videos/${filePath}`;

      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': file.type || 'video/mp4',
          'x-upsert': 'true',
        },
        body: arrayBuffer,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || `Lỗi Upload HTTP ${res.status}`);
      }

      const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const rawCleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[^\w\s\u00C0-\u1EF9]/gi, ' ');
      const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      setPreviewData({
        playUrl: publicUrl,
        cover: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300',
        rawTitle: rawCleanTitle || 'Video Douyin Reup',
        fileSize: formattedSize,
      });

      if (!videoTitle) setVideoTitle(rawCleanTitle || 'Video Douyin Reup');
      notify('🎉 Upload file thành công! Sẵn sàng xào nấu.');
    } catch (err: any) {
      console.error('Lỗi upload:', err);
      notify(`❌ Tải file lên thất bại: ${err.message || 'Lỗi kết nối'}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // 🚀 Xử lý bấm nút Reup Video với đầy đủ tùy chọn
  const handleProcessReupVideo = async () => {
    const targetVideoUrl = previewData?.playUrl || sourceUrl;
    if (!targetVideoUrl) {
      notify('⚠️ Vui lòng dán link hoặc chọn file video trước!');
      return;
    }

    if (credits < 5) {
      notify('⚠️ Bạn không đủ credits (Cần ít nhất 5 Credits)!');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('🎬 Đang gửi yêu cầu xào nấu & lách bản quyền Ultra HD...');

    try {
      // 💡 Truyền cấu hình nâng cao sang dịch vụ Creatomate
      const renderOptions = {
        videoUrl: targetVideoUrl,
        muteOriginalAudio: muteOriginalAudio, // 👈 Tắt tiếng gốc
        bgMusicUrl: bgMusicUrl.trim(),         // 👈 Link nhạc nền
        voiceUrl: voiceUrl.trim(),             // 👈 Link giọng đọc TTS
        customCaption: customCaption.trim() || videoTitle, // 👈 Chú dẫn text
        enableFlip: enableFlip,
        speed: enableSpeed ? 1.04 : 1.0,
      };

      const renderResult = await renderAntiCopyrightVideo(renderOptions);
      const finalVideoUrl = renderResult.url || renderResult.video_url || targetVideoUrl;

      // Lưu thông tin video vào Supabase
      if (user?.id) {
        await supabase.from('videos').insert([
          {
            user_id: user.id,
            title: videoTitle || 'Video Reup AI',
            status: 'completed',
            video_url: finalVideoUrl,
            image_url: previewData?.cover || '',
          },
        ]);
      }

      if (onSpendCredits) onSpendCredits(5);
      if (fetchSupabaseVideos) fetchSupabaseVideos();

      notify('🎉 Reup & Lách bản quyền thành công! Hãy vào Kho video để kiểm tra.');
    } catch (err: any) {
      console.error(err);
      notify(`❌ Lỗi xử lý: ${err.message || 'Không thể render video'}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Tab chuyển đổi nguồn */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('link')}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
            background: activeTab === 'link' ? '#e6f4ea' : '#fff', cursor: 'pointer', fontWeight: 600
          }}
        >
          🔗 Dán Link TikTok
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
            background: activeTab === 'upload' ? '#e6f4ea' : '#fff', cursor: 'pointer', fontWeight: 600
          }}
        >
          📁 Tải File MP4 / Douyin
        </button>
      </div>

      {/* Khu vực Upload / Dán Link */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) processSelectedFile(e.dataTransfer.files[0]);
          }}
          style={{
            border: `2px dashed ${isDragging ? '#00b074' : '#ccc'}`,
            borderRadius: '12px', padding: '40px', textAlign: 'center', background: '#fafafa', marginBottom: '20px'
          }}
        >
          <input
            type="file" accept="video/*" id="video-file-input" style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && processSelectedFile(e.target.files[0])}
          />
          <label htmlFor="video-file-input" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Kéo & thả file video vào đây, hoặc <span style={{ color: '#00b074' }}>bấm để chọn</span></div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Hỗ trợ MP4, MOV, WebM (Tối đa 100MB)</div>
          </label>
        </div>
      ) : (
        <input
          type="text" placeholder="Dán link TikTok / Douyin tại đây..." value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '20px' }}
        />
      )}

      {/* Hiển thị Xem trước File */}
      {previewData && (
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🎬</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{previewData.rawTitle}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{previewData.fileSize} • Sẵn sàng xào nấu Ultra HD!</div>
          </div>
          <button onClick={() => setPreviewData(null)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Xóa</button>
        </div>
      )}

      {/* Tên Quản lý Video */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Tên / Tiêu đề quản lý:</label>
        <input
          type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="Nhập tiêu đề quản lý video..."
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      {/* 🌟 CẤU HÌNH AI & ÂM THANH NÂNG CAO 🌟 */}
      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', border: '1px solid #e9ecef', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#00b074' }}>⚡ Cấu hình AI Xào Nấu & Âm Thanh Nâng Cao:</h4>

        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Tùy chọn Tắt Tiếng Gốc */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <input type="checkbox" checked={muteOriginalAudio} onChange={(e) => setMuteOriginalAudio(e.target.checked)} />
            🔇 Cắt / Tắt hoàn toàn âm thanh gốc của video
          </label>

          {/* Lật gương & Tăng tốc */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={enableFlip} onChange={(e) => setEnableFlip(e.target.checked)} />
              🪞 Lật gương (Horizontal Flip)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={enableSpeed} onChange={(e) => setEnableSpeed(e.target.checked)} />
              ⚡ Tăng tốc nhẹ (1.04x)
            </label>
          </div>

          {/* Nhập Chú Dẫn Text Mới */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginTop: '8px', marginBottom: '4px' }}>📝 Thêm Chú Dẫn / Subtitle Text Mới:</label>
            <input
              type="text" value={customCaption} onChange={(e) => setCustomCaption(e.target.value)}
              placeholder="VD: Dòng chú dẫn nổi bật đè lên video..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          {/* Link Nhạc Nền MP3 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginTop: '4px', marginBottom: '4px' }}>🎵 Link Nhạc Nền MP3 (Tùy chọn):</label>
            <input
              type="text" value={bgMusicUrl} onChange={(e) => setBgMusicUrl(e.target.value)}
              placeholder="Dán link file .mp3 nhạc nền..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          {/* Link Giọng Đọc Voice AI */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginTop: '4px', marginBottom: '4px' }}>🗣️ Link Giọng Đọc Voice AI (Tùy chọn):</label>
            <input
              type="text" value={voiceUrl} onChange={(e) => setVoiceUrl(e.target.value)}
              placeholder="Dán link file voice TTS (.mp3 / .wav)..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>
      </div>

      {/* Trạng thái xử lý */}
      {isProcessing && (
        <div style={{ marginBottom: '20px', padding: '14px', background: '#ecfdf5', color: '#047857', borderRadius: '8px' }}>
          ⏳ {processStatus}
        </div>
      )}

      {/* Nút Thực thi */}
      <button
        onClick={handleProcessReupVideo}
        disabled={isProcessing}
        style={{
          width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
          backgroundColor: isProcessing ? '#9ca3af' : '#00b074', color: '#fff',
          fontSize: '16px', fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer'
        }}
      >
        {isProcessing ? '⏳ Đang xử lý Reup Video...' : '🚀 Bắt Đầu Reup & Lách Bản Quyền (Tốn 5 Credits)'}
      </button>
    </div>
  );
}