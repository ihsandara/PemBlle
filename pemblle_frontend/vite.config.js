import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://api.pemblle.ink',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'https://api.pemblle.ink',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://api.pemblle.ink',
                ws: true
            }
        }
    }
})
