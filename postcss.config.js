export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // Preserve important CSS structures
          normalizeWhitespace: true,
          minifySelectors: true,
          // Don't mess with CSS syntax
          mergeLonghand: false,
          mergeRules: false,
        }]
      }
    } : {})
  },
}
