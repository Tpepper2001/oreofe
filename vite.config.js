import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This allows you to test the app on your mobile phone 
    // by visiting your computer's IP address (e.g., http://192.168.1.5:5173)
    host: true,
    port: 5173,
  },
  build: {
    // Ensures the build is optimized for production on Vercel
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Splitting heavy libraries into separate files for faster loading
          vendor: ['react', 'react-dom', 'recharts', 'lucide-react'],
        },
      },
    },
  },
  // Ensure environment variables are handled correctly
  define: {
    'process.env': {}
  }
})
