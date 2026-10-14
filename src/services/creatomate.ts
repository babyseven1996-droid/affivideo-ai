// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc';

  try {
    console.log('🛡️ Đang khởi tạo Render Deep Remix Full 5 Kỹ thuật Chuyên nghiệp...');

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
          crf: 18, // Ép chuẩn Full HD nét căng tối đa
          elements: [
            // ==========================================
            // KỸ THUẬT 1: LỚP NỀN MỜ NGHỆ THUẬT (Background Blur)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              fit: 'cover',
              blur_radius: 50,
              brightness: '50%',
              volume: '0%',
            },

            // ==========================================
            // KỸ THUẬT 2, 3 & 4: VIDEO CHÍNH (Foreground Layer)
            // - Lật gương ngang (x_scale: '-100%')
            // - Tăng tốc lệch sóng âm (speed: '104%')
            // - Hiệu chỉnh màu sắc (Color Grading: Contrast, Saturation)
            // - Zoom động mượt mà (Dynamic Zoom từ 100% -> 112%)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              fit: 'contain',
              speed: '104%',
              x_scale: '-100%',
              contrast: '105%',
              saturation: '108%',
              brightness: '102%',
              animations: [
                {
                  time: 0,
                  scope: 'element',
                  type: 'scale',
                  easing: 'linear',
                  start_scale: '100%',
                  end_scale: '112%',
                }
              ]
            },

            // ==========================================
            // KỸ THUẬT 5: LỚP PHỦ HẠT NHIỄU & MASKING (Film Grain Noise & Progress Bar)
            // - Phủ lớp nhiễu 3% phá vỡ mã băm Byte Hash của file MP4
            // - Thanh progress bar chạy dưới đáy che hoàn toàn watermark góc
            // ==========================================
            {
              type: 'shape',
              time: 0,
              width: '100%',
              height: '100%',
              fill_color: '#ffffff',
              opacity: '3%', // Nhiễu điện ảnh ẩn 3%
            },
            {
              type: 'shape',
              time: 0,
              y: '98%',
              width: '100%',
              height: '1.2%',
              fill_color: '#00ffcc', // Thanh progress bar hiện đại che viền đáy
              opacity: '80%',
            }
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
        console.log('🎉 XÀO NẤU THÀNH CÔNG FULL 5 KỸ THUẬT:', render.url);
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