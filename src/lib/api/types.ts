// Sport types supported by the app
export type Sport = 'soccer' | 'basketball' | 'motorsport';

// Event status
export type EventStatus = 'upcoming' | 'live' | 'completed';

// Team information
export interface Team {
  id: string;
  name: string;
  logo?: string;
  score?: string;
}

// Sport event
export interface SportEvent {
  id: string;
  sport: Sport;
  status: EventStatus;
  homeTeam: Team;
  awayTeam: Team;
  startTime: Date;
  venue?: string;
  league: string;
  leagueId: string;
  round?: string;
  thumbnail?: string;
}

// TheSportsDB API response types
export interface TheSportsDBEvent {
  idEvent: string;
  strEvent: string;
  strSport: string;
  strLeague: string;
  idLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strTimestamp: string;
  dateEvent: string;
  strTime: string;
  strVenue: string | null;
  strThumb: string | null;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  strRound: string | null;
  strStatus: string | null;
}

export interface TheSportsDBResponse {
  events: TheSportsDBEvent[] | null;
}

// League configuration
export interface LeagueConfig {
  id: string;
  name: string;
  sport: Sport;
}
