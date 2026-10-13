import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key để có quyền update database

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { content, transferAmount } = req.body // Payload nhận từ PayOS / Cassso / SeAPay Webhook

    // Trích xuất mã giao dịch từ nội dung chuyển khoản (VD: "AFFI500_123456")
    const match = content.match(/AFFI\d+_\d+/)
    if (!match) {
      return res.status(200).json({ success: true, message: 'Nội dung chuyển khoản không khớp định dạng.' })
    }

    const txCode = match[0]

    // 1. Tìm bản ghi giao dịch trong Supabase
    const { data: tx, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('code', txCode)
      .single()

    if (error || !tx) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch.' })
    }

    // 2. Kiểm tra nếu đã thanh toán rồi thì dừng (Tránh cộng trùng)
    if (tx.status === 'completed') {
      return res.status(200).json({ success: true, message: 'Giao dịch này đã được xử lý trước đó.' })
    }

    // 3. Cập nhật trạng thái giao dịch sang 'completed' -> Tự động kích hoạt Realtime phía Client
    await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('code', txCode)

    return res.status(200).json({ success: true, message: 'Xác nhận thanh toán và cộng Credits thành công!' })

  } catch (err) {
    console.error('Webhook Error:', err)
    return res.status(500).json({ error: err.message })
  }
}