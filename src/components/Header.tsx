import { useEffect, useRef, useState } from 'react'
import { KeyRound, LogOut, Moon, Settings2, Sparkles, Sun } from 'lucide-react'
import type { UserProfile } from '../types'

type HeaderProps = {
  credits: number
  darkMode: boolean
  user: UserProfile
  onToggleTheme: () => void
  onOpenPricing: () => void
  onGoToSettings: () => void
  onLogout: () => void
}

export default function Header({ credits, darkMode, user, onToggleTheme, onOpenPricing, onGoToSettings, onLogout }: HeaderProps) {
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="topbar">
      <a className="brand-lockup" href="#" aria-label="AffiVideo AI, trang chủ">
        <span className="brand-mark"><Sparkles size={19} strokeWidth={2.2} /></span>
        <span className="brand-name">AffiVideo <span>AI</span></span>
      </a>
      <div className="topbar-actions">
        <span className="connection-status"><span className="status-dot" /> Đang hoạt động</span>
        <button className="credit-pill credit-pill-button" onClick={onOpenPricing} aria-label={`Mở gói credits. Số dư ${credits} credits`} title="Xem các gói credits"><Sparkles size={14} /> <strong>{credits}</strong><span>Credits</span></button>
        <button className="icon-button theme-button" onClick={onToggleTheme} aria-label={darkMode ? 'Bật giao diện sáng' : 'Bật giao diện tối'} title={darkMode ? 'Giao diện sáng' : 'Giao diện tối'}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="account-container" ref={accountRef}>
          <button className="user-avatar" aria-label="Mở menu tài khoản" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}>{user.name.trim().charAt(0).toLocaleUpperCase('vi') || 'A'}</button>
          {accountOpen && <div className="account-menu" role="menu">
            <div className="account-summary">
  <span 
    className="account-menu-avatar" 
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
  >
    {(user.name.trim().charAt(0) || 'H').toUpperCase()}
  </span><div><strong>{user.name}</strong><span>{user.email}</span></div></div>
            <div className="account-menu-divider" />
            <button role="menuitem" onClick={() => { setAccountOpen(false); onGoToSettings() }}><KeyRound size={16} />Cài đặt API key</button>
            <button role="menuitem" onClick={() => { setAccountOpen(false); onGoToSettings() }}><Settings2 size={16} />Cài đặt tài khoản</button>
            <div className="account-menu-divider" />
            <button className="logout-menu-item" role="menuitem" onClick={() => { setAccountOpen(false); onLogout() }}><LogOut size={16} />Đăng xuất</button>
          </div>}
        </div>
      </div>
    </header>
  )
}
