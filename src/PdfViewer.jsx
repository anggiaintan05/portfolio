import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon.jsx'
import { loadPdfjs } from './pdf.js'

const ZOOMS = [1, 1.25, 1.5, 2, 2.5]
const MAX_PIXELS = 12e6 // batas ukuran canvas agar aman di iOS/Android

// Viewer PDF layar penuh. Dirender dengan pdf.js (canvas) supaya konsisten di desktop, Android, dan iOS
// (iframe/embed PDF tidak andal di mobile). Tombol Back/Escape/tombol back Android menutup viewer.
export default function PdfViewer({ file, title, labels, onClose }) {
  const bodyRef = useRef(null)
  const closeBtn = useRef(null)
  const canvases = useRef([])
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const [doc, setDoc] = useState(null)
  const [status, setStatus] = useState('loading')
  const [zi, setZi] = useState(0)
  const [width, setWidth] = useState(0)

  const requestClose = () => {
    if (window.history.state && window.history.state.viewer) window.history.back()
    else onCloseRef.current()
  }

  // kunci scroll halaman, Escape, tombol back (popstate), fokus awal
  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    window.history.pushState({ internal: true, viewer: true }, '')
    const onPop = () => onCloseRef.current()
    const onKey = (e) => { if (e.key === 'Escape') requestClose() }
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    closeBtn.current && closeBtn.current.focus()
    return () => {
      html.style.overflow = prev
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // muat dokumen
  useEffect(() => {
    let cancelled = false, task = null
    setStatus('loading'); setDoc(null)
    loadPdfjs()
      .then((lib) => { task = lib.getDocument({ url: file }); return task.promise })
      .then((d) => { if (cancelled) return; setDoc(d); setStatus('ready') })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true; if (task) task.destroy() }
  }, [file])

  // ukur lebar area baca
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    if (!('ResizeObserver' in window)) { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure) }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // render semua halaman ke canvas (ulang saat zoom / ukuran berubah)
  useEffect(() => {
    if (!doc || !width) return
    let cancelled = false
    const tasks = []
    const base = Math.min(width - 32, 980)
    ;(async () => {
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n)
        if (cancelled) return
        const cv = canvases.current[n - 1]
        if (!cv) continue
        const v1 = page.getViewport({ scale: 1 })
        const cssScale = (base * ZOOMS[zi]) / v1.width
        let out = Math.min(window.devicePixelRatio || 1, 2)
        const px = v1.width * cssScale * out * (v1.height * cssScale * out)
        if (px > MAX_PIXELS) out *= Math.sqrt(MAX_PIXELS / px)
        const vp = page.getViewport({ scale: cssScale * out })
        cv.width = Math.floor(vp.width)
        cv.height = Math.floor(vp.height)
        cv.style.width = Math.floor(v1.width * cssScale) + 'px'
        cv.style.height = Math.floor(v1.height * cssScale) + 'px'
        const task = page.render({ canvasContext: cv.getContext('2d'), viewport: vp })
        tasks.push(task)
        try { await task.promise } catch (e) { /* dibatalkan saat zoom/tutup */ }
      }
    })()
    return () => { cancelled = true; tasks.forEach((t) => t.cancel()) }
  }, [doc, width, zi])

  return createPortal(
    <div className="viewer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="viewer-bar">
        <button ref={closeBtn} type="button" className="vbtn" onClick={requestClose} aria-label={labels.close}><Icon name="close" /></button>
        <span className="viewer-title">{title}</span>
        <div className="viewer-actions">
          {status === 'ready' && (
            <>
              <button type="button" className="vbtn" disabled={zi === 0} onClick={() => setZi(zi - 1)} aria-label={labels.zoomOut}><Icon name="minus" /></button>
              <span className="zoom-val">{Math.round(ZOOMS[zi] * 100)}%</span>
              <button type="button" className="vbtn" disabled={zi === ZOOMS.length - 1} onClick={() => setZi(zi + 1)} aria-label={labels.zoomIn}><Icon name="plus" /></button>
            </>
          )}
          <a className="vbtn" href={file} target="_blank" rel="noopener noreferrer" aria-label={labels.newTab}><Icon name="ext" /></a>
          <a className="vbtn hide-sm" href={file} download aria-label={labels.download}><Icon name="download" /></a>
        </div>
      </div>
      <div className="viewer-body" ref={bodyRef}>
        {status === 'loading' && <div className="viewer-msg"><span className="spin" />{labels.loading}</div>}
        {status === 'error' && (
          <div className="viewer-msg">
            <p>{labels.error}</p>
            <a className="btn primary" href={file} target="_blank" rel="noopener noreferrer">{labels.newTab} <Icon name="ext" size={16} /></a>
          </div>
        )}
        {status === 'ready' && doc && (
          <div className="pages">
            {Array.from({ length: doc.numPages }, (_, i) => <canvas key={i} ref={(el) => { canvases.current[i] = el }} />)}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
