// GrayscalePage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GrayscalePage from '../../pages/GrayscalePage.jsx';
import { createMockPDFFile } from '../helpers.js';

// Mock the worker-init module
vi.mock('../../lib/worker-init.js', () => ({
    grayscalePDF: vi.fn((file) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(file.size),
                name: 'grayscale.pdf',
            }],
        })
    ),
}));

import { grayscalePDF } from '../../lib/worker-init.js';

describe('GrayscalePage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<GrayscalePage {...defaultProps} />);
            expect(screen.getByText('Grayscale PDF')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<GrayscalePage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', () => {
            render(<GrayscalePage {...defaultProps} />);
            fireEvent.click(screen.getByText('Back'));
            expect(defaultProps.onBack).toHaveBeenCalled();
        });

        it('displays file drop zone with correct prompt', () => {
            render(<GrayscalePage {...defaultProps} />);
            expect(screen.getByText('Drop PDF to convert')).toBeInTheDocument();
        });

        it('shows file info after selecting a file', async () => {
            render(<GrayscalePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('color-document.pdf', 2 * 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('color-document.pdf')).toBeInTheDocument();
            });
        });

        it('shows convert button after file selection', async () => {
            render(<GrayscalePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🎨 Convert to Grayscale')).toBeInTheDocument();
            });
        });

        it('triggers conversion when clicking convert button', async () => {
            render(<GrayscalePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🎨 Convert to Grayscale')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🎨 Convert to Grayscale'));

            await waitFor(() => {
                expect(grayscalePDF).toHaveBeenCalled();
            });
        });

        it('shows success state after conversion', async () => {
            render(<GrayscalePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🎨 Convert to Grayscale')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🎨 Convert to Grayscale'));

            await waitFor(() => {
                expect(screen.getByText('✅ Conversion Complete!')).toBeInTheDocument();
            });
        });

        it('shows download button after conversion', async () => {
            render(<GrayscalePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🎨 Convert to Grayscale')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🎨 Convert to Grayscale'));

            await waitFor(() => {
                expect(screen.getByText(/📥 Download/)).toBeInTheDocument();
            });
        });

        it('shows convert another button after success', async () => {
            render(<GrayscalePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🎨 Convert to Grayscale')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🎨 Convert to Grayscale'));

            await waitFor(() => {
                expect(screen.getByText('🔄 Convert Another')).toBeInTheDocument();
            });
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<GrayscalePage {...frenchProps} />);
            expect(screen.getByText('PDF en niveaux de gris')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<GrayscalePage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('displays file drop zone in French', () => {
            render(<GrayscalePage {...frenchProps} />);
            expect(screen.getByText('Déposez un PDF à convertir')).toBeInTheDocument();
        });

        it('shows convert button in French', async () => {
            render(<GrayscalePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🎨 Convertir en niveaux de gris')).toBeInTheDocument();
            });
        });

        it('shows success message in French', async () => {
            render(<GrayscalePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🎨 Convertir en niveaux de gris')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🎨 Convertir en niveaux de gris'));

            await waitFor(() => {
                expect(screen.getByText('✅ Conversion terminée !')).toBeInTheDocument();
            });
        });
    });
});
