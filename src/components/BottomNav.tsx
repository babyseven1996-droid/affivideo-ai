import { BarChart3, Clapperboard, Gift, LayoutGrid, Settings2 } from 'lucide-react'
import type { AppTab } from '../types'

type BottomNavProps = { active: AppTab; onChange: (tab: AppTab) => void }

const NAV_ITEMS = [
  { id: 'create', label: 'Tạo video', icon: Clapperboard },
  { id: 'library', label: 'Kho video', icon: LayoutGrid },
  { id: 'referral', label: 'Giới thiệu', icon: Gift },
  { id: 'analytics', label: 'Thống kê', icon: BarChart3 },
  { id: 'settings', label: 'Cài đặt', icon: Settings2 },
] as const

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button key={id} className={`bottom-nav-item${active === id ? ' is-active' : ''}`} onClick={() => onChange(id)} aria-current={active === id ? 'page' : undefined}>
          <Icon size={20} strokeWidth={1.8} /><span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
