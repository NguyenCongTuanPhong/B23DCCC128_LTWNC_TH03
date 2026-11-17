import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/permissions.ts',
        'src/lib/loan-validate.ts',
        'src/lib/format.ts',
        'src/components/LoanForm.tsx',
      ],
      reporter: ['text', 'html'],
      thresholds: {
        perFile: true,
        lines: 70,
      },
    },
  },
});
