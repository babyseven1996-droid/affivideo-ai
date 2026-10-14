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

  // Cấu hình Nâng cao
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(true);
  const [customCaption, setCustomCaption] = useState('');
  const [bgMusicUrl, setBgMusicUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [enableFlip, setEnableFlip] = useState(true);
  const [enableSpeed, setEnableSpeed] = useState(true);

  // Trạng thái tên file hiển thị khi upload nhạc/voice
  const [musicFileName, setMusicFileName] = useState('');
  const [voiceFileName, setVoiceFileName] = useState('');

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
    else if (onToast) onToast(msg);
    else alert(msg);
  };

  // 📤 Hàm upload file chung (Video, Nhạc MP3, Voice MP3) lên Supabase Storage
  const uploadFileToSupabase = async (file: File, folder: string, typeName: string) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileExt = file.name.split('.').pop() || 'mp4';
      const cleanFileName = `${typeName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${folder}/${cleanFileName}`;

      const supabaseUrl = (supabase as any).supabaseUrl;
      const supabaseKey = (supabase as any).supabaseKey;
      const uploadEndpoint = `${supabaseUrl}/storage/v1/object/videos/${filePath}`;

      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: arrayBuffer,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || `Lỗi Upload HTTP ${res.status}`);
      }

      const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } catch (err: any) {
      throw new Error(err.message || 'Lỗi tải file lên hệ thống');
    }
  };

  // Xử lý chọn file Video chính
  const processSelectedFile = async (file: File) => {
    if (!file) return;
    if (!file.type.includes('video')) {
      notify('⚠️ Vui lòng chọn file định dạng Video (MP4, MOV, WebM)!');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('📤 Đang tải video lên hệ thống...');

    try {
      const publicUrl = await uploadFileToSupabase(file, 'uploads', 'vid');
      const rawCleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[^\w\s\u00C0-\u1EF9]/gi, ' ');
      const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      setPreviewData({
        playUrl: publicUrl,
        cover: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300',
        rawTitle: rawCleanTitle || 'Video Douyin Reup',
        fileSize: formattedSize,
      });

      if (!videoTitle) setVideoTitle(rawCleanTitle || 'Video Douyin Reup');
      notify('🎉 Upload file video thành công!');
    } catch (err: any) {
      notify(`❌ Tải file lên thất bại: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // 🚀 Xử lý bấm nút Reup Video
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
      const renderOptions = {
        videoUrl: targetVideoUrl,
        muteOriginalAudio: muteOriginalAudio,
        bgMusicUrl: bgMusicUrl.trim() !== '' ? bgMusicUrl.trim() : undefined,
        voiceUrl: voiceUrl.trim() !== '' ? voiceUrl.trim() : undefined,
        customCaption: customCaption.trim() !== '' ? customCaption.trim() : undefined,
        enableFlip: enableFlip,
        speed: enableSpeed ? 1.04 : 1.0,
      };

      const renderResult = await renderAntiCopyrightVideo(renderOptions);
      const rawUrl = renderResult.url || renderResult.video_url || renderResult.output?.url;
const finalVideoUrl = (rawUrl && !rawUrl.endsWith('.jpg') && !rawUrl.endsWith('.png')) 
  ? rawUrl 
  : targetVideoUrl;

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

        <div style={{ display: 'grid', gap: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <input type="checkbox" checked={muteOriginalAudio} onChange={(e) => setMuteOriginalAudio(e.target.checked)} />
            🔇 Cắt / Tắt hoàn toàn âm thanh gốc của video
          </label>

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

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>📝 Thêm Chú Dẫn / Subtitle Text Mới:</label>
            <input
              type="text" value={customCaption} onChange={(e) => setCustomCaption(e.target.value)}
              placeholder="VD: Dòng chú dẫn nổi bật đè lên video..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          {/* 🎵 UPLOAD NHẠC NỀN MP3 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>🎵 Nhạc Nền MP3 (Tải file lên):</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="file" accept="audio/*" id="music-file-input" style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      setMusicFileName('⏳ Đang tải nhạc...');
                      const url = await uploadFileToSupabase(file, 'audio', 'mus');
                      setBgMusicUrl(url);
                      setMusicFileName(`✅ ${file.name}`);
                      notify('🎵 Đã tải nhạc nền thành công!');
                    } catch (err: any) {
                      setMusicFileName('❌ Lỗi tải nhạc');
                      notify(`Lỗi tải nhạc: ${err.message}`);
                    }
                  }
                }}
              />
              <label htmlFor="music-file-input" style={{ padding: '8px 14px', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                📁 Chọn file MP3
              </label>
              <span style={{ fontSize: '13px', color: musicFileName ? '#00b074' : '#666' }}>
                {musicFileName || (bgMusicUrl ? 'Đã có nhạc nền' : 'Chưa chọn file nhạc')}
              </span>
            </div>
          </div>

          {/* 🗣️ UPLOAD GIỌNG ĐỌC VOICE AI */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>🗣️ Giọng Đọc Voice AI / TTS (Tải file lên):</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="file" accept="audio/*" id="voice-file-input" style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      setVoiceFileName('⏳ Đang tải voice...');
                      const url = await uploadFileToSupabase(file, 'audio', 'voice');
                      setVoiceUrl(url);
                      setVoiceFileName(`✅ ${file.name}`);
                      notify('🗣️ Đã tải giọng đọc thành công!');
                    } catch (err: any) {
                      setVoiceFileName('❌ Lỗi tải voice');
                      notify(`Lỗi tải voice: ${err.message}`);
                    }
                  }
                }}
              />
              <label htmlFor="voice-file-input" style={{ padding: '8px 14px', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                📁 Chọn file Voice MP3/WAV
              </label>
              <span style={{ fontSize: '13px', color: voiceFileName ? '#00b074' : '#666' }}>
                {voiceFileName || (voiceUrl ? 'Đã có giọng đọc' : 'Chưa chọn file voice')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div style={{ marginBottom: '20px', padding: '14px', background: '#ecfdf5', color: '#047857', borderRadius: '8px' }}>
          ⏳ {processStatus}
        </div>
      )}

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