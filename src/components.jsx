import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { useReducedMotion, useTypewriter } from './hooks.js'

export function Section({ id, title, sub, children, alt }) {
  return (
    <section id={id} className={'section' + (alt ? ' alt' : '')}>
      <div className="container">
        <header className="sec-head reveal"><h2>{title}</h2>{sub && <p>{sub}</p>}</header>
        {children}
      </div>
    </section>
  )
}

export function Badge({ children }) { return <span className="badge">{children}</span> }

const NAV_IDS = ['about', 'tools', 'projects', 'experience', 'organization', 'contact']

export function Navbar({ t, theme, setTheme, lang, setLang, minimal, onBack }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 8)
      if (window.scrollY < 200) setActive('')
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (minimal || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting && window.scrollY >= 200) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    NAV_IDS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [minimal])

  // tutup menu mobile: tekan Escape / ketuk di luar
  useEffect(() => {
    if (!open) return
    const key = (e) => { if (e.key === 'Escape') setOpen(false) }
    const away = (e) => { if (!e.target.closest('.nav')) setOpen(false) }
    window.addEventListener('keydown', key)
    document.addEventListener('pointerdown', away)
    return () => { window.removeEventListener('keydown', key); document.removeEventListener('pointerdown', away) }
  }, [open])

  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="container nav-in">
        {minimal ? (
          <button type="button" className="back-btn" onClick={onBack} aria-label={t.certs.backAria}>
            <Icon name="left" size={18} /><span>{t.certs.back}</span>
          </button>
        ) : <span className="nav-spacer" />}

        {minimal ? (
          <span className="nav-title">{t.certs.title}</span>
        ) : (
          <ul className={'nav-links' + (open ? ' open' : '')}>
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a href={'#' + id} className={active === id ? 'active' : ''} aria-current={active === id ? 'true' : undefined} onClick={() => setOpen(false)}>{t.nav[id]}</a>
              </li>
            ))}
          </ul>
        )}

        <div className="nav-tools">
          <div className="seg" role="group" aria-label="Language">
            {['en', 'id'].map((l) => <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)} aria-pressed={lang === l}>{l.toUpperCase()}</button>)}
          </div>
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          {!minimal && <button className="icon-btn menu" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><Icon name={open ? 'close' : 'menu'} /></button>}
        </div>
      </div>
    </nav>
  )
}

export function HeroPhoto({ src, chips = [] }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className="photo-wrap">
      <div className="photo-frame">
        {!broken && <img src={src} alt="Anggia Intan Widyaningrum" onError={() => setBroken(true)} />}
        {broken && <div className="photo-ph"><span>Your photo here</span><small>{src}</small></div>}
      </div>
      {chips.map((c, i) => <span key={c} className={'chip-float c' + (i + 1)} aria-hidden="true"><i />{c}</span>)}
    </div>
  )
}

// Typewriter: mengetik, menahan, menghapus, lalu pindah ke role berikutnya + blinking cursor.
export function TypingText({ words }) {
  const reduced = useReducedMotion()
  const text = useTypewriter(words, { enabled: !reduced })
  return (
    <p className="roles">
      <span className="sr-only">{words.join(', ')}</span>
      {reduced ? (
        <span aria-hidden="true">{words.map((w, i) => <span key={w}>{i > 0 && <i>|</i>}{w}</span>)}</span>
      ) : (
        <span aria-hidden="true"><span className="typed">{text}</span><span className="caret" /></span>
      )}
    </p>
  )
}

// Angka yang menghitung naik saat masuk layar (tanpa re-render React: langsung ubah textContent).
export function CountUp({ to, decimals = 0, comma = false }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const fmt = (v) => { const s = v.toFixed(decimals); return comma ? s.replace('.', ',') : s }
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced || !('IntersectionObserver' in window)) { el.textContent = fmt(to); return }
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now(), dur = 1100
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur)
        el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [to, decimals, comma, reduced]) // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref}>{fmt(reduced ? to : 0)}</span>
}

export function ScrollProgress({ watch }) {
  const ref = useRef(null)
  useEffect(() => {
    let raf = 0
    const upd = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? Math.min(1, window.scrollY / h) : 0
      if (ref.current) ref.current.style.transform = 'scaleX(' + p + ')'
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(upd) }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [watch])
  return <div className="progress" aria-hidden="true"><span ref={ref} /></div>
}

export function BackToTop({ label }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <button type="button" className={'to-top' + (show ? ' show' : '')} aria-label={label} tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <Icon name="up" size={20} />
    </button>
  )
}

export function TimelineItem({ e, i = 0 }) {
  return (
    <li className="tl-item reveal" style={{ '--d': Math.min(i, 3) * 80 + 'ms' }}>
      <span className="dot" />
      <div className="card">
        {e.period && <time>{e.period}</time>}
        <h3>{e.role}</h3>
        <p className="org">{e.org}{e.place && ' · ' + e.place}</p>
        <ul>{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
      </div>
    </li>
  )
}

export function ProjectCard({ p, lang, t, i = 0 }) {
  const [broken, setBroken] = useState(false)
  return (
    <a className="proj reveal" style={{ '--d': (i % 3) * 90 + 'ms' }} href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.name + ' — ' + t.view}>
      <div className="proj-thumb">
        {!broken && <img src={p.image} alt={p.name} loading="lazy" onError={() => setBroken(true)} />}
        {broken && <div className="proj-ph"><span>{t.ph}</span><small>{p.image}</small></div>}
        <div className="proj-over"><span>{t.view}</span><Icon name="ext" /></div>
      </div>
      <div className="proj-meta"><h3>{p.name}</h3><small>{p.tag[lang]}</small></div>
      <span className="proj-cta">{t.view}<Icon name="ext" size={15} /></span>
    </a>
  )
}
