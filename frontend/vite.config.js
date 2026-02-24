import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        strictPort: true,
        port: 5173,
        watch: {
            usePolling: true,
        },
        // In dev mode, proxy /api to the backend. In production, Nginx handles this.
        proxy: mode === 'development' ? {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
        } : undefined,
    }
}))
