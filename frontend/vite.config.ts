
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {

        target: 'http://localhost:5000', // ako ti backend radi na https://localhost:5001, promijeni ovdje
        secure: false, 
        changeOrigin: true,
      },
    },
  },
});
