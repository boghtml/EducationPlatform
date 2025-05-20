// src/setupProxy.js - Оновлений для вирішення проблем із Zoom SDK
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Проксі для API запитів до бекенду
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
  
  // Проксі для запитів до Zoom API для уникнення CORS
  app.use(
    '/zoom-sdk',
    createProxyMiddleware({
      target: 'https://source.zoom.us',
      changeOrigin: true,
      pathRewrite: {
        '^/zoom-sdk': ''
      },
      onProxyRes: function(proxyRes, req, res) {
        // Fix MIME type issues
        if (req.path.endsWith('.js')) {
          proxyRes.headers['content-type'] = 'application/javascript';
        }
        if (req.path.endsWith('.css')) {
          proxyRes.headers['content-type'] = 'text/css';
        }
        if (req.path.endsWith('.wasm')) {
          proxyRes.headers['content-type'] = 'application/wasm';
        }
        
        // Add required headers for SharedArrayBuffer
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      }
    })
  );
  
  // Додайте критичні заголовки для SharedArrayBuffer до всіх відповідей
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
};