// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  // 🔑 Thay đoạn này bằng API Key thật của bạn:
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc';

  try {
    console.log('🛡️ Đang khởi tạo Render Kỹ thuật số 1 (Dynamic Zoom + Nền mờ Full HD)...');

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        source: {
          output_format: 'mp4',
          width: 1080,
          height: 1920,
          frame_rate: 30,
          crf: 18, // Ép nét căng chuẩn HD
          elements: [
            // ==========================================
            // LỚP 1: NỀN MỜ NGHỆ THUẬT PHÍA SAU
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'cover',
              blur_radius: 50,
              brightness: '50%',
              volume: '0%',
            },

            // ==========================================
            // LỚP 2: VIDEO CHÍNH (Áp dụng Kỹ thuật số 1)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',
              speed: '104%',      // Lách âm thanh
              x_scale: '-100%',   // Lật gương hình ảnh
              
              // 💡 KỸ THUẬT 1: HIỆU ỨNG PHÓNG TO ĐỘNG (DYNAMIC ZOOM)
              // Video sẽ tự động zoom lớn dần đều từ 100% lên 112% xuyên suốt thời lượng video
              animations: [
                {
                  type: 'scale',
                  easing: 'linear',
                  start_scale: '100%',
                  end_scale: '112%',
                  duration: '100%', // Trải đều từ đầu đến cuối video
                  fade: false
                }
              ]
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Lỗi Creatomate API:', data);
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
  const maxAttempts = 30;
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
        console.log('🎉 XÀO NẤU THÀNH CÔNG VỚI DYNAMIC ZOOM:', render.url);
        return render.url;
      }
      if (render.status === 'failed') {
        console.error('❌ Render thất bại:', render.error_message);
        return fallbackUrl;
      }
    } catch (err) {
      console.error('Lỗi check render status:', err);
    }
  }

  return fallbackUrl;
}