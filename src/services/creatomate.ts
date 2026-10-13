// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string) {
  try {
    console.log('🛡️ Đang gửi video sang Creatomate...');

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CREATOMATE_API_KEY}`,
      },
      body: JSON.stringify({
        template_id: 'c1ffdb12-a26c-49db-9846-b84f67d89e0e', // ID Template của bạn
        modifications: {
          'SourceVideo': videoUrl, // Đảm bảo tên layer bên Creatomate trùng khớp với chữ này
        },
      }),
    });

    const data = await response.json();
    console.log('✨ Phản hồi từ Creatomate API:', data);

    // Creatomate API trả về một mảng render (nếu render đồng bộ/bất đồng bộ)
    // Thường data là một mảng, ta lấy phần tử đầu tiên
    const renderResult = Array.isArray(data) ? data[0] : data;

    if (renderResult && renderResult.url) {
      console.log('🎉 Link video đã xào nấu thành công:', renderResult.url);
      return renderResult.url;
    } else {
      console.warn('⚠️ API chưa trả về URL ngay, trả về giá trị dự phòng.');
      // Nếu API trả về dạng task đang chạy, có thể cần lấy renderResult.id để poll, 
      // nhưng mặc định nếu render trực tiếp thì nó sẽ có url hoặc ta phải check lại setting template.
      return renderResult?.url || videoUrl;
    }
  } catch (error) {
    console.error('❌ Lỗi gọi API xào nấu:', error);
    return videoUrl;
  }
}