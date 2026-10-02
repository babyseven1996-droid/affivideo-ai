import { AudioLines, BarChart3, Clapperboard, Gift, LayoutGrid, Settings2 } from 'lucide-react'
import type { AppTab } from '../types'

type SidebarProps = { active: AppTab; onChange: (tab: AppTab) => void }

const NAV_ITEMS = [
  { id: 'create', label: 'Tạo video', icon: Clapperboard },
  { id: 'library', label: 'Kho video', icon: LayoutGrid },
  { id: 'referral', label: 'Giới thiệu', icon: Gift },
  { id: 'analytics', label: 'Thống kê', icon: BarChart3 },
  { id: 'settings', label: 'Cài đặt', icon: Settings2 },
] as const

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <p className="nav-caption">MENU CHÍNH</p>
      <nav aria-label="Điều hướng chính" className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item${active === id ? ' is-active' : ''}`} onClick={() => onChange(id)} aria-current={active === id ? 'page' : undefined}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="voice-note-icon"><AudioLines size={17} /></div>
        <div><strong>Giọng nói của bạn</strong><span>Sẵn sàng sáng tạo</span></div>
      </div>
    </aside>
  )
}
