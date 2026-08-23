import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const isProduction = process.env.NODE_ENV === 'production';
const isReplitDevelopment =
  !isProduction && process.env.REPL_ID !== undefined;
const rawPort = process.env.PORT;
const parsedPort = rawPort ? Number(rawPort) : 5173;
const port =
  Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5173;
const hasExplicitPort =
  rawPort !== undefined &&
  Number.isFinite(Number(rawPort)) &&
  Number(rawPort) > 0;
const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(isReplitDevelopment
      ? [
          runtimeErrorOverlay(),
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: hasExplicitPort,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    strictPort: hasExplicitPort,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
