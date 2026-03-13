import { Sport } from './api/types';

// Sport display names and colors (WCAG AA compliant)
export const SPORT_CONFIG: Record<Sport, { label: string; color: string }> = {
  soccer: { label: 'Soccer', color: 'bg-green-700' },
  basketball: { label: 'Basketball', color: 'bg-orange-600' },
  motorsport: { label: 'Motorsport', color: 'bg-red-700' },
};

// All sports array for filtering
export const ALL_SPORTS: Sport[] = ['soccer', 'basketball', 'motorsport'];
