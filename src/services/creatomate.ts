// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a';

  try {
    console.log('🛡️ Đang khởi tạo Render Pipeline xào nấu chuyên nghiệp...');

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
          elements: [
            // Lớp 1: NỀN PHÍA SAU (Background) - Phóng to kín màn hình và làm mờ mạnh
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'cover',
              blur_radius: 40,      // Làm mờ phần nền phía sau
              brightness: '60%',    // Làm tối nền một chút để làm nổi bật nhân vật phía trên
              volume: '0%',         // Tắt tiếng lớp nền
            },
            // Lớp 2: NHÂN VẬT / VIDEO CHÍNH PHÍA TRÊN (Foreground) - Sắc nét 100%, KHÔNG MỜ
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',       // Giữ tỷ lệ chuẩn của video gốc
              scale: '104%',        // Zoom nhẹ 4% để cắt viền logo
              speed: '104%',        // Tăng tốc nhẹ 1.04x lách thuật toán
              x_scale: '-100%',     // Lật ngang video (Flip Horizontal)
              // ⚠️ Lưu ý: Tuyệt đối không thêm thuộc tính blur ở lớp này để nhân vật luôn sắc nét!
            },
          ],
        },
      }),
    });

    const data = await response.json();
    console.log('✨ Response từ Creatomate API:', data);

    if (!response.ok) {
      console.error('❌ Creatomate API trả về lỗi HTTP:', data);
      return videoUrl;
    }

    const renderId = Array.isArray(data) ? data[0]?.id : data?.id;
    if (!renderId) return videoUrl;

    return await pollRenderStatus(renderId, apiKey, videoUrl);

  } catch (error) {
    console.error('❌ Lỗi ngoại lệ khi xào nấu video:', error);
    return videoUrl;
  }
}

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
        console.log('🎉 XÀO NẤU THÀNH CÔNG! Link video mới:', render.url);
        return render.url;
      }
      if (render.status === 'failed') return fallbackUrl;
    } catch (err) {
      console.error(err);
    }
  }
  return fallbackUrl;
}