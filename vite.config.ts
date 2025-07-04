import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Google AI
            if (id.includes('@google/generative-ai')) {
              return 'ai-vendor';
            }
            // Charts and visualization
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts-vendor';
            }
            // Code highlighting
            if (id.includes('highlight.js') || id.includes('prismjs') || id.includes('refractor')) {
              return 'highlight-vendor';
            }
            // Other large libraries
            if (id.includes('react-router') || id.includes('@tanstack')) {
              return 'router-vendor';
            }
            // Everything else
            return 'vendor';
          }

          // App chunks
          if (id.includes('src/pages/admin')) {
            return 'admin-pages';
          }
          if (id.includes('src/pages')) {
            return 'pages';
          }
          if (id.includes('src/components/admin')) {
            return 'admin-components';
          }
          if (id.includes('src/components/ui')) {
            return 'ui-components';
          }
          if (id.includes('src/services')) {
            return 'services';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
})
