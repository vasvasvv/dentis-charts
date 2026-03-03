import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },

  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/proxy-api': {
        target: 'https://dentis-cards-api.nesterenkovasil9.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-api/, ''),
      },
    },
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
});