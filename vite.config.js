import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // pdf.js dimuat lazy (hanya saat sertifikat dibuka), jadi chunk-nya memang besar.
  build: { chunkSizeWarningLimit: 1500 },
})
