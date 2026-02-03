import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'your-repo-name' with your actual GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
