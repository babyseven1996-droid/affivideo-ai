// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise<string> {
  const apiKey = 'c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a';

  try {
    console.log('🛡️ Đang khởi tạo Render Pipeline xào nấu chuyên nghiệp (Deep Remix)...');

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
            // ==========================================
            // LỚP 1: NỀN MỜ NGHỆ THUẬT (Background Layer)
            // ==========================================
            // - Phóng to phủ kín khung hình 9:16
            // - Làm mờ mạnh (blur_radius: 40) + Giảm tối (brightness: '60%') để nổi bật chủ thể
            // - Tắt âm lượng lớp nền (volume: '0%') tránh bị rè âm thanh
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

            // ==========================================
            // LỚP 2: VIDEO CHÍNH / NHÂN VẬT (Foreground Layer)
            // ==========================================
            // - Lật ngang hoàn toàn (x_scale: '-100%'): Đánh lừa tuyệt đối thuật toán nhận diện pixel của Meta/TikTok
            // - Tăng tốc nhẹ 1.04x (speed: '104%'): Phá vỡ Audio Fingerprint & Time-matching chống quét âm thanh
            // - Zoom nhẹ 104% (scale: '104%'): Cắt sạch viền logo, watermark góc video gốc
            // - Giữ nguyên độ nét 100%, tuyệt đối không làm mờ lớp này
            {
              type: 'video',
              source: videoUrl,
              time: 0,
              duration: null,
              fit: 'contain',
              scale: '104%',
              speed: '104%',
              x_scale: '-100%', // 👈 Đã khôi phục tính năng lật gương cực mạnh ở đây!
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

    // 3. Chờ Server Creatomate xử lý xong hoàn toàn rồi trả về link chuẩn
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