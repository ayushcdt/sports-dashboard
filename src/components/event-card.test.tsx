import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import {
  render,
  createMockEvent,
  createCompletedEvent,
  createLiveEvent,
} from '@/test/test-utils';
import { EventCard } from './event-card';

describe('EventCard', () => {
  it('renders team names', () => {
    const event = createMockEvent({
      homeTeam: { id: 'arsenal', name: 'Arsenal' },
      awayTeam: { id: 'chelsea', name: 'Chelsea' },
    });

    render(<EventCard event={event} />);

    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Chelsea')).toBeInTheDocument();
  });

  it('renders league name', () => {
    const event = createMockEvent({ league: 'Premier League' });

    render(<EventCard event={event} />);

    expect(screen.getByText('Premier League')).toBeInTheDocument();
  });

  it('renders sport badge', () => {
    const event = createMockEvent({ sport: 'soccer' });

    render(<EventCard event={event} />);

    expect(screen.getByText('Soccer')).toBeInTheDocument();
  });

  describe('status display', () => {
    it('shows LIVE badge for live events', () => {
      const event = createLiveEvent();

      render(<EventCard event={event} />);

      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('shows FT badge for completed events', () => {
      const event = createCompletedEvent();

      render(<EventCard event={event} />);

      expect(screen.getByText('FT')).toBeInTheDocument();
    });

    it('shows time for upcoming events', () => {
      const event = createMockEvent({
        status: 'upcoming',
        startTime: new Date('2025-03-20T15:00:00Z'),
      });

      render(<EventCard event={event} />);

      // Should show formatted time
      const timeElements = screen.getAllByText(/15:00|20:30/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('scores', () => {
    it('shows scores for completed events', () => {
      const event = createCompletedEvent({
        homeTeam: { id: 'home', name: 'Home', score: '3' },
        awayTeam: { id: 'away', name: 'Away', score: '1' },
      });

      render(<EventCard event={event} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows scores for live events', () => {
      const event = createLiveEvent({
        homeTeam: { id: 'home', name: 'Home', score: '2' },
        awayTeam: { id: 'away', name: 'Away', score: '2' },
      });

      render(<EventCard event={event} />);

      expect(screen.getAllByText('2')).toHaveLength(2);
    });

    it('does not show scores for upcoming events', () => {
      const event = createMockEvent({ status: 'upcoming' });

      render(<EventCard event={event} />);

      // Should not have score elements
      const scores = screen.queryAllByText(/^\d+$/);
      expect(scores.filter((el) => el.classList.contains('font-bold'))).toHaveLength(0);
    });
  });

  it('links to event detail page', () => {
    const event = createMockEvent({ id: 'event-123' });

    render(<EventCard event={event} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/event/event-123');
  });

  it('shows venue for upcoming events', () => {
    const event = createMockEvent({
      status: 'upcoming',
      venue: 'Emirates Stadium',
    });

    render(<EventCard event={event} />);

    expect(screen.getByText('Emirates Stadium')).toBeInTheDocument();
  });
});
