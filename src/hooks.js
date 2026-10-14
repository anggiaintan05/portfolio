import { useEffect, useState } from 'react'

export function useStored(key, initial, valid) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); if (s && (!valid || valid.includes(s))) return s } catch (e) {}
    return initial
  })
  useEffect(() => { try { localStorage.setItem(key, v) } catch (e) {} }, [key, v])
  return [v, setV]
}

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  })
}
