import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// Vite plugin voor API proxy naar Tauri backend
const apiProxyPlugin = () => ({
  name: 'api-proxy',
  configureServer(server: any) {
    server.middlewares.use('/api/gamestate', async (_req: any, res: any) => {
      try {
        // In dev mode, Tauri backend draait op een andere port of in-process
        // We kunnen hier niet direct de Rust state benaderen, dus we moeten
        // de game state opslaan in een gedeelde locatie (bijv. bestand)
        // OF we accepteren dat dit alleen werkt via Tauri invoke
        
        // Voor nu: return een placeholder die aangeeft dat de API niet beschikbaar is
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.statusCode = 503;
        res.end(JSON.stringify({ error: 'API alleen beschikbaar via Tauri context. Gebruik de app zelf of open /fill in een Tauri window.' }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), apiProxyPlugin()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: '0.0.0.0', // Accepteer verbindingen van alle netwerk interfaces
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
