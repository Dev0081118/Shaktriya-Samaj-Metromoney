import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/server/**', '**/dist/**', '**/.git/**']
    }
  },
  test: {
    pool: 'threads',
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    fileParallelism: false,
    include: ['src/**/*.test.{js,jsx}']
  }
});
