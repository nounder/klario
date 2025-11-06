import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  root: "./src",
  server: {
    allowedHosts: [
      ".ngrok-free.app",
    ],
  },
  plugins: [
    solidPlugin(),
  ],
})
