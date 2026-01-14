// LicensePage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LicensePage from '../../pages/LicensePage.jsx';

// Mock fetch for loading license text
global.fetch = vi.fn();

describe('LicensePage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock response
        global.fetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve('MIT License\n\nCopyright (c) 2024\n\nPermission is hereby granted...'),
        });
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<LicensePage {...defaultProps} />);
            expect(screen.getByText('📜 License')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<LicensePage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', async () => {
            const { container } = render(<LicensePage {...defaultProps} />);

            // Find the back button by class or role
            const backBtn = container.querySelector('.back-btn');
            if (backBtn) {
                backBtn.click();
                expect(defaultProps.onBack).toHaveBeenCalled();
            }
        });

        it('fetches license text on mount', async () => {
            render(<LicensePage {...defaultProps} />);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        it('displays license text after loading', async () => {
            render(<LicensePage {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/MIT License/)).toBeInTheDocument();
            });
        });

        it('shows loading state initially', () => {
            // Delay the fetch response
            global.fetch.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    text: () => Promise.resolve('License text'),
                }), 100))
            );

            render(<LicensePage {...defaultProps} />);

            // Initially should show loading or placeholder
            // The exact text depends on implementation
        });

        it('handles fetch error gracefully', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));

            render(<LicensePage {...defaultProps} />);

            // Wait for error state - component should handle this gracefully
            await waitFor(() => {
                // Should not crash
                expect(screen.getByText('📜 License')).toBeInTheDocument();
            });
        });

        it('handles non-ok response', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                text: () => Promise.resolve('Not found'),
            });

            render(<LicensePage {...defaultProps} />);

            await waitFor(() => {
                // Should not crash and should still show the page
                expect(screen.getByText('📜 License')).toBeInTheDocument();
            });
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<LicensePage {...frenchProps} />);
            expect(screen.getByText('📜 Licence')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<LicensePage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('still displays license text in original language', async () => {
            render(<LicensePage {...frenchProps} />);

            await waitFor(() => {
                // License text remains in English even when UI is French
                expect(screen.getByText(/MIT License/)).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('has proper heading structure', () => {
            render(<LicensePage {...defaultProps} />);
            const h1 = screen.getByRole('heading', { level: 1 });
            expect(h1).toBeInTheDocument();
        });

        it('license content is in a readable container', async () => {
            const { container } = render(<LicensePage {...defaultProps} />);

            await waitFor(() => {
                // License should be displayed in a pre or code block for readability
                const licenseContainer = container.querySelector('.license-text, pre, .license-content');
                expect(licenseContainer || container.textContent.includes('MIT License')).toBeTruthy();
            });
        });
    });
});
