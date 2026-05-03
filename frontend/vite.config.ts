/// <reference types="vitest/config" />

import path from "path"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8081'
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        embed: path.resolve(__dirname, "embed.html"),
        "embed-loader": path.resolve(__dirname, "src/embed/loader.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "embed-loader") {
            return "embed.js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
  test: {
    reporters: process.env.CI
      ? ['default', ['junit', { suiteName: 'portfolio-frontend' }]]
      : ['default'],
    outputFile: { junit: './test-report.junit.xml' },
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/__mocks__/**',
      ],
    },
  },
})
