import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error('Set VITE_API_URL to the deployed backend API URL before building for production.');
  }

  return {
    plugins: [react()],
  };
});
