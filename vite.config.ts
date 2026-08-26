import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  // 必须用绝对路径，否则浏览器直接打开深层路由（/admin/login、/collection/:slug）时
  // 相对路径资源会被解析到错误位置，导致整站白屏。
  // Gitee Pages 等子目录静态托管如需支持，应单独构建或用 HashRouter。
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-motion': ['gsap', 'lenis'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
});
