import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs', // Output to 'docs' folder for GitHub Pages
  },
  // IMPORTANT: Replace 'your-repo-name' with your actual GitHub repository name
  // For example, if your repo URL is https://github.com/john-doe/geo-explorer-game
  // then the base should be '/geo-explorer-game/'
  base: '/', 
})
