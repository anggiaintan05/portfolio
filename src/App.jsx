import { useEffect, useState } from 'react'
import { content } from './content.js'
import { LINKS, PROJECTS, PROJECTS_VISIBLE, CERT_FILES, PHOTO } from './config.js'
import { useStored, useReveal } from './hooks.js'
import { Section, Navbar, HeroPhoto, ProjectCard, TimelineItem } from './components.jsx'
import { TOOLS } from './tools.js'
import Icon from './Icon.jsx'

function ToolItem({ tool }) {
  const [broken, setBroken] = useState(false)
  return (
    <li className="tool reveal">
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
  const t = content[lang]
  const shown = showAll ? PROJECTS : PROJECTS.slice(0, PROJECTS_VISIBLE)
  const toggleProjects = () => {
    if (showAll) document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
    setShowAll(!showAll)
  }
  useReveal()
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { document.documentElement.lang = lang }, [lang])

  return (
    <>
      <Navbar t={t} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} />
      <main id="top">
        <header className="hero">
          <div className="container hero-in">
            <div className="hero-text">
              <p className="eyebrow">{t.hero.hi}</p>
              <h1 className="name">Anggia Intan Widyaningrum</h1>
              <h2 className="headline">{t.hero.lines.map((l, i) => <span key={i}>{l}</span>)}</h2>
              <p className="roles">UI/UX Designer <i>|</i> System Analyst <i>|</i> Frontend Developer</p>
              <p className="lead">{t.hero.desc}</p>
              <div className="cta">
                <a className="btn primary" href="#projects">{t.hero.cta1} <Icon name="arrow" /></a>
                <a className="btn ghost" href="#contact">{t.hero.cta2}</a>
              </div>
              <p className="open-badge"><i />{t.hero.badge}</p>
            </div>
            <HeroPhoto src={PHOTO} />
          </div>
        </header>

        <Section id="about" title={t.about.title} sub={t.about.sub} alt>
          <div className="about-grid">
            <div className="card profile reveal">
              <h4>{t.about.profileTitle}</h4>
              <dl>{t.about.profile.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </div>
            <div className="card profile reveal">
              <h4>{t.about.certTitle}</h4>
              <ul className="certs">
                {t.about.certs.map((c) => (
                  <li key={c.key}>
                    <div><strong>{c.name}</strong><small>{c.year}</small></div>
                    <a href={CERT_FILES[c.key]} target="_blank" rel="noopener noreferrer"><Icon name="file" size={16} /> {t.about.viewPdf}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section id="tools" title={t.tools.title} sub={t.tools.sub}>
          <ul className="tools-grid">{TOOLS.map((tool) => <ToolItem key={tool.name} tool={tool} />)}</ul>
        </Section>

        <Section id="projects" title={t.projects.title} sub={t.projects.sub} alt>
          <div className="proj-grid">{shown.map((p) => <ProjectCard key={p.id} p={p} lang={lang} t={t.projects} />)}</div>
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
              <ol className="timeline">{t.exp[k].map((e) => <TimelineItem key={e.role} e={e} />)}</ol>
            </div>
          ))}
        </Section>

        <section id="contact" className="section alt">
          <div className="container">
            <div className="contact-card reveal">
              <span className="glow g1" /><span className="glow g2" />
              <h2>{t.contact.title}</h2>
              <p>{t.contact.sub}</p>
              <div className="contact-actions">
                <ContactButton href={'mailto:' + LINKS.email} icon="mail" label="Email" />
                <ContactButton href={LINKS.linkedin} icon="linkedin" label="LinkedIn" external />
                <ContactButton href={LINKS.behance} icon="behance" label="Behance" external />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer"><div className="container">© {new Date().getFullYear()} Anggia Intan Widyaningrum. {t.contact.rights}</div></footer>
    </>
  )
}
