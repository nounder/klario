import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  server: {
    allowedHosts: [
      ".ngrok-free.app",
    ],
  },
  plugins: [
    solidPlugin(),
  ],
})

