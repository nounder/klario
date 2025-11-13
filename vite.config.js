import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  root: "./src",
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
