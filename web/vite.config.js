import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` is set for GitHub Pages project sites (https://user.github.io/REPO/).
// Override at build time:  VITE_BASE=/The-Keepers-Eyes/ npm run build
// For Vercel/Netlify or a user/org root site, leave it as "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || "/",
});
