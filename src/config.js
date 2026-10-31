// ✏️ EDIT THIS FILE to plug in your real links and files.
// Put your photo at /public/photo.jpg (portrait works best, ~4:5) or change this path.
export const PHOTO = '/photo.jpg'

export const LINKS = {
  email: 'anggiaintanw@gmail.com',
  linkedin: 'https://www.linkedin.com/in/anggia-intan-widyaningrum-95269b2b1/',
  behance: 'https://www.behance.net/anggiawidyani',
}

// Put thumbnails in /public/thumbnails and set the file name in `image`.
// Until the image exists, a clear placeholder is displayed.
// How many projects show before the "See more" button (button auto-hides if there are no more).
export const PROJECTS_VISIBLE = 3

export const PROJECTS = [
  { id: 'homy', name: 'Homy Laundry App', tag: { en: 'Mobile App · UI/UX', id: 'Aplikasi Mobile · UI/UX' },
    image: '/thumbnails/homy-laundry.png', url: 'https://www.behance.net/gallery/257034275/Homy-Laundry-App' },
  { id: 'moneymate', name: 'MoneyMate', tag: { en: 'Mobile App · UI/UX', id: 'Aplikasi Mobile · UI/UX' },
  image: '/thumbnails/moneymate.png', url: 'https://www.behance.net/gallery/257812475/MoneyMate' },
  { id: 'ti', name: 'Web TI Redesign', tag: { en: 'Website Redesign · UI/UX', id: 'Redesain Website · UI/UX' },
    image: '/thumbnails/web-ti-redesign.png', url: 'https://www.behance.net/gallery/257034613/UMY-Information-Technology-Website-Redesign' },
  { id: 'absensi', name: 'Web Absensi Ksatriyan', tag: { en: 'Web App · Frontend', id: 'Aplikasi Web · Frontend' },
    image: '/thumbnails/web-absensi-ksatriyan.png', url: 'https://www.behance.net/gallery/257034903/Kesatriyan-Attendance-System-Redesign' },
  // 👇 NEW PROJECT: replace name, tag, image file and Behance URL. Add more projects the same way.
  { id: 'marketchain', name: 'MarketChain', tag: { en: 'Web App · Full-Stack', id: 'Aplikasi Web · Full-Stack' },
    image: '/thumbnails/marketchain.png', url: 'https://www.behance.net/gallery/257105805/MarketChain' },
]

// Put PDFs in /public/certificates with these names (or change the paths).
export const CERT_FILES = { bnsp: '/certificates/bnsp-csa.pdf', certiport: '/certificates/certiport-html-css.pdf', bootcamp: '/certificates/bootcamp-2025.pdf' }
