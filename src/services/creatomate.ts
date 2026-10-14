// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc';

  try {
    console.log('🛡️ Đang khởi tạo Render chuẩn HD (Video chính nét gốc 100% + Nền mờ nghệ thuật)...');

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
          crf: 17, // Chất lượng nén siêu nét chuẩn HD
          elements: [
            // ==========================================
            // LỚP 1: NỀN MỜ PHÍA SAU (Background Blur)
            // - Phủ kín màn hình dọc 9:16, làm mờ sâu và tối nền
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              fit: 'cover',
              blur_radius: 60,
              brightness: '40%',
              volume: '0%',
            },

            // ==========================================
            // LỚP 2: VIDEO CHÍNH / NHÂN VẬT (Foreground - Nét Căng Nguyên Bản)
            // - Dùng fit: 'contain' để giữ trọn vẹn độ nét và khung hình gốc, không bị vỡ ảnh
            // - Lật gương + Tăng tốc + Màu sắc rực rỡ sống động
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              fit: 'contain',       // 💡 QUAN TRỌNG: Giúp video sắc nét tuyệt đối, không bị phóng to vỡ hình
              speed: '104%',        // Lách âm thanh bản quyền
              x_scale: '-100%',     // Lật gương ngang chống nhận diện hình ảnh

              // MÀU SẮC RỰC RỠ & SỐNG ĐỘNG (Color Grading chuyên nghiệp)
              contrast: '115%',     // Tăng tương phản vừa đủ giúp hình ảnh sắc bén, có chiều sâu
              saturation: '125%',   // Tăng độ rực màu giúp video tươi tắn, bắt mắt hơn hẳn gốc
              brightness: '103%',   // Tăng sáng nhẹ nhàng

              // ZOOM ĐỘNG CỰC NHẸ (Chỉ zoom từ 100% lên 105% để tránh làm mờ vỡ hình)
              animations: [
                {
                  time: 0,
                  scope: 'element',
                  type: 'scale',
                  easing: 'linear',
                  start_scale: '100%',
                  end_scale: '105%',
                }
              ]
            },

            // ==========================================
            // LỚP 3: PHỦ NHIỄU ĐIỆN ẢNH SIÊU MỜ (Chống quét Byte Hash)
            // ==========================================
            {
              type: 'shape',
              time: 0,
              width: '100%',
              height: '100%',
              fill_color: '#ffffff',
              opacity: '2%',
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
  const maxAttempts = 35;
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
        console.log('🎉 XÀO NẤU THÀNH CÔNG (NÉ TƯƠI - NÉT CĂNG):', render.url);
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