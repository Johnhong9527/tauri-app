import {defineConfig} from "vite";
import path from 'node:path'
import react from "@vitejs/plugin-react";
import alias from '@rollup/plugin-alias';
import vitePluginForArco from '@arco-plugins/vite-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    alias({
    entries: [
      { find: '@', replacement: './src' },
      // { find: 'batman-1.0.0', replacement: './joker-1.5.0' }
    ]
  }),

  ],
  resolve:{
    alias:{
      '@': '/src',
    }
  },
  css: {
    //* css模块化
    modules: { // css模块化 文件以.module.[css|less|scss]结尾
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix',
    },
    //* 预编译支持less
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      },
    },
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: ["es2021", "chrome100", "safari13"],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
