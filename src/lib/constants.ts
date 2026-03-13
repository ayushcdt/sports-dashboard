import { LeagueConfig, Sport } from './api/types';

// TheSportsDB API base URL (free tier, no key needed)
export const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// Supported leagues with their IDs
export const LEAGUES: LeagueConfig[] = [
  // Soccer/Football
  { id: '4328', name: 'English Premier League', sport: 'soccer' },
  { id: '4335', name: 'La Liga', sport: 'soccer' },
  { id: '4332', name: 'Serie A', sport: 'soccer' },
  { id: '4331', name: 'Bundesliga', sport: 'soccer' },
  { id: '4334', name: 'Ligue 1', sport: 'soccer' },

  // Basketball
  { id: '4387', name: 'NBA', sport: 'basketball' },

  // Motorsport
  { id: '4370', name: 'Formula 1', sport: 'motorsport' },

  // Tennis
  { id: '4464', name: 'ATP Tour', sport: 'tennis' },
];

// Sport display names and colors (WCAG AA compliant - darker shades for white text contrast)
export const SPORT_CONFIG: Record<Sport, { label: string; color: string }> = {
  soccer: { label: 'Soccer', color: 'bg-green-700' },
  basketball: { label: 'Basketball', color: 'bg-orange-600' },
  motorsport: { label: 'Motorsport', color: 'bg-red-700' },
  tennis: { label: 'Tennis', color: 'bg-amber-600' },
};

// All sports array for filtering
export const ALL_SPORTS: Sport[] = ['soccer', 'basketball', 'motorsport', 'tennis'];
