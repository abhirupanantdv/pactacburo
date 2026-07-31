import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_ERPNEXT_SITE_URL || 'https://pactac.advtinni.com';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: '',
          cookiePathRewrite: '/',
          configure(proxy) {
            proxy.on('proxyRes', proxyResponse => {
              const cookies = proxyResponse.headers['set-cookie'];
              if (cookies) {
                proxyResponse.headers['set-cookie'] = cookies.map(cookie =>
                  cookie.replace(/;\s*Secure/gi, '')
                );
              }
            });
          }
        }
      }
    }
  };
});
