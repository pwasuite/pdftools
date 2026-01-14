// CompressPage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompressPage from '../../pages/CompressPage.jsx';
import { createMockPDFFile } from '../helpers.js';

// Mock the worker-init module
vi.mock('../../lib/worker-init.js', () => ({
    compressPDF: vi.fn((file, quality) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(Math.floor(file.size * 0.6)),
                name: 'compressed.pdf',
            }],
        })
    ),
}));

import { compressPDF } from '../../lib/worker-init.js';

describe('CompressPage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<CompressPage {...defaultProps} />);
            expect(screen.getByText('Compress PDF')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<CompressPage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', () => {
            render(<CompressPage {...defaultProps} />);
            fireEvent.click(screen.getByText('Back'));
            expect(defaultProps.onBack).toHaveBeenCalled();
        });

        it('displays file drop zone with correct prompt', () => {
            render(<CompressPage {...defaultProps} />);
            expect(screen.getByText('Drop PDF to compress')).toBeInTheDocument();
        });

        it('shows file info after selecting a file', async () => {
            render(<CompressPage {...defaultProps} />);

            // Get the hidden file input
            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test-document.pdf', 2 * 1024 * 1024);

            // Simulate file selection
            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
            });
        });

        it('shows quality slider after file selection', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Compression Quality')).toBeInTheDocument();
            });
        });

        it('shows compress button after file selection', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });
        });

        it('triggers compression when clicking compress button', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compress PDF'));

            await waitFor(() => {
                expect(compressPDF).toHaveBeenCalled();
            });
        });

        it('shows success state after compression', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compress PDF'));

            await waitFor(() => {
                expect(screen.getByText('✅ Compression Complete!')).toBeInTheDocument();
            });
        });

        it('shows size comparison after compression', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compress PDF'));

            await waitFor(() => {
                expect(screen.getByText('Original')).toBeInTheDocument();
                expect(screen.getByText('Compressed')).toBeInTheDocument();
                expect(screen.getByText('Saved')).toBeInTheDocument();
            });
        });

        it('shows download button after compression', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compress PDF'));

            await waitFor(() => {
                expect(screen.getByText(/📥 Download/)).toBeInTheDocument();
            });
        });

        it('shows compress another button after success', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compress PDF'));

            await waitFor(() => {
                expect(screen.getByText('🔄 Compress Another')).toBeInTheDocument();
            });
        });

        it('resets state when clicking compress another', async () => {
            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compress PDF'));

            await waitFor(() => {
                expect(screen.getByText('🔄 Compress Another')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🔄 Compress Another'));

            await waitFor(() => {
                expect(screen.getByText('Drop PDF to compress')).toBeInTheDocument();
            });
        });

        it('shows error state on compression failure', async () => {
            // Mock a failed compression
            compressPDF.mockRejectedValueOnce(new Error('Compression failed'));

            render(<CompressPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compress PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compress PDF'));

            await waitFor(() => {
                expect(screen.getByText('❌ Compression Failed')).toBeInTheDocument();
            });
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<CompressPage {...frenchProps} />);
            expect(screen.getByText('Compresser PDF')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<CompressPage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('displays file drop zone in French', () => {
            render(<CompressPage {...frenchProps} />);
            expect(screen.getByText('Déposez un PDF à compresser')).toBeInTheDocument();
        });

        it('shows quality slider in French after file selection', async () => {
            render(<CompressPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Qualité de compression')).toBeInTheDocument();
            });
        });

        it('shows compress button in French', async () => {
            render(<CompressPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compresser le PDF')).toBeInTheDocument();
            });
        });

        it('shows success message in French', async () => {
            render(<CompressPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🚀 Compresser le PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🚀 Compresser le PDF'));

            await waitFor(() => {
                expect(screen.getByText('✅ Compression terminée !')).toBeInTheDocument();
            });
        });
    });
});
