// Test setup file for Vitest
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library's matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn((blob) => `blob:mock-url-${Math.random()}`);
global.URL.revokeObjectURL = vi.fn();

// Mock matchMedia for theme/responsive tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock navigator.language for i18n tests
Object.defineProperty(navigator, 'language', {
    writable: true,
    value: 'en-US',
});

// Mock Worker since WASM workers can't run in jsdom
class MockWorker {
    constructor() {
        this.onmessage = null;
        this.onerror = null;
    }
    postMessage() { }
    terminate() { }
    addEventListener() { }
    removeEventListener() { }
}
global.Worker = MockWorker;
