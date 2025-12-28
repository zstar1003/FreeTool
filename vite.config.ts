import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Gzip 压缩
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 10240, // 仅压缩大于 10KB 的文件
          deleteOriginFile: false,
        }),
        // Brotli 压缩（更高压缩率）
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 10240,
          deleteOriginFile: false,
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 代码分割优化
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'pdf-vendor': ['pdfjs-dist', 'pptxgenjs'],
            },
          },
        },
        // 启用 CSS 代码分割
        cssCodeSplit: true,
        // 生成 sourcemap 仅在开发环境
        sourcemap: mode !== 'production',
        // 优化分块大小警告阈值
        chunkSizeWarningLimit: 1000,
      },
    };
});
