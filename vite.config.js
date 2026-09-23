import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    open: "/index.html",
  },
  build: {
    rollupOptions: {
      input: {
        login: resolve(__dirname, "login.html"),
        cv: resolve(__dirname, "cv.html"),
        main: resolve(__dirname, "index.html"),
        projects: resolve(__dirname, "projects.html"),
        resume: resolve(__dirname, "resume.html"),
        snapfit: resolve(__dirname, "project-snapfit.html"),
        particle: resolve(__dirname, "project-particle.html"),
        walkable: resolve(__dirname, "project-walkable.html"),
        signal: resolve(__dirname, "project-signal.html"),
        hobbyPostcards: resolve(__dirname, "hobby-postcards.html"),
        hobbySwimming: resolve(__dirname, "hobby-swimming.html"),
        hobbyBroadcasting: resolve(__dirname, "hobby-broadcasting.html"),
        hobbyReading: resolve(__dirname, "hobby-reading.html"),
      },
    },
  },
});
