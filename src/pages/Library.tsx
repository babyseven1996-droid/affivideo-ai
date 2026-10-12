import { useEffect, useState } from 'react'
import { AlertTriangle, CalendarDays, Clapperboard, Download, FileText, Pause, Play, VolumeX, Trash2, X } from 'lucide-react'
import type { VideoRecord } from '../types'

type LibraryProps = {
  videos: VideoRecord[]
  onDelete: (id: string) => void
  onToast: (message: string) => void
}

function slugify(value: string) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function downloadMockVideo(video: VideoRecord, onToast: (message: string) => void) {
  onToast('Đang tải xuống video xuống thiết bị...')
  if (typeof MediaRecorder === 'undefined') {
    onToast('Trình duyệt này chưa hỗ trợ tải video WebM.')
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 1280
  const context = canvas.getContext('2d')
  if (!context || !canvas.captureStream) {
    onToast('Trình duyệt không hỗ trợ xuất video demo.')
    return
  }
  const gradient = context.createLinearGradient(0, 0, 720, 1280)
  gradient.addColorStop(0, '#e4f3ea')
  gradient.addColorStop(1, '#f9f2df')
  context.fillStyle = gradient
  context.fillRect(0, 0, 720, 1280)
  context.fillStyle = '#267255'
  context.fillRect(58, 72, 74, 8)
  context.fillStyle = '#183d31'
  context.font = '600 28px sans-serif'
  context.fillText('AFFIVIDEO AI', 58, 132)
  context.font = '700 54px sans-serif'
  const words = video.title.split(' ')
  let line = ''
  let lineY = 330
  words.forEach((word) => {
    const nextLine = `${line}${word} `
    if (context.measureText(nextLine).width > 600) {
      context.fillText(line.trim(), 58, lineY)
      line = `${word} `
      lineY += 70
    } else line = nextLine
  })
  context.fillText(line.trim(), 58, lineY)
  context.fillStyle = '#267255'
  context.font = '700 40px sans-serif'
  context.fillText(video.price, 58, 520)
  context.fillStyle = '#426356'
  context.font = '400 27px sans-serif'
  context.fillText(`Giọng đọc: ${video.voice}`, 58, 590)
  context.fillStyle = '#183d31'
  context.font = '500 30px sans-serif'
  const body = video.script.replace(/\s+/g, ' ')
  let bodyLine = ''
  let bodyY = 730
  body.split(' ').forEach((word) => {
    const nextLine = `${bodyLine}${word} `
    if (context.measureText(nextLine).width > 600) {
      context.fillText(bodyLine.trim(), 58, bodyY)
      bodyLine = `${word} `
      bodyY += 46
    } else bodyLine = nextLine
  })
  context.fillText(bodyLine.trim(), 58, bodyY)

  const stream = canvas.captureStream(24)
  try {
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks: BlobPart[] = []
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    recorder.onerror = () => {
      stream.getTracks().forEach((track) => track.stop())
      onToast('Không thể tạo video trên trình duyệt này.')
    }
    recorder.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks, { type: mimeType }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${slugify(video.title)}.webm`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      stream.getTracks().forEach((track) => track.stop())
      onToast('Đã tải video demo định dạng WebM.')
    }
    recorder.start()
    window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, 1800)
  } catch {
    stream.getTracks().forEach((track) => track.stop())
    onToast('Không thể tạo video trên trình duyệt này.')
  }
}

export default function Library({ videos = [], onDelete, onToast }: LibraryProps)  {
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<VideoRecord | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackTime, setPlaybackTime] = useState(0)

  useEffect(() => {
    if (!selectedVideo || !isPlaying) return
    const interval = window.setInterval(() => {
      setPlaybackTime((time) => Math.min(30, time + 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [selectedVideo, isPlaying])

  useEffect(() => {
    if (playbackTime >= 30) setIsPlaying(false)
  }, [playbackTime])

  useEffect(() => {
    if (!selectedVideo && !pendingDelete) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (pendingDelete) setPendingDelete(null)
      else closePreview()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [selectedVideo, pendingDelete])

  function openPreview(video: VideoRecord) {
    setSelectedVideo(video)
    setPlaybackTime(0)
    setIsPlaying(true)
  }

  function closePreview() {
    setSelectedVideo(null)
    setIsPlaying(false)
  }

  function confirmDelete() {
    if (!pendingDelete) return
    if (selectedVideo?.id === pendingDelete.id) closePreview()
    onDelete(pendingDelete.id)
    setPendingDelete(null)
  }

  function formatTime(seconds: number) {
    return `0:${String(seconds).padStart(2, '0')}`
  }

  const captionSegments = selectedVideo?.script.split(/\n{2,}/).filter(Boolean) ?? []
  const activeCaption = captionSegments[Math.min(captionSegments.length - 1, Math.floor(playbackTime / 30 * captionSegments.length))] ?? ''

  return (
    <section className="library-page">
      <div className="library-toolbar"><div><h2>Video của bạn</h2><p>{videos.length} video trong thư viện</p></div><span className="library-sort">Mới nhất trước</span></div>
      {videos.length > 0 ? <div className="video-grid">
        {videos.map((video, index) => <article className="video-card" key={video.id} style={{ animationDelay: `${index * 65}ms` }} onClick={(event) => { if (!(event.target as HTMLElement).closest('button')) openPreview(video) }}>
          <button className="video-thumbnail" onClick={() => openPreview(video)} aria-label={`Xem trước ${video.title}`}><img src={video.image} alt="" loading="lazy" /><span className="video-length">00:30</span><span className="play-overlay"><Play size={20} fill="currentColor" /></span></button>
          <div className="video-card-body"><div className="video-card-title"><span className="video-status-dot" /><h3>{video.title}</h3></div><p>{video.date} <span>·</span> {video.credits} credits</p><div className="video-card-actions"><button className="button button-subtle" onClick={() => openPreview(video)}><Play size={15} />Xem trước</button><button className="icon-button" onClick={() => downloadMockVideo(video, onToast)} title="Tải video" aria-label={`Tải video ${video.title}`}><Download size={16} /></button><button className="icon-button delete-button" onClick={() => setPendingDelete(video)} title="Xóa video" aria-label={`Xóa video ${video.title}`}><Trash2 size={16} /></button></div></div>
        </article>)}
      </div> : <div className="empty-state"><span><Clapperboard size={24} /></span><h2>Kho video đang trống</h2><p>Video bạn tạo sẽ xuất hiện ở đây.</p></div>}

      {selectedVideo && <div className="preview-backdrop" role="presentation" onClick={closePreview}><section className="preview-dialog preview-dialog-wide" role="dialog" aria-modal="true" aria-label={`Xem trước ${selectedVideo.title}`} onClick={(event) => event.stopPropagation()}>
        <div className="preview-dialog-top"><div><span className="product-category">BẢN XEM TRƯỚC · VIDEO DEMO</span><h2>{selectedVideo.title}</h2></div><button className="icon-button" onClick={closePreview} aria-label="Đóng"><X size={19} /></button></div>
        <div className="preview-layout">
          <div className="preview-player-column"><div className={`video-player${isPlaying ? ' is-playing' : ''}`}><img className="player-background" src={selectedVideo.image} alt="" /><div className="player-shade" /><div className="player-brand">AFFIVIDEO <span>AI</span></div><div className="player-product-copy"><span className="player-category">{selectedVideo.price}</span><h3>{selectedVideo.title}</h3></div><div className="player-subtitle" key={`${selectedVideo.id}-${Math.floor(playbackTime / 8)}`}>{activeCaption}</div><span className="player-watermark">AFFIVIDEO AI</span><div className="player-controls"><button className="player-play-button" onClick={() => { if (playbackTime >= 30) setPlaybackTime(0); setIsPlaying((playing) => !playing) }} aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}>{isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button><span className="player-time">{formatTime(playbackTime)} / 0:30</span><div className="player-progress"><span style={{ width: `${playbackTime / 30 * 100}%` }} /></div><VolumeX size={16} className="player-muted-icon" aria-label="Video demo không có âm thanh" /></div></div><p className="preview-note"><VolumeX size={14} /> Bản dựng xem trước mô phỏng · Không có âm thanh thực</p></div>
          <aside className="preview-details"><div className="preview-detail-kicker"><FileText size={15} /> CHI TIẾT VIDEO</div><h3>{selectedVideo.title}</h3><p className="preview-created-date"><CalendarDays size={15} />Ngày tạo: {selectedVideo.date}</p><div className="preview-detail-meta"><span>{selectedVideo.voice}</span><span>{selectedVideo.credits} credits</span></div><div className="preview-script-heading"><h4>Nội dung kịch bản</h4><span>{selectedVideo.script.trim().split(/\s+/).filter(Boolean).length} từ</span></div><pre className="preview-script">{selectedVideo.script}</pre></aside>
        </div>
      </section></div>}

      {pendingDelete && <div className="confirm-backdrop" role="presentation" onClick={() => setPendingDelete(null)}><section className="delete-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" onClick={(event) => event.stopPropagation()}><span className="delete-confirm-icon"><AlertTriangle size={21} /></span><h2 id="delete-confirm-title">Xóa video khỏi kho?</h2><p>Bạn có chắc chắn muốn xóa video này không?</p><strong>{pendingDelete.title}</strong><div className="delete-confirm-actions"><button className="button button-outline" onClick={() => setPendingDelete(null)}>Hủy</button><button className="button button-danger" onClick={confirmDelete}><Trash2 size={15} />Xóa video</button></div></section></div>}
    </section>
  )
}
