// Membuat thumbnail (halaman 1) untuk setiap PDF di public/certificates -> public/certificates/thumbs/<nama>.jpg
// Dijalankan otomatis oleh `npm run dev` dan `npm run build` (juga di Vercel). Hanya memproses PDF baru/yang berubah.
// Script ini tidak pernah menggagalkan build: kalau ada masalah, website tetap jalan (ikon PDF dipakai sebagai cadangan).
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'public', 'certificates')
const out = path.join(dir, 'thumbs')
const MAX_WIDTH = 900

async function main() {
  if (!existsSync(dir)) return
  const files = (await readdir(dir)).filter((f) => /\.pdf$/i.test(f))
  const todo = []
  for (const f of files) {
    const src = path.join(dir, f)
    const dest = path.join(out, f.replace(/\.pdf$/i, '.jpg'))
    if (existsSync(dest) && (await stat(dest)).mtimeMs >= (await stat(src)).mtimeMs) continue
    todo.push([src, dest, f])
  }
  if (!todo.length) { console.log('[thumbs] semua thumbnail sudah terbaru'); return }

  let pdf, canvas
  try {
    ({ pdf } = await import('pdf-to-img'))
    canvas = await import('@napi-rs/canvas')
  } catch (e) { console.warn('[thumbs] dilewati (library belum terpasang): ' + e.message); return }

  await mkdir(out, { recursive: true })
  for (const [src, dest, name] of todo) {
    try {
      const doc = await pdf(src, { scale: 1.5 })
      for await (const page of doc) {
        const img = await canvas.loadImage(page)
        const w = Math.min(MAX_WIDTH, img.width)
        const h = Math.round((img.height * w) / img.width)
        const cv = canvas.createCanvas(w, h)
        const ctx = cv.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        await writeFile(dest, cv.toBuffer('image/jpeg', 82))
        break // cukup halaman pertama
      }
      console.log('[thumbs] dibuat: ' + name)
    } catch (e) { console.warn('[thumbs] gagal untuk ' + name + ': ' + e.message) }
  }
}

main().catch((e) => console.warn('[thumbs] dilewati: ' + e.message))
