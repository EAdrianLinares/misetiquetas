import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// La aplicación no depende de ninguna API (ver docs/adr/adr-002-logica-en-frontend.md).
export default defineConfig({
  plugins: [react()],
})
