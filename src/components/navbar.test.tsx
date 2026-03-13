import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/test-utils';
import { Navbar } from './navbar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

describe('Navbar', () => {
  it('renders the app title', () => {
    render(<Navbar />);

    expect(screen.getByText('Sports Tracker')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navbar />);

    // Multiple links exist (desktop + mobile), so use getAllByRole
    expect(screen.getAllByRole('link', { name: 'Live' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Upcoming' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Results' }).length).toBeGreaterThan(0);
  });

  it('has correct href for navigation links', () => {
    render(<Navbar />);

    // Check the first occurrence of each link (desktop nav)
    const liveLinks = screen.getAllByRole('link', { name: 'Live' });
    const upcomingLinks = screen.getAllByRole('link', { name: 'Upcoming' });
    const resultsLinks = screen.getAllByRole('link', { name: 'Results' });

    expect(liveLinks[0]).toHaveAttribute('href', '/');
    expect(upcomingLinks[0]).toHaveAttribute('href', '/upcoming');
    expect(resultsLinks[0]).toHaveAttribute('href', '/results');
  });

  it('links title to home page', () => {
    render(<Navbar />);

    // The accessible name includes both desktop and mobile text
    const titleLink = screen.getByRole('link', { name: /Sports Tracker/i });
    expect(titleLink).toHaveAttribute('href', '/');
  });
});
