// MainPage tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MainPage from '../../pages/MainPage.jsx';

describe('MainPage', () => {
    const defaultProps = {
        onSelectFeature: vi.fn(),
        currentTheme: 'dark',
        onThemeChange: vi.fn(),
        lang: 'en',
        onLangChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English', () => {
        it('renders app title', () => {
            render(<MainPage {...defaultProps} />);
            expect(screen.getByText('PDF Tools by PWA Suite')).toBeInTheDocument();
        });

        it('renders tagline', () => {
            render(<MainPage {...defaultProps} />);
            expect(screen.getByText('Browser-based PDF tools powered by Ghostscript WASM')).toBeInTheDocument();
        });

        it('displays all 6 feature cards', () => {
            render(<MainPage {...defaultProps} />);

            expect(screen.getByText('Compress')).toBeInTheDocument();
            expect(screen.getByText('Merge')).toBeInTheDocument();
            expect(screen.getByText('Split')).toBeInTheDocument();
            expect(screen.getByText('Extract Pages')).toBeInTheDocument();
            expect(screen.getByText('Grayscale')).toBeInTheDocument();
            expect(screen.getByText('Resize')).toBeInTheDocument();
        });

        it('displays feature descriptions', () => {
            render(<MainPage {...defaultProps} />);

            expect(screen.getByText('Reduce PDF file size')).toBeInTheDocument();
            expect(screen.getByText('Combine multiple PDFs')).toBeInTheDocument();
            expect(screen.getByText('Split PDF into pages')).toBeInTheDocument();
            expect(screen.getByText('Extract a range of pages')).toBeInTheDocument();
            expect(screen.getByText('Convert to black & white')).toBeInTheDocument();
            expect(screen.getByText('Change page size (A4, Letter...)')).toBeInTheDocument();
        });

        it('displays privacy first message', () => {
            render(<MainPage {...defaultProps} />);
            expect(screen.getByText('Privacy First:')).toBeInTheDocument();
            expect(screen.getByText(/All processing happens in your browser/)).toBeInTheDocument();
        });

        it('displays footer links', () => {
            render(<MainPage {...defaultProps} />);
            expect(screen.getByText('LICENSE, NO WARRANTY AND LIABILITY LIMITATION')).toBeInTheDocument();
            expect(screen.getByText('Open Source (on GitHub)')).toBeInTheDocument();
            expect(screen.getByText('Credits and Special Thanks')).toBeInTheDocument();
        });

        it('clicking feature card calls onSelectFeature with correct id', () => {
            render(<MainPage {...defaultProps} />);

            fireEvent.click(screen.getByText('Compress'));
            expect(defaultProps.onSelectFeature).toHaveBeenCalledWith('compress');

            fireEvent.click(screen.getByText('Merge'));
            expect(defaultProps.onSelectFeature).toHaveBeenCalledWith('merge');

            fireEvent.click(screen.getByText('Split'));
            expect(defaultProps.onSelectFeature).toHaveBeenCalledWith('split');
        });

        it('clicking license link calls onSelectFeature with license', () => {
            render(<MainPage {...defaultProps} />);

            fireEvent.click(screen.getByText('LICENSE, NO WARRANTY AND LIABILITY LIMITATION'));
            expect(defaultProps.onSelectFeature).toHaveBeenCalledWith('license');
        });

        it('clicking credits link calls onSelectFeature with credits', () => {
            render(<MainPage {...defaultProps} />);

            fireEvent.click(screen.getByText('Credits and Special Thanks'));
            expect(defaultProps.onSelectFeature).toHaveBeenCalledWith('credits');
        });

        it('renders theme selector', () => {
            render(<MainPage {...defaultProps} />);
            // Theme selector should be present (the component renders a button or select)
            const topBar = document.querySelector('.top-bar');
            expect(topBar).toBeInTheDocument();
        });

        it('renders language selector', () => {
            render(<MainPage {...defaultProps} />);
            // Check for language toggle - it shows "en/fr" combined
            expect(screen.getByText('en/fr')).toBeInTheDocument();
        });
    });

    describe('French', () => {
        const frenchProps = { ...defaultProps, lang: 'fr' };

        it('renders app title in French', () => {
            render(<MainPage {...frenchProps} />);
            expect(screen.getByText('Outils PDF par PWA Suite')).toBeInTheDocument();
        });

        it('renders tagline in French', () => {
            render(<MainPage {...frenchProps} />);
            expect(screen.getByText('Outils PDF dans le navigateur propulsés par Ghostscript WASM')).toBeInTheDocument();
        });

        it('displays all feature cards in French', () => {
            render(<MainPage {...frenchProps} />);

            expect(screen.getByText('Compresser')).toBeInTheDocument();
            expect(screen.getByText('Fusionner')).toBeInTheDocument();
            expect(screen.getByText('Diviser')).toBeInTheDocument();
            expect(screen.getByText('Extraire des pages')).toBeInTheDocument();
            expect(screen.getByText('Niveaux de gris')).toBeInTheDocument();
            expect(screen.getByText('Redimensionner')).toBeInTheDocument();
        });

        it('displays feature descriptions in French', () => {
            render(<MainPage {...frenchProps} />);

            expect(screen.getByText('Réduire la taille du fichier PDF')).toBeInTheDocument();
            expect(screen.getByText('Combiner plusieurs PDF')).toBeInTheDocument();
        });

        it('displays privacy message in French', () => {
            render(<MainPage {...frenchProps} />);
            expect(screen.getByText("Confidentialité d'abord :")).toBeInTheDocument();
        });

        it('displays footer links in French', () => {
            render(<MainPage {...frenchProps} />);
            expect(screen.getByText('LICENCE, AUCUNE GARANTIE ET LIMITATION DE RESPONSABILITÉ')).toBeInTheDocument();
            expect(screen.getByText('Code source ouvert (sur GitHub)')).toBeInTheDocument();
            expect(screen.getByText('Crédits et remerciements')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('navigates to each feature page when clicking cards', () => {
            render(<MainPage {...defaultProps} />);

            const features = ['compress', 'merge', 'split', 'extractPages', 'grayscale', 'resize'];
            const titles = ['Compress', 'Merge', 'Split', 'Extract Pages', 'Grayscale', 'Resize'];

            titles.forEach((title, index) => {
                fireEvent.click(screen.getByText(title));
                expect(defaultProps.onSelectFeature).toHaveBeenCalledWith(features[index]);
            });
        });
    });
});
