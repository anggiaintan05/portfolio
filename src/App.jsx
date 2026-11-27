import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { content } from './content.js'
import { LINKS, PROJECTS, PROJECTS_VISIBLE, CERT_FILES, PHOTO, GPA, ROUTES, thumbOf } from './config.js'
import { useStored, useReveal, useRoute } from './hooks.js'
import { Section, Navbar, HeroPhoto, ProjectCard, TimelineItem, TypingText, CountUp, ScrollProgress, BackToTop } from './components.jsx'
import CertificatesPage, { CertFolder } from './Certificates.jsx'
import { TOOLS } from './tools.js'
import Icon from './Icon.jsx'

const ROLES = ['UI/UX Designer', 'System Analyst', 'Frontend Developer']
const HERO_CHIPS = ['UI/UX', 'System Analysis', 'Frontend']

function ToolItem({ tool, i }) {
  const [broken, setBroken] = useState(false)
  return (
    <li className="tool reveal" style={{ '--d': (i % 4) * 70 + 'ms' }}>
      <div className="tool-ic">
        {!broken ? <img src={tool.icon} alt="" loading="lazy" onError={() => setBroken(true)} /> : <span>{tool.initials || tool.name[0]}</span>}
      </div>
      <strong>{tool.name}</strong>
    </li>
  )
}

function ContactButton({ href, icon, label, external }) {
  return (
    <a className="cbtn" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <span className="cbtn-ic"><Icon name={icon} size={20} /></span>
      <span className="cbtn-label">{label}</span>
      <span className="cbtn-go"><Icon name="arrow" size={16} /></span>
    </a>
  )
}

export default function App() {
  const [theme, setTheme] = useStored('theme', 'light', ['light', 'dark'])
  const [lang, setLang] = useStored('lang', 'en', ['en', 'id'])
  const [showAll, setShowAll] = useState(false)
  const { path, go, back } = useRoute()
  const onCerts = path === ROUTES.certs
  const t = content[lang]
  const shown = showAll ? PROJECTS : PROJECTS.slice(0, PROJECTS_VISIBLE)
  const certs = t.about.certs.map((c) => ({ ...c, file: CERT_FILES[c.key], thumb: thumbOf(CERT_FILES[c.key]) }))
  const stats = [
    { to: GPA, dec: 2, label: t.hero.stats[0] },
    { to: PROJECTS.length, dec: 0, label: t.hero.stats[1] },
    { to: t.exp.intern.length, dec: 0, label: t.hero.stats[2] },
    { to: certs.length, dec: 0, label: t.hero.stats[3] },
  ]

  const toggleProjects = () => {
    if (showAll) document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
    setShowAll(!showAll)
  }

  // ingat posisi scroll beranda, lalu kembalikan saat pulang dari halaman sertifikat
  const homeY = useRef(null)
  const prevPath = useRef(path)
  const openCerts = () => { homeY.current = window.scrollY; go(ROUTES.certs) }
  useLayoutEffect(() => {
    if (prevPath.current === path) return
    prevPath.current = path
    if (path === ROUTES.certs) window.scrollTo(0, 0)
    else if (homeY.current !== null) window.scrollTo({ top: homeY.current, left: 0, behavior: 'instant' })
    else document.getElementById('about')?.scrollIntoView()
  }, [path])

  useReveal()
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    document.title = onCerts ? t.certs.title + ' — Anggia Intan Widyaningrum' : 'Anggia Intan Widyaningrum — Portfolio'
  }, [onCerts, t])

  return (
    <>
      <ScrollProgress watch={path} />
      <Navbar key={onCerts ? 'certs' : 'home'} t={t} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} minimal={onCerts} onBack={back} />

      {onCerts ? (
        <CertificatesPage t={t} certs={certs} />
      ) : (
        <main id="top">
          <header className="hero">
            <span className="orb o1" aria-hidden="true" /><span className="orb o2" aria-hidden="true" />
            <div className="container hero-in">
              <div className="hero-text">
                <p className="eyebrow">{t.hero.hi}</p>
                <h1 className="name">Anggia Intan Widyaningrum</h1>
                <h2 className="headline">{t.hero.lines.map((l, i) => <span key={i}>{l}</span>)}</h2>
                <TypingText words={ROLES} />
                <p className="lead">{t.hero.desc}</p>
                <div className="cta">
                  <a className="btn primary" href="#projects">{t.hero.cta1} <Icon name="arrow" /></a>
                  <a className="btn ghost" href="#contact">{t.hero.cta2}</a>
                </div>
                <p className="open-badge"><i />{t.hero.badge}</p>
              </div>
              <HeroPhoto src={PHOTO} chips={HERO_CHIPS} />
            </div>
            <div className="container">
              <ul className="stats">
                {stats.map((s, i) => (
                  <li key={s.label} className="stat reveal" style={{ '--d': i * 80 + 'ms' }}>
                    <strong><CountUp to={s.to} decimals={s.dec} comma={lang === 'id'} /></strong>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <Section id="about" title={t.about.title} sub={t.about.sub} alt>
            <div className="about-grid">
              <div className="card profile reveal">
                <h4>{t.about.profileTitle}</h4>
                <dl>{t.about.profile.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              </div>
              <div className="card profile cert-card reveal" style={{ '--d': '100ms' }}>
                <h4>{t.about.certTitle}</h4>
                <CertFolder
                  count={certs.length + ' ' + (t.about.files || '')}
                  thumbs={certs.slice(0, 3).map((c) => c.thumb)}
                  files={certs.slice(0, 3).map((c) => c.file)}
                  hintHover={t.about.hintHover} hintTap={t.about.hintTap}
                  cta={t.about.openCollection} ariaLabel={t.about.folderAria}
                  onOpen={openCerts}
                />
              </div>
            </div>
          </Section>

          <Section id="tools" title={t.tools.title} sub={t.tools.sub}>
            <ul className="tools-grid">{TOOLS.map((tool, i) => <ToolItem key={tool.name} tool={tool} i={i} />)}</ul>
          </Section>

          <Section id="projects" title={t.projects.title} sub={t.projects.sub} alt>
            <div className="proj-grid">{shown.map((p, i) => <ProjectCard key={p.id} p={p} lang={lang} t={t.projects} i={i} />)}</div>
            {PROJECTS.length > PROJECTS_VISIBLE && (
              <div className="more-wrap">
                <button className="btn ghost" onClick={toggleProjects} aria-expanded={showAll}>
                  {showAll ? t.projects.less : `${t.projects.more} (${PROJECTS.length - PROJECTS_VISIBLE})`}
                  <span className="more-ic" style={{ transform: showAll ? 'rotate(-90deg)' : 'rotate(90deg)' }}><Icon name="arrow" size={16} /></span>
                </button>
              </div>
            )}
          </Section>

          <Section id="experience" title={t.exp.title} sub={t.exp.sub}>
            {[['intern', t.exp.internTitle], ['project', t.exp.projectTitle]].map(([k, title]) => (
              <div className="exp-group" key={k}>
                <h3 className="exp-cat reveal">{title}</h3>
                <ol className="timeline">{t.exp[k].map((e, i) => <TimelineItem key={e.role} e={e} i={i} />)}</ol>
              </div>
            ))}
          </Section>

          <Section id="organization" title={t.org.title} sub={t.org.sub} alt>
            <ol className="timeline">{t.org.items.map((e, i) => <TimelineItem key={e.role} e={e} i={i} />)}</ol>
          </Section>

          <section id="contact" className="section">
            <div className="container">
              <div className="contact-card reveal">
                <span className="glow g1" /><span className="glow g2" />
                <h2>{t.contact.title}</h2>
                <p>{t.contact.sub}</p>
                <div className="contact-actions">
                  <ContactButton href={'mailto:' + LINKS.email} icon="mail" label="Email" />
                  <ContactButton href={LINKS.linkedin} icon="linkedin" label="LinkedIn" external />
                  <ContactButton href={LINKS.behance} icon="behance" label="Behance" external />
                  <ContactButton href={LINKS.github} icon="github" label="GitHub" external />
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <footer className="footer"><div className="container">© {new Date().getFullYear()} Anggia Intan Widyaningrum. {t.contact.rights}</div></footer>
      <BackToTop label={t.ui.top} />
    </>
  )
}
