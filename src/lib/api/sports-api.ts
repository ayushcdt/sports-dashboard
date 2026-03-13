// Unified Sports API - aggregates data from multiple sources
// Soccer: API-Football
// F1: Ergast API
// NBA: balldontlie

import { Sport, SportEvent } from './types';
import { getSoccerUpcoming, getSoccerLive, getSoccerResults } from './football-api';
import { getF1Upcoming, getF1Live, getF1Results } from './f1-api';
import { getNBAUpcoming, getNBALive, getNBAResults } from './nba-api';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get all upcoming events across all sports
export async function getAllUpcomingEvents(sport?: Sport): Promise<SportEvent[]> {
  const results = await Promise.allSettled([
    sport === 'soccer' || !sport ? getSoccerUpcoming() : Promise.resolve([]),
    sport === 'motorsport' || !sport ? getF1Upcoming() : Promise.resolve([]),
    sport === 'basketball' || !sport ? getNBAUpcoming() : Promise.resolve([]),
  ]);

  const events: SportEvent[] = [];
  let errorCount = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    } else {
      errorCount++;
      console.error('Failed to fetch events:', result.reason);
    }
  }

  // If all requests failed, throw error
  if (errorCount === 3 && !sport) {
    throw new ApiError('Failed to fetch events from all sources', undefined, 'ALL_FAILED');
  }

  // Sort by start time
  return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Get all past events (results) across all sports
export async function getAllPastEvents(sport?: Sport): Promise<SportEvent[]> {
  const results = await Promise.allSettled([
    sport === 'soccer' || !sport ? getSoccerResults() : Promise.resolve([]),
    sport === 'motorsport' || !sport ? getF1Results() : Promise.resolve([]),
    sport === 'basketball' || !sport ? getNBAResults() : Promise.resolve([]),
  ]);

  const events: SportEvent[] = [];
  let errorCount = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    } else {
      errorCount++;
      console.error('Failed to fetch results:', result.reason);
    }
  }

  if (errorCount === 3 && !sport) {
    throw new ApiError('Failed to fetch results from all sources', undefined, 'ALL_FAILED');
  }

  // Sort by start time (newest first)
  return events.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

// Get today's events (live + scheduled for today)
export async function getTodayEvents(sport?: Sport): Promise<SportEvent[]> {
  const results = await Promise.allSettled([
    sport === 'soccer' || !sport ? getSoccerLive() : Promise.resolve([]),
    sport === 'motorsport' || !sport ? getF1Live() : Promise.resolve([]),
    sport === 'basketball' || !sport ? getNBALive() : Promise.resolve([]),
  ]);

  const events: SportEvent[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    }
  }

  // Also get upcoming events for today
  const upcoming = await getAllUpcomingEvents(sport);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayUpcoming = upcoming.filter((event) => {
    return event.startTime >= today && event.startTime < tomorrow;
  });

  events.push(...todayUpcoming);

  // Remove duplicates by ID
  const unique = events.filter(
    (event, index, self) => index === self.findIndex((e) => e.id === event.id)
  );

  return unique.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Get event by ID
export async function getEventById(eventId: string): Promise<SportEvent | null> {
  // Parse the event ID to determine source
  if (!eventId) return null;

  // Try to find in recent events (this is a simplified approach)
  // In production, you'd call the specific API based on the ID prefix
  const allEvents = await Promise.all([
    getAllUpcomingEvents(),
    getAllPastEvents(),
  ]);

  const combined = [...allEvents[0], ...allEvents[1]];
  return combined.find((event) => event.id === eventId) || null;
}
