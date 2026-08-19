import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/ProxyChain/ on GitHub Pages.
  // Overridable so local dev and other hosts (Vercel, root domain) still work.
  base: process.env.VITE_BASE ?? "/ProxyChain/",
  plugins: [react(), tailwindcss()],
})
