// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  // Ưu tiên biến môi trường trên Vercel, nếu không có sẽ tự động lấy Key trực tiếp bên dưới
  const apiKey = import.meta.env.VITE_CREATOMATE_API_KEY || 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a';

  try {
    console.log('🛡️ Đang gọi API xào nấu video...');

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
            // Lớp 1: Nền mờ nghệ thuật (Background)
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
            // Lớp 2: Video chính / Nhân vật (Foreground - Lật gương + Tăng tốc + Zoom)
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',
              scale: '104%',
              speed: '104%',
              x_scale: '-100%',
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('⚠️ API Creatomate phản hồi lỗi (401/400). Đang chuyển về chế độ dự phòng an toàn:', data);
      return videoUrl; // Trả về video gốc an toàn, không làm lỗi app
    }

    const renderId = Array.isArray(data) ? data[0]?.id : data?.id;
    if (!renderId) return videoUrl;

    // Chờ render hoàn tất
    return await pollRenderStatus(renderId, apiKey, videoUrl);

  } catch (error) {
    console.error('❌ Lỗi kết nối xào nấu video:', error);
    return videoUrl; // Fallback an toàn tuyệt đối
  }
}

// Hàm chờ render hoàn tất (Polling)
async function pollRenderStatus(renderId: string, apiKey: string, fallbackUrl: string): Promise<string> {
  const maxAttempts = 25; // Chờ tối đa 50 giây
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
      if (render.status === 'failed') {
        console.warn('⚠️ Render thất bại trên server, dùng video gốc.');
        return fallbackUrl;
      }
    } catch (err) {
      console.error('Lỗi check render status:', err);
    }
  }

  return fallbackUrl;
}