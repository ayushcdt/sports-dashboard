import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render, createMockEvent } from '@/test/test-utils';
import { EventsGrid } from './events-grid';

describe('EventsGrid', () => {
  it('renders a grid of event cards', () => {
    const events = [
      createMockEvent({ id: '1', homeTeam: { id: 'a', name: 'Team A' }, awayTeam: { id: 'b', name: 'Team B' } }),
      createMockEvent({ id: '2', homeTeam: { id: 'c', name: 'Team C' }, awayTeam: { id: 'd', name: 'Team D' } }),
      createMockEvent({ id: '3', homeTeam: { id: 'e', name: 'Team E' }, awayTeam: { id: 'f', name: 'Team F' } }),
    ];

    render(<EventsGrid events={events} />);

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
    expect(screen.getByText('Team D')).toBeInTheDocument();
    expect(screen.getByText('Team E')).toBeInTheDocument();
    expect(screen.getByText('Team F')).toBeInTheDocument();
  });

  it('shows loading skeletons when isLoading is true', () => {
    render(<EventsGrid events={[]} isLoading={true} />);

    // Should show 6 skeleton cards
    const skeletons = document.querySelectorAll('.rounded-lg.border');
    expect(skeletons.length).toBe(6);
  });

  it('shows empty message when no events', () => {
    render(<EventsGrid events={[]} emptyMessage="No matches today" />);

    expect(screen.getByText('No matches today')).toBeInTheDocument();
  });

  it('shows default empty message when not provided', () => {
    render(<EventsGrid events={[]} />);

    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('does not show empty message when loading', () => {
    render(<EventsGrid events={[]} isLoading={true} emptyMessage="No events" />);

    expect(screen.queryByText('No events')).not.toBeInTheDocument();
  });

  it('renders correct number of event cards', () => {
    const events = Array.from({ length: 5 }, (_, i) =>
      createMockEvent({
        id: `event-${i}`,
        homeTeam: { id: `home-${i}`, name: `Home ${i}` },
        awayTeam: { id: `away-${i}`, name: `Away ${i}` },
      })
    );

    render(<EventsGrid events={events} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
  });
});
