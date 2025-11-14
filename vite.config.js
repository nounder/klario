import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  root: "./src",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    allowedHosts: [
      ".ngrok-free.app",
    ],
  },
  plugins: [
    tailwindcss(),
    solidPlugin(),
  ],
})
