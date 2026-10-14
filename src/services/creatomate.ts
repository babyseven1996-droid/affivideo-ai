// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  // 🔑 HÃY DÁN SECRET API KEY THẬT CỦA BẠN VÀO TRONG DẤU NHÁY KÉP NÀY:
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc';

  try {
    console.log('🛡️ Đang khởi tạo Render Full HD 1080p (Nền mờ nghệ thuật + Video chính sắc nét)...');

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        source: {
          output_format: 'mp4',
          // Ép độ phân giải Full HD để video không bị mờ vỡ
          width: 1080,
          height: 1920,
          frame_rate: 30,
          elements: [
            // ==========================================
            // LỚP 1: NỀN MỜ PHÍA SAU (Background Blur Layer)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'cover',
              blur_radius: 50,      // Làm mờ sâu nghệ thuật
              brightness: '50%',    // Làm tối nền để nổi bật nhân vật
              volume: '0%',
            },

            // ==========================================
            // LỚP 2: VIDEO CHÍNH / NHÂN VẬT (Foreground - Nét căng)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',       // Giữ nguyên tỷ lệ, sắc nét 100% không bị vỡ
              scale: '100%',
              speed: '104%',        // Tăng tốc nhẹ lách bản quyền âm thanh
              x_scale: '-100%',     // Lật gương hoàn toàn chống quét nhận diện hình ảnh
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Chi tiết lỗi từ Creatomate API:', data);
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
        console.log('🎉 XÀO NẤU THÀNH CÔNG! Link video Full HD nét căng:', render.url);
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