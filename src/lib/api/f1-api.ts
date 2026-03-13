// Ergast F1 API integration
// Docs: https://ergast.com/mrd/

import { SportEvent } from './types';

const API_BASE = 'https://ergast.com/api/f1';

interface ErgastRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  Results?: Array<{
    position: string;
    Driver: { givenName: string; familyName: string };
    Constructor: { name: string };
  }>;
}

interface ErgastResponse {
  MRData: {
    RaceTable: {
      Races: ErgastRace[];
    };
  };
}

async function fetchErgast(endpoint: string): Promise<ErgastRace[]> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}.json`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Ergast API error: ${response.status}`);
      return [];
    }

    const data: ErgastResponse = await response.json();
    return data.MRData.RaceTable.Races || [];
  } catch (error) {
    console.error('Ergast API fetch error:', error);
    return [];
  }
}

function transformRace(race: ErgastRace, status: 'upcoming' | 'completed'): SportEvent {
  const raceTime = race.time || '14:00:00Z';
  const startTime = new Date(`${race.date}T${raceTime}`);

  // For F1, we use "home" as the event and "away" as the circuit
  return {
    id: `f1-${race.season}-${race.round}`,
    sport: 'motorsport',
    status,
    homeTeam: {
      id: `f1-race-${race.round}`,
      name: race.raceName,
      logo: 'https://www.formula1.com/etc/designs/fom-website/images/f1_logo.svg',
      score: status === 'completed' && race.Results?.[0]
        ? `P1: ${race.Results[0].Driver.familyName}`
        : undefined,
    },
    awayTeam: {
      id: `f1-circuit-${race.Circuit.circuitId}`,
      name: race.Circuit.circuitName,
      logo: undefined,
      score: status === 'completed' && race.Results?.[1]
        ? `P2: ${race.Results[1].Driver.familyName}`
        : undefined,
    },
    startTime,
    venue: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
    league: 'Formula 1',
    leagueId: 'f1',
    round: `Round ${race.round}`,
  };
}

export async function getF1Upcoming(): Promise<SportEvent[]> {
  const currentYear = new Date().getFullYear();
  const races = await fetchErgast(`/${currentYear}`);

  const now = new Date();
  const upcoming = races.filter((race) => {
    const raceDate = new Date(`${race.date}T${race.time || '14:00:00Z'}`);
    return raceDate > now;
  });

  return upcoming.slice(0, 5).map((race) => transformRace(race, 'upcoming'));
}

export async function getF1Results(): Promise<SportEvent[]> {
  const currentYear = new Date().getFullYear();
  const races = await fetchErgast(`/${currentYear}/results`);

  // Get last 5 completed races
  return races.slice(-5).reverse().map((race) => transformRace(race, 'completed'));
}

export async function getF1Live(): Promise<SportEvent[]> {
  // Ergast doesn't have live data, check if a race is happening now
  const currentYear = new Date().getFullYear();
  const races = await fetchErgast(`/${currentYear}`);

  const now = new Date();
  const live = races.filter((race) => {
    const raceStart = new Date(`${race.date}T${race.time || '14:00:00Z'}`);
    const raceEnd = new Date(raceStart.getTime() + 3 * 60 * 60 * 1000); // ~3 hours
    return now >= raceStart && now <= raceEnd;
  });

  return live.map((race) => transformRace(race, 'upcoming')); // Mark as upcoming since no live scores
}
