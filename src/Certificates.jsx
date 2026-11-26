import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import PdfViewer from './PdfViewer.jsx'
import { useCanHover } from './hooks.js'
import { loadPdfjs, preloadPdf } from './pdf.js'

// Ikon file PDF (SVG) — dipakai ulang di halaman koleksi.
export function FileIcon() {
  return (
    <svg className="fileicon" viewBox="0 0 56 72" aria-hidden="true">
      <path className="fi-page" d="M6 2h30l16 16v50a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path className="fi-fold" d="M36 2v14a2 2 0 002 2h14z" />
      <path className="fi-line" d="M11 27h18 M11 33h30" />
      <rect className="fi-tag" x="10" y="42" width="28" height="15" rx="4" />
      <text className="fi-txt" x="24" y="52.8" textAnchor="middle">PDF</text>
    </svg>
  )
}

// Render halaman 1 PDF ke <canvas> di browser (cadangan kalau file thumbnail .jpg tidak ada).
function PdfFirstPage({ file, className, onFail }) {
  const ref = useRef(null)
  useEffect(() => {
    let cancelled = false, task = null, render = null
    ;(async () => {
      try {
        const lib = await loadPdfjs()
        task = lib.getDocument({ url: file })
        const doc = await task.promise
        const page = await doc.getPage(1)
        if (cancelled) return
        const v1 = page.getViewport({ scale: 1 })
        const vp = page.getViewport({ scale: Math.min(2, 720 / v1.width) })
        const cv = ref.current
        cv.width = Math.floor(vp.width)
        cv.height = Math.floor(vp.height)
        render = page.render({ canvasContext: cv.getContext('2d'), viewport: vp })
        await render.promise
      } catch (e) { if (!cancelled) onFail() }
    })()
    return () => { cancelled = true; if (render) render.cancel(); if (task) task.destroy() }
  }, [file]) // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} className={className} />
}

// Urutan: gambar thumbnail (.jpg) -> render dari PDF di browser -> ikon PDF.
function useThumbMode(src, file) {
  const [mode, setMode] = useState(src ? 'img' : file ? 'pdf' : 'icon')
  const fail = () => setMode((m) => (m === 'img' && file ? 'pdf' : 'icon'))
  return [mode, fail]
}

function CertThumb({ src, file }) {
  const [mode, fail] = useThumbMode(src, file)
  const [seen, setSeen] = useState(false)
  const box = useRef(null)
  // render PDF hanya saat kartu terlihat di layar (hemat memori)
  useEffect(() => {
    if (mode !== 'pdf' || seen) return
    if (!('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: '200px' })
    io.observe(box.current)
    return () => io.disconnect()
  }, [mode, seen])
  return (
    <span className="cfile-thumb" ref={box}>
      {mode === 'img' && <img src={src} alt="" loading="lazy" draggable="false" onError={fail} />}
      {mode === 'pdf' && seen && <PdfFirstPage file={file} onFail={fail} />}
      {(mode === 'icon' || (mode === 'pdf' && !seen)) && <FileIcon />}
    </span>
  )
}

function PaperThumb({ src, file }) {
  const [mode, fail] = useThumbMode(src, file)
  if (mode === 'img') return <img className="cf-img" src={src} alt="" draggable="false" onError={fail} />
  if (mode === 'pdf') return <PdfFirstPage file={file} className="cf-img" onFail={fail} />
  return null
}

// Folder interaktif.
// Desktop (hover): hover = folder terbuka + file keluar, klik = buka koleksi.
// Mobile/touch: tap pertama = folder terbuka, tap kedua (atau tombol) = buka koleksi.
export function CertFolder({ count, thumbs = [], files = [], hintHover, hintTap, cta, ariaLabel, onOpen }) {
  const canHover = useCanHover()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const click = () => { if (canHover || open) onOpen(); else setOpen(true) }

  return (
    <div className={'cfolder' + (open ? ' open' : '')} ref={ref}>
      <button type="button" className="cf-btn" onClick={click} onPointerEnter={preloadPdf} aria-label={ariaLabel}>
        <span className="cf-stage" aria-hidden="true">
          <span className="cf-back" />
          {[1, 2, 3].map((n) => (
            <span key={n} className={'cf-paper p' + n}><i className="cf-pdf">PDF</i><b /><b /><b /><PaperThumb src={thumbs[n - 1]} file={files[n - 1]} /></span>
          ))}
          <span className="cf-front"><span className="cf-count">{count}</span></span>
        </span>
      </button>
      <p className="cf-hint">{canHover ? hintHover : hintTap}</p>
      <button type="button" className="btn ghost sm cf-cta" onClick={onOpen}>{cta} <Icon name="arrow" size={15} /></button>
    </div>
  )
}

// Halaman koleksi sertifikat.
export default function CertificatesPage({ t, certs }) {
  const [active, setActive] = useState(-1)
  const opener = useRef(null)

  useEffect(() => { const id = setTimeout(preloadPdf, 500); return () => clearTimeout(id) }, [])

  const close = () => {
    setActive(-1)
    if (opener.current && opener.current.focus) opener.current.focus({ preventScroll: true })
  }

  return (
    <main className="cert-page">
      <div className="container">
        <header className="cert-head">
          <p className="eyebrow">{t.certs.eyebrow}</p>
          <h1>{t.certs.title}</h1>
          <p className="cert-sub">{t.certs.sub}</p>
          <span className="count-chip"><Icon name="folder" size={15} /> {certs.length} {t.about.files}</span>
        </header>
        <ul className="cfile-grid">
          {certs.map((c, i) => (
            <li key={c.key} className="reveal" style={{ '--d': i * 90 + 'ms' }}>
              <button type="button" className="cfile" onPointerEnter={preloadPdf}
                onClick={(e) => { opener.current = e.currentTarget; setActive(i) }}>
                <CertThumb src={c.thumb} file={c.file} />
                <span className="cfile-meta"><strong>{c.name}</strong><small>{c.year} · PDF</small></span>
                <span className="cfile-go"><span>{t.certs.open}</span><Icon name="expand" size={16} /></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {active >= 0 && <PdfViewer file={certs[active].file} title={certs[active].name} labels={t.certs} onClose={close} />}
    </main>
  )
}
