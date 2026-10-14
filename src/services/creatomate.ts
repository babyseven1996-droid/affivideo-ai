// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc';

  try {
    console.log('🛡️ Đang khởi tạo Render Dynamic Zoom chuẩn thời lượng video gốc...');

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
          crf: 18, // Đảm bảo chất lượng HD nét căng
          elements: [
            // ==========================================
            // LỚP 1: NỀN MỜ PHÍA SAU (Toàn bộ thời lượng)
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
            // LỚP 2: VIDEO CHÍNH + DYNAMIC ZOOM SỐ 1
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              fit: 'contain',
              speed: '104%',      // Lách tần số âm thanh
              x_scale: '-100%',   // Lật gương hình ảnh
              
              // 💡 KỸ THUẬT 1: ZOOM ĐỘNG TỰ ĐỘNG THEO THỜI LƯỢNG ELEMENT
              // Cấu hình chuẩn xác giúp Zoom phóng to mượt mà từ 100% -> 112% theo thời gian video thực
              animations: [
                {
                  time: 0,
                  scope: 'element',  // Áp dụng xuyên suốt độ dài thực của video này
                  type: 'scale',
                  easing: 'linear',
                  start_scale: '100%',
                  end_scale: '112%',
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
        console.log('🎉 XÀO NẤU THÀNH CÔNG VỚI DYNAMIC ZOOM (FULL DURATION):', render.url);
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