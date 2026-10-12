import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Penelope's iPad may be on an older iPadOS. Compile modern syntax (e.g.
    // three.js's class static blocks, Safari 16.4+) down so Safari 14+ can
    // still run the app; otherwise one unsupported line blanks the page.
    target: ['es2020', 'safari14'],
  },
})
