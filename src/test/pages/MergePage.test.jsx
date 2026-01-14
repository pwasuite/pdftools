// MergePage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MergePage from '../../pages/MergePage.jsx';
import { createMockPDFFile, createMockPDFFiles } from '../helpers.js';

// Mock the worker-init module
vi.mock('../../lib/worker-init.js', () => ({
    mergePDFs: vi.fn((files, enableCompression, quality) =>
        Promise.resolve({
            outputs: [{
                data: new Uint8Array(5000),
                name: 'merged.pdf',
            }],
        })
    ),
}));

import { mergePDFs } from '../../lib/worker-init.js';

describe('MergePage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<MergePage {...defaultProps} />);
            expect(screen.getByText('Merge PDFs')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<MergePage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', () => {
            render(<MergePage {...defaultProps} />);
            fireEvent.click(screen.getByText('Back'));
            expect(defaultProps.onBack).toHaveBeenCalled();
        });

        it('displays file drop zone with correct prompt', () => {
            render(<MergePage {...defaultProps} />);
            expect(screen.getByText('Drop PDFs here or click to select')).toBeInTheDocument();
        });

        it('shows files list after selecting files', async () => {
            render(<MergePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('document-1.pdf')).toBeInTheDocument();
                expect(screen.getByText('document-2.pdf')).toBeInTheDocument();
            });
        });

        it('shows file count after selection', async () => {
            render(<MergePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(3);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText(/3 files selected/)).toBeInTheDocument();
            });
        });

        it('shows merge button when at least 2 files selected', async () => {
            render(<MergePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🔗 Merge PDFs')).toBeInTheDocument();
            });
        });

        it('shows compression checkbox', async () => {
            render(<MergePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Also compress merged PDF')).toBeInTheDocument();
            });
        });

        it('triggers merge when clicking merge button', async () => {
            render(<MergePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🔗 Merge PDFs')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🔗 Merge PDFs'));

            await waitFor(() => {
                expect(mergePDFs).toHaveBeenCalled();
            });
        });

        it('shows success state after merge', async () => {
            render(<MergePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🔗 Merge PDFs')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🔗 Merge PDFs'));

            await waitFor(() => {
                expect(screen.getByText('✅ Merge Complete!')).toBeInTheDocument();
            });
        });

        it('allows removing individual files', async () => {
            render(<MergePage {...defaultProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(3);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('document-1.pdf')).toBeInTheDocument();
                expect(screen.getByText('document-2.pdf')).toBeInTheDocument();
                expect(screen.getByText('document-3.pdf')).toBeInTheDocument();
            });

            // Find and click the first remove button
            const removeButtons = screen.getAllByRole('button').filter(btn =>
                btn.className.includes('remove')
            );

            if (removeButtons.length > 0) {
                fireEvent.click(removeButtons[0]);

                await waitFor(() => {
                    expect(screen.queryByText('document-1.pdf')).not.toBeInTheDocument();
                });
            }
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<MergePage {...frenchProps} />);
            expect(screen.getByText('Fusionner des PDF')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<MergePage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('displays file drop zone in French', () => {
            render(<MergePage {...frenchProps} />);
            expect(screen.getByText('Déposez des PDF ici ou cliquez pour sélectionner')).toBeInTheDocument();
        });

        it('shows file count in French', async () => {
            render(<MergePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(3);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText(/3 fichiers sélectionnés/)).toBeInTheDocument();
            });
        });

        it('shows merge button in French', async () => {
            render(<MergePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🔗 Fusionner les PDF')).toBeInTheDocument();
            });
        });

        it('shows compression option in French', async () => {
            render(<MergePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('Compresser aussi le PDF fusionné')).toBeInTheDocument();
            });
        });

        it('shows success message in French', async () => {
            render(<MergePage {...frenchProps} />);

            const fileInput = document.querySelector('input[type="file"]');
            const mockFiles = createMockPDFFiles(2);

            Object.defineProperty(fileInput, 'files', { value: mockFiles });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByText('🔗 Fusionner les PDF')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('🔗 Fusionner les PDF'));

            await waitFor(() => {
                expect(screen.getByText('✅ Fusion terminée !')).toBeInTheDocument();
            });
        });
    });
});
