// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey ='c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a';

  try {
    console.log('🛡️ Đang khởi tạo Render Pipeline xào nấu...');

    // 1. Cấu hình đúng chuẩn Creatomate API (truyền source object)
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
            // Lớp 1: Video nền mờ (Background Blur)
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'cover',
              blur: '30px',
              brightness: '70%',
              volume: '0%',
            },
            // Lớp 2: Video chính ở trên (Zoom + Tăng tốc + Lật ngang)
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',
              scale: '104%',      // Zoom 4% cắt viền logo
              speed: '104%',      // Tăng tốc nhẹ 1.04x
              x_scale: '-100%',   // Lật ngang video (Flip Horizontal)
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

    if (!renderId) {
      console.warn('⚠️ Không tìm thấy Render ID trong dữ liệu trả về!');
      return videoUrl;
    }

    // 2. Chờ Server Creatomate xử lý xong hoàn toàn
    return await pollRenderStatus(renderId, apiKey, videoUrl);

  } catch (error) {
    console.error('❌ Lỗi ngoại lệ khi xào nấu video:', error);
    return videoUrl;
  }
}

// Hàm chờ render hoàn tất (Polling)
async function pollRenderStatus(renderId: string, apiKey: string, fallbackUrl: string): Promise<string> {
  const maxAttempts = 30; // Chờ tối đa 60 giây
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ 2 giây mỗi lần check
    attempts++;

    try {
      const res = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const render = await res.json();
      console.log(`⌛ [Lần ${attempts}/${maxAttempts}] Trạng thái Render: ${render.status}`);

      if (render.status === 'succeeded' && render.url) {
        console.log('🎉 XÀO NẤU THÀNH CÔNG! Link video mới:', render.url);
        return render.url;
      }

      if (render.status === 'failed') {
        console.error('❌ Creatomate báo lỗi render:', render.error_message);
        return fallbackUrl;
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra trạng thái render:', err);
    }
  }

  console.warn('⏰ Quá thời gian chờ render!');
  return fallbackUrl;
}