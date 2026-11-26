// pdf.js dimuat lazy: hanya diunduh saat halaman sertifikat dibuka / folder di-hover.
let lib = null

export function loadPdfjs() {
  if (!lib) {
    lib = Promise.all([
      import('pdfjs-dist/build/pdf'),
      import('pdfjs-dist/build/pdf.worker.min.js?url'),
    ]).then(([mod, worker]) => {
      const pdfjs = mod.getDocument ? mod : mod.default
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      return pdfjs
    })
    lib.catch(() => { lib = null })
  }
  return lib
}

export function preloadPdf() { loadPdfjs().catch(() => {}) }
