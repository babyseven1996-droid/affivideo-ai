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
  const CREATOMATE_API_KEY =
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_CREATOMATE_API_KEY) ||
    'YOUR_CREATOMATE_API_KEY';

  const speedVal = options.speed ?? 1.04;
  const isFlip = options.enableFlip ?? true;
  const isMute = options.muteOriginalAudio ?? true;

  // 1. Cấu hình mảng các lớp video gốc
  const elements: any[] = [
    {
      type: 'video',
      source: options.videoUrl,
      volume: isMute ? '0%' : '100%', // Tắt tiếng hoặc giữ nguyên tiếng gốc
      speed: speedVal,
      horizontal_flip: isFlip,
      fit: 'cover',
    },
  ];

  // 2. Thêm Nhạc Nền MP3 (nếu người dùng đã upload)
  if (options.bgMusicUrl && options.bgMusicUrl.trim() !== '') {
    elements.push({
      type: 'audio',
      source: options.bgMusicUrl.trim(),
      volume: '18%', // Âm lượng nhạc nền 18% vừa phải
    });
  }

  // 3. Thêm Giọng Đọc Voice AI / TTS (nếu người dùng đã upload)
  if (options.voiceUrl && options.voiceUrl.trim() !== '') {
    elements.push({
      type: 'audio',
      source: options.voiceUrl.trim(),
      volume: '100%', // Âm lượng voice rõ nét 100%
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
      // 💡 Đưa elements vào trong cấu trúc source composition chuẩn của Creatomate
      source: {
        type: 'composition',
        elements: elements,
      },
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Lỗi Render Creatomate HTTP ${response.status}`);
  }

  const resultData = await response.json();
  
  if (Array.isArray(resultData) && resultData.length > 0) {
    return resultData[0];
  }

  return resultData;
}