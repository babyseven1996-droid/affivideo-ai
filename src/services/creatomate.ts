// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string): Promise {
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
      crf: 15, // Chất lượng nén thấp nhất - Siêu nét căng
      elements: [
        // LỚP 1: NỀN MỜ NGHỆ THUẬT PHÍA SAU (Background Blur)
        {
          type: 'video',
          source: videoUrl,
          time: 0,
          fit: 'cover',
          blur_radius: 50,
          brightness: '40%',
          volume: '0%',
        },

        // LỚP 2: VIDEO CHÍNH (Ultra HD + Rực rỡ + Lật gương + Tăng tốc + Zoom động)
        {
          type: 'video',
          source: videoUrl,
          time: 0,
          fit: 'cover',
          speed: '104%',      // Lách tần số sóng âm
          x_scale: '-100%',   // Lật gương hình ảnh hoàn toàn
          contrast: '120%',   // Tăng tương phản sắc bén
          saturation: '130%', // Tăng độ rực màu rực rỡ, sinh động
          brightness: '105%', // Tăng sáng nhẹ bắt mắt
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

        // LỚP 3: LỚP PHỦ HẠT NHIỄU ĐIỆN ẢNH (Film Grain Noise)
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

async function pollRenderStatus(renderId: string, apiKey: string, fallbackUrl: string): Promise {
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