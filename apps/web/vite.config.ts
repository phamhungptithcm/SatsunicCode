import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({command, mode}) => ({
  plugins: [react(), ...(command === 'serve' && mode === 'production' ? [{
    name: 'local-google-canonical-origin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.headers.host === '127.0.0.1:5173' && req.headers.accept?.includes('text/html')) {
          res.statusCode = 302;
          res.setHeader('Location', `http://localhost:5173${req.url?.startsWith('/') ? req.url : '/'}`);
          res.setHeader('Cache-Control', 'no-store');
          res.end();
          return;
        }
        next();
      });
    },
  }] : [])],
  build: { sourcemap: false },
  server: { port: 5173, strictPort: true },
}));
