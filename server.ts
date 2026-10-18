import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Parse command line arguments or default to port 3000
  let PORT = 3000;
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    PORT = parseInt(process.argv[portArgIndex + 1], 10) || 3000;
  }

  let HOST = '0.0.0.0';
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    HOST = process.argv[hostArgIndex + 1] || '0.0.0.0';
  }

  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.resolve(__dirname, 'public')));

  // CORS and standard security headers
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Re-connected Backend API Routes
  app.post('/api/send-otp', async (req: Request, res: Response) => {
    try {
      const handler = (await import('./api/send-otp.js')).default;
      await handler(req, res);
    } catch (err: any) {
      console.error('Error handling /api/send-otp:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/verify-otp', async (req: Request, res: Response) => {
    try {
      const handler = (await import('./api/verify-otp.js')).default;
      await handler(req, res);
    } catch (err: any) {
      console.error('Error handling /api/verify-otp:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/forgot-password', async (req: Request, res: Response) => {
    try {
      const handler = (await import('./api/forgot-password.js')).default;
      await handler(req, res);
    } catch (err: any) {
      console.error('Error handling /api/forgot-password:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Health and Domain Diagnostics
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      app: 'UniNest Nigeria',
      domain: 'uninestnigeria.com.ng',
      timestamp: new Date().toISOString() 
    });
  });

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`UniNest Server running on http://${HOST}:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
