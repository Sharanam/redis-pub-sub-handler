import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  // env file is "./.env"
  envDir: "./",
  envPrefix: ".env",
  preview: "http://localhost:3000",

  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
