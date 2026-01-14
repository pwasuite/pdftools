import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.js'],
        globals: true,
        css: true,
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html', 'lcov'],
            exclude: ['node_modules/', 'src/test/', 'dist/', 'public/'],
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    define: {
        __APP_VERSION__: JSON.stringify('test-version'),
    },
});
