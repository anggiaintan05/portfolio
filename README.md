# Anggia Intan Widyaningrum — Portfolio (React + Vite)

## Jalankan
```
npm install
npm run dev      # http://localhost:5173
npm run build    # output ke /dist
```

## Isi yang perlu diganti
- `src/config.js` → link Behance (profil + 3 proyek), path thumbnail, path PDF sertifikat.
- Letakkan gambar di `public/thumbnails/` (homy-laundry.png, web-ti-redesign.png, web-absensi-ksatriyan.png).
- Letakkan PDF di `public/certificates/` (bnsp-csa.pdf, certiport-html-css.pdf).
- Teks ID/EN ada di `src/content.js`.

## Deploy ke Vercel
1. Push folder ini ke GitHub.
2. vercel.com → Add New → Project → import repo.
3. Framework: Vite (otomatis). Build: `npm run build`, Output: `dist`. Klik Deploy.
(Alternatif: `npm i -g vercel && vercel`.)
