// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc';

  try {
    console.log('🛡️ Đang khởi tạo Render bản Ultra HD tối ưu nhất (Màu sắc rực rỡ + Nét căng đỉnh cao)...');

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
          crf: 17, // 💡 Đã sửa chuẩn quy định của Creatomate (mức 17 là siêu nét tối đa)
          elements: [
            // ==========================================
            // LỚP 1: NỀN MỜ PHÍA SAU (Background Blur)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              fit: 'cover',
              blur_radius: 50,
              brightness: '40%',    // Làm tối sâu nền để làm nổi bật video chính phía trên
              volume: '0%',
            },

            // ==========================================
            // LỚP 2: VIDEO CHÍNH (Siêu nét + Màu sắc rực rỡ)
            // ==========================================
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              fit: 'cover',         // Phủ kín màn hình 9:16, to rõ và sắc nét tuyệt đối
              speed: '104%',        // Lách âm thanh
              x_scale: '-100%',     // Lật gương hình ảnh

              // MÀU SẮC RỰC RỠ & SỐNG ĐỘNG (Color Grading chuyên nghiệp)
              contrast: '120%',     // Tăng tương phản mạnh giúp hình ảnh sắc bén, có chiều sâu
              saturation: '130%',   // Tăng độ rực màu lên 30% giúp màu sắc cực kỳ bắt mắt, tươi tắn
              brightness: '105%',   // Tăng sáng nhẹ giúp video bừng sáng, không bị tối

              // ZOOM ĐỘNG MƯỢT MÀ (Phóng từ 100% -> 115%)
              animations: [
                {
                  time: 0,
                  scope: 'element',
                  type: 'scale',
                  easing: 'linear',
                  start_scale: '100%',
                  end_scale: '115%',
                }
              ]
            },

            // ==========================================
            // LỚP 3: LỚP PHỦ HẠT NHIỄU ĐIỆN ẢNH (Film Grain)
            // ==========================================
            {
              type: 'shape',
              time: 0,
              width: '100%',
              height: '100%',
              fill_color: '#ffffff',
              opacity: '2%',        // Phủ nhiễu siêu mờ chống quét Byte Hash
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
        console.log('🎉 XÀO NẤU THÀNH CÔNG ULTRA HD:', render.url);
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