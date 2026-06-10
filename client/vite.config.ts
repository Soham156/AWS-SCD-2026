import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/**
 * Vite plugin: virtual:event-gallery
 * Scans public/event-galary/ at dev/build time and exposes the file list
 * as a virtual module so any file dropped there is auto-discovered.
 */
function eventGalleryPlugin(): Plugin {
  const VIRTUAL_ID = 'virtual:event-gallery';
  const RESOLVED_ID = '\0' + VIRTUAL_ID;
  const GALLERY_DIR = path.resolve(__dirname, 'public', 'event-galary');
  const SUPPORTED_EXT = /\.(jpe?g|png|gif|webp|avif|mp4|mov|webm|ogg)$/i;

  const getFiles = () => {
    try {
      return fs
        .readdirSync(GALLERY_DIR)
        .filter((f) => SUPPORTED_EXT.test(f))
        .map((f) => `/event-galary/${f}`);
    } catch {
      return [];
    }
  };

  return {
    name: 'vite-plugin-event-gallery',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) {
        const files = getFiles();
        return `export const galleryFiles = ${JSON.stringify(files)};`;
      }
    },
    // Re-run when files inside the gallery dir change (dev only)
    configureServer(server) {
      fs.watch(GALLERY_DIR, () => {
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), eventGalleryPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': 'http://localhost:3001',
      },
    },
  };
});
