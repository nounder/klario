import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  root: "./src",
  base: "./",
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
