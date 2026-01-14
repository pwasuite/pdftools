// Test helper utilities
import { render } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Creates a mock PDF File object for testing
 * @param {string} name - File name
 * @param {number} size - File size in bytes
 * @returns {File}
 */
export function createMockPDFFile(name = 'test.pdf', size = 1024 * 1024) {
    // Create a Uint8Array of the specified size
    const content = new Uint8Array(size);
    // Add PDF magic header bytes
    content[0] = 0x25; // %
    content[1] = 0x50; // P
    content[2] = 0x44; // D
    content[3] = 0x46; // F
    content[4] = 0x2d; // -

    const blob = new Blob([content], { type: 'application/pdf' });
    const file = new File([blob], name, { type: 'application/pdf' });

    // Override size since File doesn't use blob size correctly in jsdom
    Object.defineProperty(file, 'size', { value: size });

    return file;
}

/**
 * Creates mock PDF files for testing merge functionality
 * @param {number} count - Number of files to create
 * @returns {File[]}
 */
export function createMockPDFFiles(count = 3) {
    return Array.from({ length: count }, (_, i) =>
        createMockPDFFile(`document-${i + 1}.pdf`, (i + 1) * 500 * 1024)
    );
}

/**
 * Mock implementation of the worker-init functions
 * Import and use in tests that need to mock PDF processing
 */
export const mockWorkerFunctions = {
    compressPDF: vi.fn((file, quality) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(Math.floor(file.size * 0.6)), // 40% reduction
                name: 'compressed.pdf',
            }],
        })
    ),

    mergePDFs: vi.fn((files, enableCompression, quality) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(5000),
                name: 'merged.pdf',
            }],
        })
    ),

    splitPDF: vi.fn((file) =>
        Promise.resolve({
            outputs: [
                { data: new Uint8Array(1000), name: 'page-1.pdf' },
                { data: new Uint8Array(1000), name: 'page-2.pdf' },
                { data: new Uint8Array(1000), name: 'page-3.pdf' },
            ],
        })
    ),

    extractPages: vi.fn((file, firstPage, lastPage) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(2000),
                name: 'extracted.pdf',
            }],
        })
    ),

    grayscalePDF: vi.fn((file) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(file.size),
                name: 'grayscale.pdf',
            }],
        })
    ),

    resizePDF: vi.fn((file, paperSize) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(file.size),
                name: 'resized.pdf',
            }],
        })
    ),

    getPageCount: vi.fn(() =>
        Promise.resolve({ pageCount: 5 })
    ),
};

/**
 * Reset all mock worker functions
 */
export function resetMockWorkerFunctions() {
    Object.values(mockWorkerFunctions).forEach(fn => fn.mockClear());
}

/**
 * Simulates file drop event on a drop zone
 * @param {HTMLElement} dropZone - The drop zone element
 * @param {File[]} files - Files to drop
 * @returns {void}
 */
export function simulateFileDrop(dropZone, files) {
    const dataTransfer = {
        files,
        items: files.map(file => ({
            kind: 'file',
            type: file.type,
            getAsFile: () => file,
        })),
        types: ['Files'],
    };

    // Fire dragenter, dragover, and drop events
    dropZone.dispatchEvent(new DragEvent('dragenter', { dataTransfer, bubbles: true }));
    dropZone.dispatchEvent(new DragEvent('dragover', { dataTransfer, bubbles: true }));
    dropZone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
}

/**
 * Wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function wait(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
