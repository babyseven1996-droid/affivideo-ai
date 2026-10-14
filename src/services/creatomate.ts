// src/services/creatomate.ts
export async function renderAdvancedVideo({
  videoUrl,
  musicUrl,
  voiceUrl,
  captionText,
  speed = 1.04,
  horizontalFlip = true
}: {
  videoUrl: string;
  musicUrl?: string;       // Link file nhạc nền (.mp3)
  voiceUrl?: string;       // Link file giọng đọc TTS (.mp3 / .wav từ ElevenLabs, Edge-TTS...)
  captionText?: string;    // Nội dung chú dẫn tự viết
  speed?: number;          // Tốc độ video (vd: 1.04x)
  horizontalFlip?: boolean;// Lật gương chống quét bản quyền
}) {
  const CREATOMATE_API_KEY = process.env.REACT_APP_CREATOMATE_API_KEY || 'API_KEY_CUA_BAN';

  // 💡 Cấu hình timeline các lớp (Layers) render Ultra HD
  const payload = {
    output: {
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    },
    elements: [
      // 1. 🎬 LỚP VIDEO GỐC (Đã tắt âm thanh, lật gương, tăng tốc)
      {
        type: 'video',
        source: videoUrl,
        volume: '0%',               // 👈 Tắt hoàn toàn tạp âm và tiếng gốc
        speed: speed,               // 👈 Tăng tốc nhẹ tránh Content ID
        horizontal_flip: horizontalFlip, // 👈 Lật gương chống quét bản quyền
        fit: 'cover',
        duration: 'fit'
      },

      // 2. 🎵 LỚP NHẠC NỀN (Background Music) - Âm lượng nhỏ (15-20%) để không lấn át voice
      ...(musicUrl ? [{
        type: 'audio',
        source: musicUrl,
        volume: '18%',              // 👈 Âm lượng nhạc nền vừa phải
        trim_start: 0,
        audio_fade_in: 1,           // Hiệu ứng nhạc nhỏ dần khi bắt đầu
        audio_fade_out: 2           // Hiệu ứng nhạc nhỏ dần khi kết thúc
      }] : []),

      // 3. 🗣️ LỚP GIỌNG ĐỌC (Voiceover / TTS) - Âm lượng chuẩn 100%
      ...(voiceUrl ? [{
        type: 'audio',
        source: voiceUrl,
        volume: '100%',             // 👈 Âm lượng voice rõ nét
        trim_start: 0
      }] : []),

      // 4. 📝 LỚP TEXT CHÚ DẪN TÙY CHỈNH (Hiển thị đẹp mắt ở gần đáy video)
      ...(captionText ? [{
        type: 'text',
        text: captionText,
        font_family: 'Roboto',
        font_weight: '700',
        font_size: 46,
        fill_color: '#ffffff',
        background_color: 'rgba(0, 0, 0, 0.65)', // Khung nền đen mờ giúp chữ nổi bật
        background_padding: 24,
        background_border_radius: 12,
        y: '82%',                   // Đặt vị trí ở 82% chiều cao màn hình (phần dưới video)
        width: '90%',
        animations: [
          {
            time: 'intro',
            type: 'fade',
            duration: 0.4
          }
        ]
      }] : [])
    ]
  };

  const response = await fetch('https://api.creatomate.com/v1/renders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CREATOMATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi Render Creatomate: ${response.status}`);
  }

  const renderResult = await response.json();
  return renderResult; // Trả về thông tin render (render_id, status...)
}
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
// Ví dụ payload gửi sang Creatomate API
const renderPayload = {
  template: 'YOUR_TEMPLATE_ID', // hoặc định nghĩa cấu trúc timeline trực tiếp
  modifications: {
    "source_video": videoUrl,
  },
  // Hoặc nếu cấu hình trực tiếp qua elements:
  elements: [
    {
      type: 'video',
      source: videoUrl,
      volume: '0%',             // 👈 Tắt hoàn toàn âm thanh gốc (Mute)
      fit: 'cover',             // 👈 Phủ kín khung hình, tự động crop bớt viền để che bớt sub cũ nếu cần
      speed: speedSetting,      // Tốc độ điều chỉnh (ví dụ 1.04x)
      horizontal_flip: true     // Lật gương chống quét bản quyền
    },
    // Bạn có thể thêm các thành phần Text/Audio tùy chỉnh của riêng bạn ở đây
  ]
};
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