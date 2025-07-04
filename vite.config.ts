import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      react({
        // Optimize JSX in production
        jsxRuntime: 'automatic',
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: 8080,
      host: true,
      // Enable HMR for better development experience
      hmr: {
        overlay: true,
      },
    },

    build: {
      // Production optimizations - use esbuild for faster builds and avoid Rollup native issues
      minify: isProduction ? 'esbuild' : false,
      sourcemap: isDevelopment ? 'inline' : false,
      cssMinify: false, // CSS minification handled by PostCSS
      target: 'es2020',

      // ESBuild options for better compression and faster builds
      esbuild: isProduction ? {
        drop: ['console', 'debugger'],
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
      } : undefined,

      rollupOptions: {
        // Force Rollup to use JS fallback instead of native binaries
        // This fixes the @rollup/rollup-linux-x64-gnu issue on Vercel
        external: isProduction ? [] : [],

        output: {
          // Enhanced manual chunks for better caching
          manualChunks: (id) => {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }

            // React Router
            if (id.includes('react-router')) {
              return 'router-vendor'
            }

            // UI Libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor'
            }

            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }

            // Utility libraries
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
              return 'utils-vendor'
            }

            // AI/ML libraries
            if (id.includes('@google/generative-ai') || id.includes('openai')) {
              return 'ai-vendor'
            }

            // Charts and visualization
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor'
            }

            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms-vendor'
            }

            // Other large node_modules
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },

          // Optimize chunk naming for caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              const fileName = path.basename(facadeModuleId, path.extname(facadeModuleId))
              return `chunks/${fileName}-[hash].js`
            }
            return 'chunks/[name]-[hash].js'
          },

          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]

            if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash].[ext]'
            }

            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return 'assets/fonts/[name]-[hash].[ext]'
            }

            if (ext === 'css') {
              return 'assets/styles/[name]-[hash].[ext]'
            }

            return 'assets/[name]-[hash].[ext]'
          },
        },

        // External dependencies (for CDN usage if needed)
        external: isProduction ? [] : [],
      },

      // Increase chunk size warning limit for production
      chunkSizeWarningLimit: isProduction ? 1000 : 500,

      // Enable CSS code splitting
      cssCodeSplit: true,

      // Report compressed file sizes
      reportCompressedSize: isProduction,

      // Output directory
      outDir: 'dist',

      // Clean output directory before build
      emptyOutDir: true,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'clsx',
        'tailwind-merge',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },

    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
          ...(isProduction ? [
            cssnano({
              preset: ['default', {
                discardComments: {
                  removeAll: true,
                },
                normalizeWhitespace: true,
                minifySelectors: true,
                mergeLonghand: false,
                mergeRules: false,
              }]
            }),
          ] : []),
        ],
      },
    },

    // Define global constants
    define: {
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.ROLLUP_NO_NATIVE': JSON.stringify('true'),
    },

    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },
  }
})
