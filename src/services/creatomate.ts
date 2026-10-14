// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a';

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
          // 💡 BẮT BUỘC CÓ WIDTH & HEIGHT ĐỂ ÉP RENDER FULL HD (KHÔNG BAO GIỜ BỊ MỜ)
          width: 1080,
          height: 1920,
          frame_rate: 30,
          elements: [
            // ==========================================
            // LỚP 1: NỀN MỜ PHÍA SAU (Background Blur Layer)
            // ==========================================
            // - Phủ kín khung hình 9:16 (cover)
            // - Làm mờ mạnh (blur_radius: 50) + Tối nền (brightness: '50%') để làm nổi bật video chính
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
            // LỚP 2: VIDEO CHÍNH / NHÂN VẬT (Foreground - Nét căng)
            // ==========================================
            // - Giữ nguyên tỷ lệ gốc, không bị kéo dãn hay vỡ hình (contain)
            // - Lật gương hoàn toàn (x_scale: '-100%') chống quét nhận diện hình ảnh
            // - Tăng tốc nhẹ 1.04x (speed: '104%') chống quét âm thanh Content ID
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',
              scale: '100%',
              speed: '104%',
              x_scale: '-100%', // 👈 Lật hình hoàn hảo ở đây
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('⚠️ API Creatomate lỗi, dùng video gốc dự phòng:', data);
      return videoUrl;
    }

    const renderId = Array.isArray(data) ? data[0]?.id : data?.id;
    if (!renderId) return videoUrl;

    return await pollRenderStatus(renderId, apiKey, videoUrl);

  } catch (error) {
    console.error('❌ Lỗi xào nấu video:', error);
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
        return fallbackUrl;
      }
    } catch (err) {
      console.error(err);
    }
  }

  return fallbackUrl;
}