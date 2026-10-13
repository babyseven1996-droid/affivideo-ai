// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string) {
  try {
    console.log('🛡️ Đang xào nấu chuyên nghiệp (Deep Remix)...');

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc`,
      },
      body: JSON.stringify({
        template_id: 'c1ffdb12-a26c-49db-9046-b84f67d89e0e', // ID Template đã chọn
        modifications: {
          // 1. Truyền video gốc vào các layer
          'SourceVideo': videoUrl,
          
          // 2. Chỉnh tốc độ video (Tăng 5% để lách Audio Fingerprint & Time-matching)
          'SourceVideo.speed': '105%',

          // 3. Zoom nhẹ 4% để loại bỏ pixel viền & logo ẩn
          'SourceVideo.scale': '104%',

          // 4. Lật ngang (Flip) nếu muốn (Tùy chọn)
          // 'SourceVideo.x_scale': '-100%',

          // 5. Điều chỉnh nhẹ màu sắc (Color Shift)
          'SourceVideo.color_filter': 'sepia(5%) contrast(105%) brightness(98%)',
        },
      }),
    });

    const data = await response.json();
    console.log('✨ Xào nấu thành công! Output Video:', data);

    return data[0]?.url || videoUrl;
  } catch (error) {
    console.error('❌ Lỗi tiến trình xào nấu:', error);
    return videoUrl;
  }
}