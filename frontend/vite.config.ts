
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {

        target: 'http://localhost:5000', // ako backend radi na https://localhost:5001, promijeniti ovo!
        secure: false, 
        changeOrigin: true,
      },
    },
  },
});
