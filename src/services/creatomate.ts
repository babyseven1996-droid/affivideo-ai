// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = import.meta.env.VITE_CREATOMATE_API_KEY || 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a';

  try {
    console.log('🛡️ Đang khởi tạo Render Pipeline chống bản quyền qua Creatomate...');

    // 1. Gửi request Render với cấu hình Deep Remix chuyên nghiệp
    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // Dùng tỉ lệ chuẩn 9:16 cho Reels / TikTok
        width: 1080,
        height: 1920,
        frame_rate: 30,
        
        // Cấu hình các lớp (Elements) tạo hiệu ứng Blur Nền + Zoom Video Chính
        elements: [
          // Lớp 1: Video nền mờ (Background Blur) để biến đổi cấu trúc khung hình
          {
            type: 'video',
            source: videoUrl,
            time: 0,
            duration: null, // Tự động lấy theo độ dài video gốc
            fit: 'cover',
            blur: '30px',
            brightness: '70%',
            volume: '0%', // Tắt tiếng video nền
          },
          // Lớp 2: Video chính ở trên (Foreground) - Zoom + Tăng tốc + Lật khung hình
          {
            type: 'video',
            source: videoUrl,
            time: 0,
            duration: null,
            fit: 'contain',
            scale: '104%',      // Phóng to nhẹ 4% cắt viền logo
            speed: '104%',      // Tăng tốc nhẹ 1.04x lách Audio Fingerprint & Time-Matching
            x_scale: '-100%',   // Lật ngang video (Flip Horizontal) - Lách cực mạnh
          }
        ]
      }),
    });

    const data = await response.json();
    console.log('✨ Khởi tạo Render thành công, ID:', data[0]?.id || data?.id);

    const renderId = data[0]?.id || data?.id;
    if (!renderId) {
      console.warn('⚠️ Không lấy được Render ID, dùng URL trực tiếp nếu có');
      return data[0]?.url || data?.url || videoUrl;
    }

    // 2. Cơ chế Polling: Đợi Server Creatomate xử lý xong hoàn toàn mới lấy URL
    return await pollRenderStatus(renderId, apiKey, videoUrl);

  } catch (error) {
    console.error('❌ Lỗi khi xào nấu video:', error);
    return videoUrl;
  }
}

// Hàm chờ render hoàn tất (Vòng lặp kiểm tra mỗi 2 giây)
async function pollRenderStatus(renderId: string, apiKey: string, fallbackUrl: string): Promise<string> {
  const maxAttempts = 30; // Chờ tối đa 60 giây
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ 2s
    attempts++;

    try {
      const res = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const render = await res.json();
      console.log(`⌛ [${attempts}/${maxAttempts}] Trạng thái Render:`, render.status);

      if (render.status === 'succeeded' && render.url) {
        console.log('🎉 XÀO NẤU THÀNH CÔNG! Link video an toàn:', render.url);
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

  console.warn('⏰ Quá thời gian chờ render, trả về video gốc dự phòng.');
  return fallbackUrl;
}