// SplitPage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SplitPage from '../../pages/SplitPage.jsx';
import { createMockPDFFile } from '../helpers.js';

// Mock the worker-init module
vi.mock('../../lib/worker-init.js', () => ({
    splitPDF: vi.fn((file) =>
        Promise.resolve({
            outputs: [
                { data: new Uint8Array(1000), name: 'page-1.pdf' },
                { data: new Uint8Array(1000), name: 'page-2.pdf' },
                { data: new Uint8Array(1000), name: 'page-3.pdf' },
            ],
        })
    ),
}));

import { splitPDF } from '../../lib/worker-init.js';

describe('SplitPage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<SplitPage {...defaultProps} />);
            expect(screen.getByText('Split PDF')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<SplitPage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', () => {
            render(<SplitPage {...defaultProps} />);
            fireEvent.click(screen.getByText('Back'));
            expect(defaultProps.onBack).toHaveBeenCalled();
        });

        it('displays file drop zone with correct prompt', () => {
            render(<SplitPage {...defaultProps} />);
            expect(screen.getByText('Drop PDF to split')).toBeInTheDocument();
        });

        it('shows file info after selecting a file', async () => {
            render(<SplitPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('document.pdf', 2 * 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('document.pdf')).toBeInTheDocument();
            });
        });

        it('shows split button after file selection', async () => {
            render(<SplitPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Split into Pages')).toBeInTheDocument();
            });
        });

        it('triggers split when clicking split button', async () => {
            render(<SplitPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Split into Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('✂️ Split into Pages'));

            await waitFor(() => {
                expect(splitPDF).toHaveBeenCalled();
            });
        });

        it('shows success state after split', async () => {
            render(<SplitPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Split into Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('✂️ Split into Pages'));

            await waitFor(() => {
                expect(screen.getByText('✅ Split Complete!')).toBeInTheDocument();
            });
        });

        it('shows page count after split', async () => {
            render(<SplitPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Split into Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('✂️ Split into Pages'));

            await waitFor(() => {
                expect(screen.getByText(/3 pages extracted/)).toBeInTheDocument();
            });
        });

        it('shows download all ZIP button after split', async () => {
            render(<SplitPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Split into Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('✂️ Split into Pages'));

            await waitFor(() => {
                expect(screen.getByText('📦 Download All (ZIP)')).toBeInTheDocument();
            });
        });

        it('shows split another button after success', async () => {
            render(<SplitPage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Split into Pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('✂️ Split into Pages'));

            await waitFor(() => {
                expect(screen.getByText('🔄 Split Another PDF')).toBeInTheDocument();
            });
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<SplitPage {...frenchProps} />);
            expect(screen.getByText('Diviser PDF')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<SplitPage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('displays file drop zone in French', () => {
            render(<SplitPage {...frenchProps} />);
            expect(screen.getByText('Déposez un PDF à diviser')).toBeInTheDocument();
        });

        it('shows split button in French', async () => {
            render(<SplitPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Diviser en pages')).toBeInTheDocument();
            });
        });

        it('shows success message in French', async () => {
            render(<SplitPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Diviser en pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('✂️ Diviser en pages'));

            await waitFor(() => {
                expect(screen.getByText('✅ Division terminée !')).toBeInTheDocument();
            });
        });

        it('shows page count in French', async () => {
            render(<SplitPage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFile = createMockPDFFile('test.pdf', 1024 * 1024);

            Object.defineProperty(fileInput, 'files', { value: [mockFile] });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('✂️ Diviser en pages')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('✂️ Diviser en pages'));

            await waitFor(() => {
                expect(screen.getByText(/3 pages extraites/)).toBeInTheDocument();
            });
        });
    });
});
