'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTodayEvents,
  getAllUpcomingEvents,
  getAllPastEvents,
  getEventById,
} from '@/lib/api/sports-api';
import { Sport } from '@/lib/api/types';

// Retry configuration with exponential backoff
const retryConfig = {
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Hook for today's events (live + today's schedule)
export function useTodayEvents(sport?: Sport) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['events', 'today', sport],
    queryFn: () => getTodayEvents(sport),
    refetchInterval: 30000, // Refetch every 30 seconds for live events
    staleTime: 15000, // 15 seconds
    ...retryConfig,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['events', 'today'] });
  };

  return {
    ...query,
    refresh,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
}

// Hook for upcoming events
export function useUpcomingEvents(sport?: Sport) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['events', 'upcoming', sport],
    queryFn: () => getAllUpcomingEvents(sport),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...retryConfig,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] });
  };

  return {
    ...query,
    refresh,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
}

// Hook for past events (results)
export function usePastEvents(sport?: Sport) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['events', 'past', sport],
    queryFn: () => getAllPastEvents(sport),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...retryConfig,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['events', 'past'] });
  };

  return {
    ...query,
    refresh,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
}

// Hook for single event details
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId && /^\d+$/.test(eventId),
    staleTime: 60000,
    ...retryConfig,
  });
}
