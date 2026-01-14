// ExtractPagesPage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExtractPagesPage from '../../pages/ExtractPagesPage.jsx';
import { createMockPDFFile } from '../helpers.js';

// Mock the worker-init module
vi.mock('../../lib/worker-init.js', () => ({
    extractPages: vi.fn((file, firstPage, lastPage) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(2000),
                name: 'extracted.pdf',
            }],
        })
    ),
    getPageCount: vi.fn(() =>
        Promise.resolve({ pageCount: 10 })
    ),
}));

import { extractPages, getPageCount } from '../../lib/worker-init.js';

describe('ExtractPagesPage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
        setPage: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<ExtractPagesPage {...defaultProps} />);
            expect(screen.getByText('Extract Pages')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<ExtractPagesPage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', () => {
            render(<ExtractPagesPage {...defaultProps} />);
            fireEvent.click(screen.getByText('Back'));
            expect(defaultProps.onBack).toHaveBeenCalled();
        });

        it('displays file drop zone with correct prompt', () => {
            render(<ExtractPagesPage {...defaultProps} />);
            expect(screen.getByText('Drop PDF to extract pages')).toBeInTheDocument();
        });

        it('shows file info after selecting a file', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('document.pdf', 2 * 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('document.pdf')).toBeInTheDocument();
            });
        });

        it('shows page range inputs after file selection', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Page Range')).toBeInTheDocument();
                expect(screen.getByText(/From page/)).toBeInTheDocument();
                expect(screen.getByText(/To page/)).toBeInTheDocument();
            });
        });

        it('shows extract button after file selection', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📄 Extract Pages')).toBeInTheDocument();
            });
        });

        it('triggers extraction when clicking extract button', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📄 Extract Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📄 Extract Pages'));

            await waitFor(() => {
                expect(extractPages).toHaveBeenCalled();
            });
        });

        it('shows success state after extraction', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📄 Extract Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📄 Extract Pages'));

            await waitFor(() => {
                expect(screen.getByText('✅ Extraction Complete!')).toBeInTheDocument();
            });
        });

        it('shows download button after extraction', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📄 Extract Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📄 Extract Pages'));

            await waitFor(() => {
                expect(screen.getByText(/📥 Download/)).toBeInTheDocument();
            });
        });

        it('shows extract another button after success', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📄 Extract Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📄 Extract Pages'));

            await waitFor(() => {
                expect(screen.getByText('🔄 Extract More Pages')).toBeInTheDocument();
            });
        });

        it('displays will extract message with page count', async () => {
            render(<ExtractPagesPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                // The component should show something like "Will extract X pages"
                expect(screen.getByText(/Will extract/)).toBeInTheDocument();
            });
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<ExtractPagesPage {...frenchProps} />);
            expect(screen.getByText('Extraire des pages')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<ExtractPagesPage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('displays file drop zone in French', () => {
            render(<ExtractPagesPage {...frenchProps} />);
            expect(screen.getByText('Déposez un PDF pour extraire des pages')).toBeInTheDocument();
        });

        it('shows page range labels in French', async () => {
            render(<ExtractPagesPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Plage de pages')).toBeInTheDocument();
                expect(screen.getByText(/De la page/)).toBeInTheDocument();
                expect(screen.getByText(/À la page/)).toBeInTheDocument();
            });
        });

        it('shows extract button in French', async () => {
            render(<ExtractPagesPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📄 Extraire les pages')).toBeInTheDocument();
            });
        });

        it('shows success message in French', async () => {
            render(<ExtractPagesPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('📄 Extraire les pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('📄 Extraire les pages'));

            await waitFor(() => {
                expect(screen.getByText('✅ Extraction terminée !')).toBeInTheDocument();
            });
        });
    });
});
