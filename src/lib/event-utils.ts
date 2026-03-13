import { format } from 'date-fns';
import { EventStatus, SportEvent } from './api/types';

// Status display configuration - centralized to avoid duplication
export const STATUS_CONFIG: Record<
  EventStatus,
  {
    color: string;
    label: string | ((event: SportEvent) => string);
    ariaLive?: boolean;
  }
> = {
  live: {
    color: 'bg-red-600 animate-pulse motion-reduce:animate-none',
    label: 'LIVE',
    ariaLive: true,
  },
  upcoming: {
    color: 'bg-blue-600',
    label: (event) => format(event.startTime, 'HH:mm'),
  },
  completed: {
    color: 'bg-gray-600',
    label: 'FT',
  },
};

// Get status display properties for an event
export function getStatusDisplay(event: SportEvent) {
  const config = STATUS_CONFIG[event.status];
  return {
    color: config.color,
    label: typeof config.label === 'function' ? config.label(event) : config.label,
    ariaLive: config.ariaLive,
  };
}

// Status labels for detail page (different format)
export const STATUS_LABELS: Record<EventStatus, string> = {
  live: 'LIVE',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

// Format event time for display
export function formatEventTime(event: SportEvent, formatStr: string = 'HH:mm'): string {
  return format(event.startTime, formatStr);
}

// Format event date for display
export function formatEventDate(
  event: SportEvent,
  formatStr: string = 'EEE, MMM d'
): string {
  return format(event.startTime, formatStr);
}

// Get full event title for accessibility
export function getEventTitle(event: SportEvent): string {
  return `${event.homeTeam.name} vs ${event.awayTeam.name} - ${event.league}`;
}

// Check if event is currently live
export function isLiveEvent(event: SportEvent): boolean {
  return event.status === 'live';
}

// Get score display string
export function getScoreDisplay(event: SportEvent): string {
  if (event.status === 'upcoming') {
    return 'vs';
  }
  const homeScore = event.homeTeam.score ?? '-';
  const awayScore = event.awayTeam.score ?? '-';
  return `${homeScore} - ${awayScore}`;
}
