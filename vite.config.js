import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3000,
    open: true,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
});
