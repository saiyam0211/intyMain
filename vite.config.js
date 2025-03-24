import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173, // or whatever port you are using
    strictPort: true,
    allowedHosts: ["inty-3-1.onrender.com"], // Add your Render domain here
  },
  plugins: [
    tailwindcss(),
    react()
  ],
  
})
