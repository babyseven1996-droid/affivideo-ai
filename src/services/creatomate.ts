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

  const elements: any[] = [
    {
      type: 'video',
      source: options.videoUrl,
      volume: isMute ? '0%' : '100%',
      speed: speedVal,
      horizontal_flip: isFlip,
      fit: 'cover',
    },
  ];

  if (options.bgMusicUrl && options.bgMusicUrl.trim() !== '') {
    elements.push({
      type: 'audio',
      source: options.bgMusicUrl.trim(),
      volume: '18%',
    });
  }

  if (options.voiceUrl && options.voiceUrl.trim() !== '') {
    elements.push({
      type: 'audio',
      source: options.voiceUrl.trim(),
      volume: '100%',
    });
  }

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

  // 1. Gửi request khởi tạo quá trình render
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

  let renderData = await response.json();
  let renderObj = Array.isArray(renderData) ? renderData[0] : renderData;
  const renderId = renderObj?.id;

  if (!renderId) {
    return renderObj;
  }

  // 2. Tự động kiểm tra trạng thái liên tục (Polling) mỗi 3 giây cho đến khi render xong
  let attempts = 0;
  while (attempts < 60) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    attempts++;

    const statusRes = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
      headers: {
        'Authorization': `Bearer ${CREATOMATE_API_KEY}`,
      },
    });

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      renderObj = Array.isArray(statusData) ? statusData[0] : statusData;

      if (renderObj.status === 'completed') {
        return renderObj; // Trả về object chứa URL hoàn chỉnh 100%
      }
      if (renderObj.status === 'failed') {
        throw new Error('Quá trình render video trên Creatomate bị lỗi.');
      }
    }
  }

  throw new Error('Quá trình render video quá thời gian chờ (Timeout).');
}