import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'

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

export function Navbar({ t, theme, setTheme, lang, setLang }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const ids = ['about', 'tools', 'projects', 'experience', 'contact']

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
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting && window.scrollY >= 200) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    ;ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="container nav-in">
        <span className="nav-spacer" />
        <ul className={'nav-links' + (open ? ' open' : '')}>
          {ids.map((id) => (
            <li key={id}>
              <a href={'#' + id} className={active === id ? 'active' : ''} aria-current={active === id ? 'true' : undefined} onClick={() => setOpen(false)}>{t.nav[id]}</a>
            </li>
          ))}
        </ul>
        <div className="nav-tools">
          <div className="seg" role="group" aria-label="Language">
            {['en', 'id'].map((l) => <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)} aria-pressed={lang === l}>{l.toUpperCase()}</button>)}
          </div>
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button className="icon-btn menu" onClick={() => setOpen(!open)} aria-label="Menu"><Icon name={open ? 'close' : 'menu'} /></button>
        </div>
      </div>
    </nav>
  )
}

export function HeroPhoto({ src }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className="photo-wrap">
      <div className="photo-frame">
        {!broken && <img src={src} alt="Anggia Intan Widyaningrum" onError={() => setBroken(true)} />}
        {broken && <div className="photo-ph"><span>Your photo here</span><small>{src}</small></div>}
      </div>
    </div>
  )
}

export function TimelineItem({ e }) {
  return (
    <li className="tl-item reveal">
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

export function ProjectCard({ p, lang, t }) {
  const [broken, setBroken] = useState(false)
  return (
    <a className="proj reveal" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.name + ' — ' + t.view}>
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
