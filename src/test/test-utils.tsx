import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SportEvent } from '@/lib/api/types';

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const testQueryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factory - creates SportEvent objects for component testing
// This is NOT mocking the API - it's providing props to test UI rendering
export function createMockEvent(overrides: Partial<SportEvent> = {}): SportEvent {
  return {
    id: '12345',
    sport: 'soccer',
    status: 'upcoming',
    homeTeam: {
      id: 'home-team',
      name: 'Home Team',
      // No logo by default - simpler tests
    },
    awayTeam: {
      id: 'away-team',
      name: 'Away Team',
    },
    startTime: new Date('2025-03-20T15:00:00Z'),
    venue: 'Test Stadium',
    league: 'Test League',
    leagueId: '4328',
    round: '10',
    ...overrides,
  };
}

// Create a completed event with scores
export function createCompletedEvent(
  overrides: Partial<SportEvent> = {}
): SportEvent {
  return createMockEvent({
    status: 'completed',
    homeTeam: {
      id: 'home-team',
      name: 'Home Team',
      score: '2',
    },
    awayTeam: {
      id: 'away-team',
      name: 'Away Team',
      score: '1',
    },
    ...overrides,
  });
}

// Create a live event
export function createLiveEvent(overrides: Partial<SportEvent> = {}): SportEvent {
  return createMockEvent({
    status: 'live',
    homeTeam: {
      id: 'home-team',
      name: 'Home Team',
      score: '1',
    },
    awayTeam: {
      id: 'away-team',
      name: 'Away Team',
      score: '0',
    },
    ...overrides,
  });
}
