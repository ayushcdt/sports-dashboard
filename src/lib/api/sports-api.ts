import { z } from 'zod';
import { format, parseISO, isAfter, isBefore, addHours } from 'date-fns';
import { API_BASE_URL, LEAGUES } from '../constants';
import { Sport, SportEvent, EventStatus } from './types';

// Zod schemas for API validation
// Schema matches REAL API responses - some fields can be missing entirely
const TheSportsDBEventSchema = z.object({
  idEvent: z.string(),
  strEvent: z.string(),
  strSport: z.string(),
  strLeague: z.string(),
  idLeague: z.string(),
  strHomeTeam: z.string(),
  strAwayTeam: z.string(),
  intHomeScore: z.string().nullable().optional(),
  intAwayScore: z.string().nullable().optional(),
  strTimestamp: z.string().nullable().optional(),
  dateEvent: z.string(),
  strTime: z.string().nullable().optional(),
  strVenue: z.string().nullable().optional(),
  strThumb: z.string().nullable().optional(),
  strHomeTeamBadge: z.string().nullable().optional(),
  strAwayTeamBadge: z.string().nullable().optional(),
  strRound: z.string().nullable().optional(),
  strStatus: z.string().nullable().optional(),
});

const TheSportsDBResponseSchema = z.object({
  events: z.array(TheSportsDBEventSchema).nullable(),
});

type TheSportsDBEvent = z.infer<typeof TheSportsDBEventSchema>;

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

// Fetch timeout constant
const FETCH_TIMEOUT = 10000; // 10 seconds

// Fetch with timeout using AbortController
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Sanitize string to prevent XSS
function sanitizeString(str: string | null | undefined): string | undefined {
  if (!str) return undefined;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Validate URL for images
function validateImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'www.thesportsdb.com' && parsed.protocol === 'https:') {
      return url;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// Map TheSportsDB sport names to our sport types
const SPORT_MAP: Record<string, Sport> = {
  Soccer: 'soccer',
  Basketball: 'basketball',
  Motorsport: 'motorsport',
  Tennis: 'tennis',
};

function mapSportName(sportName: string): Sport {
  return SPORT_MAP[sportName] || 'soccer';
}

// Determine event status based on time and scores
function getEventStatus(event: TheSportsDBEvent): EventStatus {
  const now = new Date();
  const eventTime = parseISO(
    event.strTimestamp || `${event.dateEvent}T${event.strTime || '00:00:00'}`
  );

  // If we have scores, it's likely completed
  if (event.intHomeScore !== null && event.intAwayScore !== null) {
    return 'completed';
  }

  // Check if event is in progress (started within last 3 hours)
  const threeHoursAfterStart = addHours(eventTime, 3);
  if (isAfter(now, eventTime) && isBefore(now, threeHoursAfterStart)) {
    return 'live';
  }

  // If event time is in the past but no score, mark as completed
  if (isBefore(eventTime, now)) {
    return 'completed';
  }

  return 'upcoming';
}

// Transform TheSportsDB event to our SportEvent type with sanitization
function transformEvent(event: TheSportsDBEvent): SportEvent {
  const eventTime = parseISO(
    event.strTimestamp || `${event.dateEvent}T${event.strTime || '00:00:00'}`
  );

  return {
    id: event.idEvent,
    sport: mapSportName(event.strSport),
    status: getEventStatus(event),
    homeTeam: {
      id: event.strHomeTeam.toLowerCase().replace(/\s+/g, '-'),
      name: sanitizeString(event.strHomeTeam) || 'Unknown',
      logo: validateImageUrl(event.strHomeTeamBadge),
      score: event.intHomeScore || undefined,
    },
    awayTeam: {
      id: event.strAwayTeam.toLowerCase().replace(/\s+/g, '-'),
      name: sanitizeString(event.strAwayTeam) || 'Unknown',
      logo: validateImageUrl(event.strAwayTeamBadge),
      score: event.intAwayScore || undefined,
    },
    startTime: eventTime,
    venue: sanitizeString(event.strVenue),
    league: sanitizeString(event.strLeague) || 'Unknown League',
    leagueId: event.idLeague,
    round: sanitizeString(event.strRound),
    thumbnail: validateImageUrl(event.strThumb),
  };
}

// Generic fetch function with validation and error handling
async function fetchEvents(
  url: string,
  revalidate: number
): Promise<TheSportsDBEvent[]> {
  try {
    const response = await fetchWithTimeout(url, {
      next: { revalidate },
    } as RequestInit);

    if (!response.ok) {
      throw new ApiError(
        `API returned ${response.status}`,
        response.status,
        'HTTP_ERROR'
      );
    }

    const rawData = await response.json();
    const validatedData = TheSportsDBResponseSchema.safeParse(rawData);

    if (!validatedData.success) {
      console.error('API response validation failed:', validatedData.error);
      throw new ApiError('Invalid API response format', undefined, 'VALIDATION_ERROR');
    }

    return validatedData.data.events || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', undefined, 'TIMEOUT');
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      undefined,
      'FETCH_ERROR'
    );
  }
}

// Fetch events by date
export async function getEventsByDate(date: Date): Promise<SportEvent[]> {
  const dateStr = format(date, 'yyyy-MM-dd');
  const url = `${API_BASE_URL}/eventsday.php?d=${dateStr}`;

  const events = await fetchEvents(url, 60);
  return events
    .filter((e) => LEAGUES.some((l) => l.id === e.idLeague))
    .map(transformEvent);
}

// Fetch upcoming events for a league
export async function getUpcomingEvents(leagueId: string): Promise<SportEvent[]> {
  const url = `${API_BASE_URL}/eventsnextleague.php?id=${leagueId}`;
  const events = await fetchEvents(url, 300);
  return events.map(transformEvent);
}

// Fetch past events (results) for a league
export async function getPastEvents(leagueId: string): Promise<SportEvent[]> {
  const url = `${API_BASE_URL}/eventspastleague.php?id=${leagueId}`;
  const events = await fetchEvents(url, 300);
  return events.map(transformEvent);
}

// Fetch all upcoming events across all leagues with error aggregation
export async function getAllUpcomingEvents(sport?: Sport): Promise<SportEvent[]> {
  const leagues = sport ? LEAGUES.filter((l) => l.sport === sport) : LEAGUES;

  const results = await Promise.allSettled(
    leagues.map((league) => getUpcomingEvents(league.id))
  );

  const events: SportEvent[] = [];
  let errorCount = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    } else {
      errorCount++;
      console.error('Failed to fetch league events:', result.reason);
    }
  }

  // If all requests failed, throw error
  if (errorCount === leagues.length && leagues.length > 0) {
    throw new ApiError('Failed to fetch events from all leagues', undefined, 'ALL_FAILED');
  }

  // Filter to only show truly upcoming events (not completed/past)
  const now = new Date();
  const upcomingOnly = events.filter(
    (event) => event.status === 'upcoming' && event.startTime > now
  );

  return upcomingOnly.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Fetch all past events across all leagues with error aggregation
export async function getAllPastEvents(sport?: Sport): Promise<SportEvent[]> {
  const leagues = sport ? LEAGUES.filter((l) => l.sport === sport) : LEAGUES;

  const results = await Promise.allSettled(
    leagues.map((league) => getPastEvents(league.id))
  );

  const events: SportEvent[] = [];
  let errorCount = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    } else {
      errorCount++;
      console.error('Failed to fetch league events:', result.reason);
    }
  }

  // If all requests failed, throw error
  if (errorCount === leagues.length && leagues.length > 0) {
    throw new ApiError('Failed to fetch events from all leagues', undefined, 'ALL_FAILED');
  }

  // Filter to only show completed events
  const completedOnly = events.filter((event) => event.status === 'completed');

  return completedOnly.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

// Fetch event details by ID
export async function getEventById(eventId: string): Promise<SportEvent | null> {
  // Validate event ID format (should be numeric)
  if (!/^\d+$/.test(eventId)) {
    return null;
  }

  const url = `${API_BASE_URL}/lookupevent.php?id=${eventId}`;
  const events = await fetchEvents(url, 60);

  if (events.length === 0) return null;
  return transformEvent(events[0]);
}

// Get today's events (combines live and scheduled for today)
export async function getTodayEvents(sport?: Sport): Promise<SportEvent[]> {
  const today = new Date();
  const events = await getEventsByDate(today);

  if (sport) {
    return events.filter((e) => e.sport === sport);
  }

  return events;
}
