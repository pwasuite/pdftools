// ResizePage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResizePage from '../../pages/ResizePage.jsx';
import { createMockPDFFile } from '../helpers.js';

// Mock the worker-init module
vi.mock('../../lib/worker-init.js', () => ({
    resizePDF: vi.fn((file, paperSize) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(file.size),
                name: 'resized.pdf',
            }],
        })
    ),
}));

import { resizePDF } from '../../lib/worker-init.js';

describe('ResizePage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<ResizePage {...defaultProps} />);
            expect(screen.getByText('Resize PDF')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<ResizePage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', () => {
            render(<ResizePage {...defaultProps} />);
            fireEvent.click(screen.getByText('Back'));
            expect(defaultProps.onBack).toHaveBeenCalled();
        });

        it('displays file drop zone with correct prompt', () => {
            render(<ResizePage {...defaultProps} />);
            expect(screen.getByText('Drop PDF to resize')).toBeInTheDocument();
        });

        it('shows file info after selecting a file', async () => {
            render(<ResizePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('document.pdf', 2 * 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('document.pdf')).toBeInTheDocument();
            });
        });

        it('shows paper size selector after file selection', async () => {
            render(<ResizePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Target paper size')).toBeInTheDocument();
            });
        });

        it('shows resize button after file selection', async () => {
            render(<ResizePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📐 Resize PDF')).toBeInTheDocument();
            });
        });

        it('triggers resize when clicking resize button', async () => {
            render(<ResizePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📐 Resize PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📐 Resize PDF'));

            await waitFor(() => {
                expect(resizePDF).toHaveBeenCalled();
            });
        });

        it('shows success state after resize', async () => {
            render(<ResizePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📐 Resize PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📐 Resize PDF'));

            await waitFor(() => {
                expect(screen.getByText('✅ Resize Complete!')).toBeInTheDocument();
            });
        });

        it('shows download button after resize', async () => {
            render(<ResizePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📐 Resize PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📐 Resize PDF'));

            await waitFor(() => {
                expect(screen.getByText(/📥 Download/)).toBeInTheDocument();
            });
        });

        it('shows resize another button after success', async () => {
            render(<ResizePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📐 Resize PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📐 Resize PDF'));

            await waitFor(() => {
                expect(screen.getByText('🔄 Resize Another')).toBeInTheDocument();
            });
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<ResizePage {...frenchProps} />);
            expect(screen.getByText('Redimensionner PDF')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<ResizePage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('displays file drop zone in French', () => {
            render(<ResizePage {...frenchProps} />);
            expect(screen.getByText('Déposez un PDF à redimensionner')).toBeInTheDocument();
        });

        it('shows paper size label in French', async () => {
            render(<ResizePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Taille de papier cible')).toBeInTheDocument();
            });
        });

        it('shows resize button in French', async () => {
            render(<ResizePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📐 Redimensionner le PDF')).toBeInTheDocument();
            });
        });

        it('shows success message in French', async () => {
            render(<ResizePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📐 Redimensionner le PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📐 Redimensionner le PDF'));

            await waitFor(() => {
                expect(screen.getByText('✅ Redimensionnement terminé !')).toBeInTheDocument();
            });
        });
    });
});
