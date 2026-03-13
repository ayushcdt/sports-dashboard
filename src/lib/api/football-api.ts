// API-Football integration for Soccer data
// Docs: https://www.api-football.com/documentation-v3

import { SportEvent } from './types';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY || '';

// League IDs for API-Football
const LEAGUES = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
};

interface APIFootballFixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    venue: { name: string } | null;
    status: {
      short: string;
      long: string;
    };
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface APIFootballResponse {
  response: APIFootballFixture[];
  errors: Record<string, string>;
}

async function fetchFootball(endpoint: string): Promise<APIFootballFixture[]> {
  if (!API_KEY) {
    console.error('API_FOOTBALL_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'x-apisports-key': API_KEY,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`API-Football error: ${response.status}`);
      return [];
    }

    const data: APIFootballResponse = await response.json();

    if (Object.keys(data.errors).length > 0) {
      console.error('API-Football errors:', data.errors);
      return [];
    }

    return data.response || [];
  } catch (error) {
    console.error('API-Football fetch error:', error);
    return [];
  }
}

function getStatus(statusShort: string): 'upcoming' | 'live' | 'completed' {
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'];
  const completedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];

  if (liveStatuses.includes(statusShort)) return 'live';
  if (completedStatuses.includes(statusShort)) return 'completed';
  return 'upcoming';
}

function transformFixture(fixture: APIFootballFixture): SportEvent {
  return {
    id: `fb-${fixture.fixture.id}`,
    sport: 'soccer',
    status: getStatus(fixture.fixture.status.short),
    homeTeam: {
      id: `fb-team-${fixture.teams.home.id}`,
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
      score: fixture.goals.home?.toString(),
    },
    awayTeam: {
      id: `fb-team-${fixture.teams.away.id}`,
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
      score: fixture.goals.away?.toString(),
    },
    startTime: new Date(fixture.fixture.date),
    venue: fixture.fixture.venue?.name,
    league: fixture.league.name,
    leagueId: `fb-${fixture.league.id}`,
    round: fixture.league.round,
  };
}

export async function getSoccerUpcoming(): Promise<SportEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const leagueIds = Object.values(LEAGUES).join('-');
  const fixtures = await fetchFootball(
    `/fixtures?league=${leagueIds}&from=${today}&to=${nextWeek}&status=NS-TBD`
  );

  // If batch request fails, try individual leagues
  if (fixtures.length === 0) {
    const allFixtures: APIFootballFixture[] = [];
    for (const leagueId of Object.values(LEAGUES)) {
      const leagueFixtures = await fetchFootball(
        `/fixtures?league=${leagueId}&from=${today}&to=${nextWeek}&status=NS-TBD`
      );
      allFixtures.push(...leagueFixtures);
    }
    return allFixtures.map(transformFixture);
  }

  return fixtures.map(transformFixture);
}

export async function getSoccerLive(): Promise<SportEvent[]> {
  const fixtures = await fetchFootball('/fixtures?live=all');

  // Filter to our leagues only
  const leagueIds = Object.values(LEAGUES);
  const filtered = fixtures.filter((f) => leagueIds.includes(f.league.id));

  return filtered.map(transformFixture);
}

export async function getSoccerResults(): Promise<SportEvent[]> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const allFixtures: APIFootballFixture[] = [];
  for (const leagueId of Object.values(LEAGUES)) {
    const fixtures = await fetchFootball(
      `/fixtures?league=${leagueId}&from=${yesterday}&to=${today}&status=FT-AET-PEN`
    );
    allFixtures.push(...fixtures);
  }

  return allFixtures.map(transformFixture);
}
