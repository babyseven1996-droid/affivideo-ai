import { ArrowUpRight, Coins, Lightbulb, MessageSquareText, Repeat2, Sparkles, Video } from 'lucide-react'
import type { CreditTransaction, VideoRecord } from '../types'

type AnalyticsProps = {
  videos: VideoRecord[]
  transactions: CreditTransaction[]
}

function parseVideoDate(value: string) {
  const parts = value.split(/[/.\-]/).map(Number)
  if (parts.length === 3 && parts.every(Number.isFinite)) {
    const [first, month, third] = parts
    const yearFirst = first > 31
    const year = yearFirst ? first : third
    const day = yearFirst ? third : first
    const fullYear = year < 100 ? 2000 + year : year
    const date = new Date(fullYear, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export default function Analytics({ videos, transactions }: AnalyticsProps) {
  const now = new Date()
  const monthLabel = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(now)
  const videosThisMonth = videos.filter((video) => {
    const created = parseVideoDate(video.date)
    return created?.getMonth() === now.getMonth() && created?.getFullYear() === now.getFullYear()
  }).length
  const creditsUsedThisMonth = transactions.reduce((total, transaction) => {
    const created = new Date(transaction.createdAt)
    const isThisMonth = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    return isThisMonth && transaction.amount < 0 ? total + Math.abs(transaction.amount) : total
  }, 0)

  return (
    <section className="analytics-page">
      <header className="analytics-intro"><div><span className="analytics-kicker"><Sparkles size={14} /> HIỆU SUẤT TÀI KHOẢN</span><h2>Tổng quan hoạt động</h2><p>Theo dõi nội dung và mức sử dụng credits trong {monthLabel}.</p></div><span className="analytics-period">{monthLabel}</span></header>
      <div className="analytics-stats-grid">
        <article className="analytics-stat-card"><span className="analytics-stat-icon videos-stat-icon"><Video size={19} /></span><div><span>Video đã tạo trong tháng</span><strong>{videosThisMonth}</strong><small>video trong thư viện</small></div><span className="analytics-stat-trend"><ArrowUpRight size={15} /> Tháng này</span></article>
        <article className="analytics-stat-card"><span className="analytics-stat-icon credits-stat-icon"><Coins size={19} /></span><div><span>Credits đã tiêu thụ</span><strong>{creditsUsedThisMonth.toLocaleString('vi-VN')}</strong><small>credits trong tháng này</small></div><span className="analytics-stat-trend"><Repeat2 size={14} /> Theo lịch sử</span></article>
      </div>

      <section className="growth-tips-card">
        <div className="growth-tips-heading"><span className="growth-tips-icon"><Lightbulb size={19} /></span><div><h3>Mẹo tăng tương tác trên TikTok &amp; Reels</h3><p>Một vài gợi ý nhỏ trước khi đăng video tiếp theo.</p></div></div>
        <div className="growth-tip-list">
          <article className="growth-tip"><span>01</span><div><strong>Giữ hook thật ngắn</strong><p>Đưa lợi ích hoặc điểm gây tò mò vào 2 giây đầu video.</p></div></article>
          <article className="growth-tip"><span>02</span><div><strong>Ưu tiên khung hình dọc</strong><p>Dùng tỉ lệ 9:16, ánh sáng rõ và chữ phụ đề dễ đọc trên điện thoại.</p></div></article>
          <article className="growth-tip"><span>03</span><div><strong>Thêm lời kêu gọi cụ thể</strong><p>Hướng người xem tới một hành động rõ ràng như xem màu, chọn size hoặc mở giỏ hàng.</p></div></article>
          <article className="growth-tip"><span>04</span><div><strong>Thử nhiều thời điểm đăng</strong><p>So sánh lượt xem và tương tác để tìm khung giờ phù hợp với khán giả của bạn.</p></div></article>
        </div>
        <div className="growth-tips-footer"><MessageSquareText size={15} /> Mẹo tham khảo; hãy điều chỉnh theo dữ liệu thực tế từ kênh của bạn.</div>
      </section>
    </section>
  )
}
