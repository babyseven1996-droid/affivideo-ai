// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  // 🔑 Hãy đảm bảo dán đúng Secret API Key thật của bạn vào đây:
  const apiKey = import.meta.env.VITE_CREATOMATE_API_KEY || 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc';

  try {
    console.log('🛡️ Đang khởi tạo Render Chuẩn HD (Nền mờ + Video chính nét 100%)...');

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        source: {
          output_format: 'mp4',
          // Ép chuẩn khung hình Full HD 1080x1920
          width: 1080,
          height: 1920,
          frame_rate: 30,
          // 💡 QUAN TRỌNG: Thiết lập chất lượng render tối đa (CRF 18 = Siêu nét, ít nén)
          crf: 18, 
          elements: [
            // ==========================================
            // LỚP 1: NỀN MỜ PHÍA SAU (Background Blur)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'cover',
              blur_radius: 50,      // Mờ mịn nền
              brightness: '50%',    // Làm tối nhẹ để làm nổi bật lớp trên
              volume: '0%',
            },

            // ==========================================
            // LỚP 2: VIDEO CHÍNH / NHÂN VẬT (Foreground - Nét Căng HD)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',       // Giữ chuẩn tỷ lệ, không vỡ hình
              scale: '100%',
              speed: '104%',        // Tăng tốc nhẹ 1.04x lách âm thanh
              x_scale: '-100%',     // Lật gương hoàn toàn lách điểm ảnh
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
        console.log('🎉 XÀO NẤU THÀNH CÔNG! Link video chuẩn HD nét căng:', render.url);
        return render.url;
      }
      if (render.status === 'failed') {
        console.error('❌ Creatomate render thất bại:', render.error_message);
        return fallbackUrl;
      }
    } catch (err) {
      console.error('Lỗi check render status:', err);
    }
  }

  return fallbackUrl;
}