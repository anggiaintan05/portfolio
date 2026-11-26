import { useCallback, useEffect, useState } from 'react'

export function useStored(key, initial, valid) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); if (s && (!valid || valid.includes(s))) return s } catch (e) {}
    return initial
  })
  useEffect(() => { try { localStorage.setItem(key, v) } catch (e) {} }, [key, v])
  return [v, setV]
}

// Menandai elemen .reveal saat masuk layar. Aman dipanggil di setiap render (hanya elemen yang belum 'in').
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  })
}

export function useMedia(query, initial) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : initial)
  const [v, setV] = useState(get)
  useEffect(() => {
    if (!window.matchMedia) return
    const m = window.matchMedia(query)
    const on = () => setV(m.matches)
    on()
    if (m.addEventListener) m.addEventListener('change', on); else m.addListener(on)
    return () => { if (m.removeEventListener) m.removeEventListener('change', on); else m.removeListener(on) }
  }, [query])
  return v
}
// true di desktop (mouse), false di HP/tablet touch
export const useCanHover = () => useMedia('(hover: hover) and (pointer: fine)', true)
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)', false)

// Efek mengetik + menghapus, bergantian antar kata.
export function useTypewriter(words, { type = 80, erase = 40, hold = 1700, gap = 320, enabled = true } = {}) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!enabled) return
    let i = 0, n = 0, dir = 1, t
    const tick = () => {
      const w = words[i]
      n += dir
      setText(w.slice(0, n))
      let d = dir === 1 ? type + Math.random() * 40 : erase
      if (dir === 1 && n === w.length) { dir = -1; d = hold }
      else if (dir === -1 && n === 0) { dir = 1; i = (i + 1) % words.length; d = gap }
      t = setTimeout(tick, d)
    }
    t = setTimeout(tick, 500)
    return () => clearTimeout(t)
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps
  return text
}

const clean = (p) => p.replace(/\/+$/, '') || '/'

// Router mini (History API) — cukup untuk 2 halaman, tanpa library tambahan.
export function useRoute() {
  const [path, setPath] = useState(() => clean(window.location.pathname))
  useEffect(() => {
    const on = () => setPath(clean(window.location.pathname))
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])
  const go = useCallback((to) => {
    window.history.pushState({ internal: true }, '', to)
    setPath(clean(to))
  }, [])
  const back = useCallback(() => {
    if (window.history.state && window.history.state.internal) window.history.back()
    else { window.history.replaceState({ internal: true }, '', '/'); setPath('/') }
  }, [])
  return { path, go, back }
}
