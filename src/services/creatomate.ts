// src/services/creatomate.ts

export async function renderAntiCopyrightVideo(videoUrl: string) {
  try {
    console.log('🛡️ Đang gửi video sang Creatomate để xào nấu chống bản quyền...');

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer c61dcb2f5bda4db88ce4b91a401daf26b1160b954964fbd0477d5b1bbd31f940af7841a3ea7dc6e8213c1acf920952bc', // Dán chuỗi Bearer API Key vào đây
      },
      body: JSON.stringify({
        template_id: 'c1ffdb12-a26c-49db-9046-b84f67d89e0e', // Dán chuỗi template_id vào đây
        modifications: {
          'Clip-1': videoUrl, // Đưa link video gốc vào layer Clip-1 để hệ thống tự động xử lý
        },
      }),
    })

    const data = await response.json()
    console.log('✨ Kết quả render từ Creatomate:', data)
    
    // Trả về URL video đã được xào nấu thành công (hoặc trả về link gốc nếu lỗi)
    return data[0]?.url || videoUrl
  } catch (error) {
    console.error('❌ Lỗi gọi API xào nấu video:', error)
    return videoUrl
  }
}