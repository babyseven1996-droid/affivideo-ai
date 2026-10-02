import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

type ToastProps = {
  message: string
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 3200)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss])

  return (
    <div className="app-toast" role="status" key={message}>
      <CheckCircle2 size={18} />
      <span>{message}</span>
      <button className="toast-dismiss" aria-label="Đóng thông báo" onClick={onDismiss}><X size={15} /></button>
      <span className="toast-timer" />
    </div>
  )
}
