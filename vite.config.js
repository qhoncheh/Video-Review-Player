import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy the Google Cloud Storage media under same-origin to avoid CORS with video.js fetching segments
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/media": {
        target: "https://storage.googleapis.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(
            /^\/media/,
            "/sohonet-interview-video-sample-public/1040056094289814902/manifests"
          ),
      },
    },
  },
});
