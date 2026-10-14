// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = import.meta.env.VITE_CREATOMATE_API_KEY || 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a';

  try {
    console.log('🛡️ Đang khởi tạo Render giữ nguyên độ phân giải gốc...');

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        source: {
          output_format: 'mp4',
          // 💡 QUAN TRỌNG: Đã bỏ width/height cố định để tự động lấy đúng độ phân giải gốc của video (giữ nguyên độ nét)
          frame_rate: 30,
          elements: [
            // Lớp 1: Nền mờ nghệ thuật phía sau
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'cover',
              blur_radius: 40,
              brightness: '60%',
              volume: '0%',
            },
            // Lớp 2: Video chính phía trước (Độ nét căng 100%, lật gương + tăng tốc + zoom cắt viền)
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'cover',       // Khớp tràn viền hoàn hảo, không bị bóp méo hay vỡ hình
              scale: '104%',      // Zoom nhẹ 4% cắt sạch logo góc
              speed: '104%',      // Tăng tốc nhẹ 1.04x lách bản quyền âm thanh
              x_scale: '-100%',   // Lật gương hoàn toàn (Flip Horizontal)
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('⚠️ API Creatomate phản hồi lỗi, dùng video gốc dự phòng:', data);
      return videoUrl;
    }

    const renderId = Array.isArray(data) ? data[0]?.id : data?.id;
    if (!renderId) return videoUrl;

    return await pollRenderStatus(renderId, apiKey, videoUrl);

  } catch (error) {
    console.error('❌ Lỗi kết nối xào nấu video:', error);
    return videoUrl;
  }
}

// Hàm chờ render hoàn tất (Polling)
async function pollRenderStatus(renderId: string, apiKey: string, fallbackUrl: string): Promise<string> {
  const maxAttempts = 25;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;

    try {
      const res = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      const render = await res.json();
      console.log(`⌛ [Lần ${attempts}/${maxAttempts}] Trạng thái Render: ${render.status}`);

      if (render.status === 'succeeded' && render.url) {
        console.log('🎉 XÀO NẤU THÀNH CÔNG! Link video nét căng:', render.url);
        return render.url;
      }
      if (render.status === 'failed') {
        return fallbackUrl;
      }
    } catch (err) {
      console.error(err);
    }
  }

  return fallbackUrl;
}