import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { authenticateAccount, registerAccount, requestPasswordRecovery, resetAccountPassword } from '../lib/credentials'
import type { UserProfile } from '../types'
import { supabase } from '../lib/supabase'

type AuthScreenProps = {
  lastUser: UserProfile | null
  notice: string
  onAuthenticate: (user: UserProfile, isNewAccount: boolean) => void
}

export default function AuthScreen({ lastUser, notice, onAuthenticate }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState(lastUser?.name ?? '')
  const [email, setEmail] = useState(lastUser?.email ?? '')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recoveryView, setRecoveryView] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [localNotice, setLocalNotice] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mode === 'register' && name.trim().length < 2) {
      setError('Nhập tên hiển thị có ít nhất 2 ký tự.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu cần có ít nhất 6 ký tự.')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'register') {
        // Đăng ký tài khoản thật với Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setSubmitting(false)
          return
        }

        const user = data.user
        if (user) {
          onAuthenticate(
            {
              id: user.id,
              email: user.email || email,
              name: name || email.split('@')[0],
            },
            true
          )
        }
      } else {
        // Đăng nhập tài khoản thật với Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError('Email hoặc mật khẩu không chính xác.')
          setSubmitting(false)
          return
        }

        const user = data.user
        if (user) {
          onAuthenticate(
            {
              id: user.id,
              email: user.email || email,
              name: user.user_metadata?.display_name || email.split('@')[0],
            },
            false
          )
        }
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  function openRecovery() {
    setRecoveryEmail(email.trim())
    setRecoveryView(true)
    setRecoverySent(false)
    setRecoveryMessage('')
    setError('')
  }

  function backToLogin() {
    setRecoveryView(false)
    setRecoverySent(false)
    setRecoveryMessage('')
    setError('')
    setNewPassword('')
    setConfirmPassword('')
  }

  async function submitRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const result = requestPasswordRecovery(recoveryEmail)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setRecoverySent(true)
    setRecoveryMessage('Đã gửi liên kết khôi phục mật khẩu tới email của bạn. Vui lòng kiểm tra hộp thư! Đây là mô phỏng; bạn có thể đặt mật khẩu mới ngay bên dưới.')
  }

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (newPassword.length < 6) {
      setError('Mật khẩu mới cần có ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }
    setError('')
    setSubmitting(true)
    const result = await resetAccountPassword(recoveryEmail, newPassword)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setEmail(result.user.email)
    setPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setRecoveryView(false)
    setRecoverySent(false)
    setLocalNotice('Mật khẩu đã được cập nhật. Đăng nhập bằng mật khẩu mới để tiếp tục.')
  }

  function changeMode(nextMode: 'login' | 'register') {
    setMode(nextMode)
    setError('')
    setLocalNotice('')
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
      <section className="auth-card">
        <a className="brand-lockup auth-brand" href="#" aria-label="AffiVideo AI">
          <span className="brand-mark"><Sparkles size={19} strokeWidth={2.2} /></span>
          <span className="brand-name">AffiVideo <span>AI</span></span>
        </a>
        <div className="auth-heading">
          <p className="auth-eyebrow">YOUR AI VIDEO STUDIO</p>
          <h1>{recoveryView ? recoverySent ? 'Đặt mật khẩu mới' : 'Khôi phục mật khẩu' : mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h1>
          <p>{recoveryView ? recoverySent ? 'Chọn mật khẩu mới để bảo vệ tài khoản của bạn.' : 'Nhập email đã đăng ký để bắt đầu khôi phục tài khoản.' : mode === 'login' ? 'Đăng nhập để tiếp tục không gian sáng tạo của bạn.' : 'Bắt đầu tạo video affiliate cùng AI chỉ trong vài phút.'}</p>
        </div>
        {recoveryView ? <>
          <button className="auth-back-link" type="button" onClick={backToLogin}><ArrowLeft size={15} />Quay lại đăng nhập</button>
          {recoverySent && <p className="recovery-success" role="status"><CheckCircle2 size={18} /><span>{recoveryMessage}</span></p>}
          {!recoverySent ? <form className="auth-form" onSubmit={submitRecovery}>
            <label className="auth-field"><span>Email đã đăng ký</span><span className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} placeholder="ban@email.com" required /></span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Đang kiểm tra email...' : 'Gửi mã xác nhận / Khôi phục mật khẩu'}<ArrowRight size={17} /></button>
          </form> : <form className="auth-form recovery-password-form" onSubmit={submitPasswordReset}>
            <label className="auth-field"><span>Mật khẩu mới</span><span className="auth-input-wrap"><LockKeyhole size={17} /><input type={passwordVisible ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Ít nhất 6 ký tự" minLength={6} required /><button className="password-toggle" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
            <label className="auth-field"><span>Xác nhận mật khẩu mới</span><span className="auth-input-wrap"><LockKeyhole size={17} /><input type={passwordVisible ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu mới" minLength={6} required /></span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Đang cập nhật...' : 'Đặt mật khẩu mới'}<ArrowRight size={17} /></button>
          </form>}
        </> : <>
          <div className="auth-switch" role="tablist" aria-label="Chọn hình thức xác thực">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Đăng nhập</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Tạo tài khoản</button>
          </div>
          {(notice || localNotice) && <p className="auth-notice" role="status">{localNotice || notice}</p>}
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && <label className="auth-field"><span>Họ và tên</span><span className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên hiển thị của bạn" required /></span></label>}
            <label className="auth-field"><span>Email</span><span className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@email.com" required /></span></label>
            <label className="auth-field"><span>Mật khẩu</span><span className="auth-input-wrap"><LockKeyhole size={17} /><input type={passwordVisible ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ít nhất 6 ký tự" minLength={6} required /><button className="password-toggle" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
            {mode === 'login' && <div className="forgot-password-row"><button type="button" onClick={openRecovery}>Quên mật khẩu?</button></div>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Đang xác minh...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}<ArrowRight size={17} /></button>
          </form>
          <p className="auth-footnote">Phiên bản demo lưu thông tin đăng nhập trên thiết bị này. Không nhập mật khẩu thật.</p>
        </>}
      </section>
      <footer className="auth-footer"><span>© 2026 AffiVideo AI</span><span><span className="status-dot" /> Hệ thống đang hoạt động</span></footer>
    </main>
  )
}
