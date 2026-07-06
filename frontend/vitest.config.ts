import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  // JSX is transformed by esbuild using the automatic runtime (react/jsx-runtime),
  // matching tsconfig "jsx": "react-jsx". Avoids the @vitejs/plugin-react <-> vite
  // version coupling.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
