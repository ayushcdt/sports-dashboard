// balldontlie NBA API integration
// Docs: https://www.balldontlie.io/

import { SportEvent } from './types';

const API_BASE = 'https://api.balldontlie.io/v1';

interface BallDontLieTeam {
  id: number;
  full_name: string;
  abbreviation: string;
}

interface BallDontLieGame {
  id: number;
  date: string;
  status: string;
  home_team: BallDontLieTeam;
  visitor_team: BallDontLieTeam;
  home_team_score: number;
  visitor_team_score: number;
}

interface BallDontLieResponse {
  data: BallDontLieGame[];
  meta: {
    next_cursor: number | null;
  };
}

// NBA team logos (balldontlie doesn't provide these)
const NBA_LOGOS: Record<string, string> = {
  ATL: 'https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg',
  BOS: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
  BKN: 'https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg',
  CHA: 'https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg',
  CHI: 'https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg',
  CLE: 'https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg',
  DAL: 'https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg',
  DEN: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg',
  DET: 'https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg',
  GSW: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
  HOU: 'https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg',
  IND: 'https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg',
  LAC: 'https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg',
  LAL: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
  MEM: 'https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg',
  MIA: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg',
  MIL: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg',
  MIN: 'https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg',
  NOP: 'https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg',
  NYK: 'https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg',
  OKC: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg',
  ORL: 'https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg',
  PHI: 'https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg',
  PHX: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg',
  POR: 'https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg',
  SAC: 'https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg',
  SAS: 'https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg',
  TOR: 'https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg',
  UTA: 'https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg',
  WAS: 'https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg',
};

async function fetchNBA(endpoint: string): Promise<BallDontLieGame[]> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`balldontlie API error: ${response.status}`);
      return [];
    }

    const data: BallDontLieResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('balldontlie API fetch error:', error);
    return [];
  }
}

function getGameStatus(status: string, homeScore: number, awayScore: number): 'upcoming' | 'live' | 'completed' {
  if (status === 'Final') return 'completed';
  if (homeScore > 0 || awayScore > 0) return 'live';
  return 'upcoming';
}

function transformGame(game: BallDontLieGame): SportEvent {
  const status = getGameStatus(game.status, game.home_team_score, game.visitor_team_score);

  return {
    id: `nba-${game.id}`,
    sport: 'basketball',
    status,
    homeTeam: {
      id: `nba-team-${game.home_team.id}`,
      name: game.home_team.full_name,
      logo: NBA_LOGOS[game.home_team.abbreviation],
      score: status !== 'upcoming' ? game.home_team_score.toString() : undefined,
    },
    awayTeam: {
      id: `nba-team-${game.visitor_team.id}`,
      name: game.visitor_team.full_name,
      logo: NBA_LOGOS[game.visitor_team.abbreviation],
      score: status !== 'upcoming' ? game.visitor_team_score.toString() : undefined,
    },
    startTime: new Date(game.date),
    venue: undefined, // API doesn't provide venue
    league: 'NBA',
    leagueId: 'nba',
    round: undefined,
  };
}

export async function getNBAUpcoming(): Promise<SportEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const games = await fetchNBA(`/games?start_date=${today}&end_date=${nextWeek}`);

  const now = new Date();
  const upcoming = games.filter((game) => {
    const gameDate = new Date(game.date);
    return gameDate > now && game.status !== 'Final';
  });

  return upcoming.slice(0, 20).map(transformGame);
}

export async function getNBAResults(): Promise<SportEvent[]> {
  const yesterday = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const games = await fetchNBA(`/games?start_date=${yesterday}&end_date=${today}`);

  const completed = games.filter((game) => game.status === 'Final');

  return completed.slice(0, 20).map(transformGame);
}

export async function getNBALive(): Promise<SportEvent[]> {
  const today = new Date().toISOString().split('T')[0];

  const games = await fetchNBA(`/games?start_date=${today}&end_date=${today}`);

  const live = games.filter((game) => {
    return game.status !== 'Final' && (game.home_team_score > 0 || game.visitor_team_score > 0);
  });

  return live.map(transformGame);
}
