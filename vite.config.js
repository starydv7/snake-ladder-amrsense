import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built files load from an Android WebView (file:// or assets).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { target: 'es2018' }
});
