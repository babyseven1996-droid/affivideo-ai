// src/services/creatomate.ts

export interface RenderOptions {
  videoUrl: string;
  muteOriginalAudio?: boolean;
  bgMusicUrl?: string;
  voiceUrl?: string;
  customCaption?: string;
  enableFlip?: boolean;
  speed?: number;
}

export async function renderAntiCopyrightVideo(options: RenderOptions) {
  // Đọc API Key từ môi trường Vite hoặc môi trường React App
  const CREATOMATE_API_KEY =
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_CREATOMATE_API_KEY) ||
    'YOUR_CREATOMATE_API_KEY';
  const speedVal = options.speed ?? 1.04;
  const isFlip = options.enableFlip ?? true;
  const isMute = options.muteOriginalAudio ?? true;

  // 1. Cấu hình lớp Video Gốc
  const elements: any[] = [
    {
      type: 'video',
      source: options.videoUrl,
      volume: isMute ? 0 : 100, // 0 = Tắt sạch âm thanh gốc
      speed: speedVal,
      horizontal_flip: isFlip,
      fit: 'cover',
    },
  ];

  // 2. Thêm Nhạc Nền MP3 (âm lượng vừa phải 18%)
  if (options.bgMusicUrl && options.bgMusicUrl.trim() !== '') {
    elements.push({
      type: 'audio',
      source: options.bgMusicUrl.trim(),
      volume: 18,
    });
  }

  // 3. Thêm Giọng Đọc Voice AI (âm lượng 100%)
  if (options.voiceUrl && options.voiceUrl.trim() !== '') {
    elements.push({
      type: 'audio',
      source: options.voiceUrl.trim(),
      volume: 100,
    });
  }

  // 4. Thêm Subtitle / Chú Dẫn Text Tự Viết
  if (options.customCaption && options.customCaption.trim() !== '') {
    elements.push({
      type: 'text',
      text: options.customCaption.trim(),
      font_family: 'Roboto',
      font_weight: '700',
      font_size: 42,
      fill_color: '#ffffff',
      background_color: 'rgba(0, 0, 0, 0.7)',
      background_padding: 20,
      background_border_radius: 10,
      y: '82%',
      width: '90%',
    });
  }

  const response = await fetch('https://api.creatomate.com/v1/renders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CREATOMATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      output: {
        format: 'mp4',
        resolution: '1080p',
        fps: 30,
      },
      elements: elements,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Lỗi Render Creatomate HTTP ${response.status}`);
  }

  const resultData = await response.json();
  
  // Creatomate trả về danh sách render dạng mảng
  if (Array.isArray(resultData) && resultData.length > 0) {
    return resultData[0];
  }

  return resultData;
}