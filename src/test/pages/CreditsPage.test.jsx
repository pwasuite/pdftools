// CreditsPage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreditsPage from '../../pages/CreditsPage.jsx';

describe('CreditsPage', () => {
    const defaultProps = {
        onBack: vi.fn(),
        lang: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders page header with title', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('❤️ Credits and Special Thanks')).toBeInTheDocument();
        });

        it('renders back button', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('clicking back button calls onBack', () => {
            render(<CreditsPage {...defaultProps} />);
            fireEvent.click(screen.getByText('Back'));
            expect(defaultProps.onBack).toHaveBeenCalled();
        });

        it('displays Core Technology section', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('Core Technology')).toBeInTheDocument();
            expect(screen.getByText(/Ghostscript compiled to WebAssembly/)).toBeInTheDocument();
        });

        it('displays WASM Port section', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('WASM Port')).toBeInTheDocument();
        });

        it('displays Built With section', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('Built With')).toBeInTheDocument();
        });

        it('displays React credit', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText(/UI library for building the interface/)).toBeInTheDocument();
        });

        it('displays Vite credit', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText(/Fast build tool and dev server/)).toBeInTheDocument();
        });

        it('displays AI Tools section', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('AI Tools')).toBeInTheDocument();
            expect(screen.getByText(/Google Antigravity, Gemini, and Anthropic Claude Opus/)).toBeInTheDocument();
        });

        it('displays AI privacy clarification', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText(/does NOT involve using any AI tools/)).toBeInTheDocument();
        });

        it('displays Open Source section', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('Open Source')).toBeInTheDocument();
        });

        it('displays GitHub link', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('View on GitHub')).toBeInTheDocument();
        });

        it('displays Thank Him section', () => {
            render(<CreditsPage {...defaultProps} />);
            expect(screen.getByText('Thank Him For Everything!')).toBeInTheDocument();
        });

        it('displays special thanks section', () => {
            render(<CreditsPage {...defaultProps} />);
            // Special thanks text is split between a link and text node
            expect(screen.getByText(/Special thanks/)).toBeInTheDocument();
            expect(screen.getByText(/to God/)).toBeInTheDocument();
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders page title in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('❤️ Crédits et remerciements')).toBeInTheDocument();
        });

        it('renders back button in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Retour')).toBeInTheDocument();
        });

        it('displays Core Technology section in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Technologie principale')).toBeInTheDocument();
        });

        it('displays WASM Port section in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Port WASM')).toBeInTheDocument();
        });

        it('displays Built With section in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Construit avec')).toBeInTheDocument();
        });

        it('displays AI Tools section in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Outils IA')).toBeInTheDocument();
        });

        it('displays Open Source section in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Code source ouvert')).toBeInTheDocument();
        });

        it('displays GitHub link in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Voir sur GitHub')).toBeInTheDocument();
        });

        it('displays Thank Him section in French', () => {
            render(<CreditsPage {...frenchProps} />);
            expect(screen.getByText('Remerciez-le pour toutes choses !')).toBeInTheDocument();
        });

        it('displays special thanks in French', () => {
            render(<CreditsPage {...frenchProps} />);
            // Special thanks text is split between a link and text node
            expect(screen.getByText(/Remerciements spéciaux/)).toBeInTheDocument();
            expect(screen.getByText(/à Dieu/)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper heading structure', () => {
            render(<CreditsPage {...defaultProps} />);
            const h1 = screen.getByRole('heading', { level: 1 });
            expect(h1).toBeInTheDocument();
        });

        it('GitHub link opens in new tab', () => {
            render(<CreditsPage {...defaultProps} />);
            const githubLink = screen.getByText('View on GitHub').closest('a');
            expect(githubLink).toHaveAttribute('target', '_blank');
            expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });
});
