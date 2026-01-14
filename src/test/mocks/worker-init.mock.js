// Mock implementations for worker-init.js
import { vi } from 'vitest';

export const compressPDF = vi.fn((file, quality) =>
    Promise.resolve({
        outputs: [{
            data: new Uint8Array(Math.floor(file.size * 0.6)),
            name: 'compressed.pdf',
        }],
    })
);

export const mergePDFs = vi.fn((files, enableCompression, quality) =>
    Promise.resolve({
        outputs: [{
            data: new Uint8Array(5000),
            name: 'merged.pdf',
        }],
    })
);

export const splitPDF = vi.fn((file) =>
    Promise.resolve({
        outputs: [
            { data: new Uint8Array(1000), name: 'page-1.pdf' },
            { data: new Uint8Array(1000), name: 'page-2.pdf' },
            { data: new Uint8Array(1000), name: 'page-3.pdf' },
        ],
    })
);

export const extractPages = vi.fn((file, firstPage, lastPage) =>
    Promise.resolve({
        outputs: [{
            data: new Uint8Array(2000),
            name: 'extracted.pdf',
        }],
    })
);

export const grayscalePDF = vi.fn((file) =>
    Promise.resolve({
        outputs: [{
            data: new Uint8Array(file.size),
            name: 'grayscale.pdf',
        }],
    })
);

export const resizePDF = vi.fn((file, paperSize) =>
    Promise.resolve({
        outputs: [{
            data: new Uint8Array(file.size),
            name: 'resized.pdf',
        }],
    })
);

export const getPageCount = vi.fn(() =>
    Promise.resolve({ pageCount: 5 })
);

export const runGSOperation = vi.fn((operation, data) =>
    Promise.resolve({ outputs: [] })
);

export const _GSPS2PDF = vi.fn(() =>
    Promise.resolve({ outputs: [] })
);

// Reset all mocks
export function resetAllMocks() {
    compressPDF.mockClear();
    mergePDFs.mockClear();
    splitPDF.mockClear();
    extractPages.mockClear();
    grayscalePDF.mockClear();
    resizePDF.mockClear();
    getPageCount.mockClear();
    runGSOperation.mockClear();
    _GSPS2PDF.mockClear();
}
