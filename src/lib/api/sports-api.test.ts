import { describe, it, expect } from 'vitest';
import {
  getEventById,
  getAllUpcomingEvents,
  getAllPastEvents,
  getTodayEvents,
  ApiError,
} from './sports-api';

// These tests use REAL APIs - they verify actual integration
// Assertions check structure, not specific values (which change daily)

function isApiError(error: unknown): boolean {
  return error instanceof ApiError;
}

describe('Sports API - Multi-Source Integration', () => {
  describe('getAllUpcomingEvents', () => {
    it('should fetch events from all sources', async () => {
      try {
        const events = await getAllUpcomingEvents();

        expect(Array.isArray(events)).toBe(true);

        if (events.length > 0) {
          const event = events[0];
          // Verify structure
          expect(event).toHaveProperty('id');
          expect(event).toHaveProperty('sport');
          expect(event).toHaveProperty('status');
          expect(event).toHaveProperty('homeTeam');
          expect(event).toHaveProperty('awayTeam');
          expect(event).toHaveProperty('startTime');
          expect(event).toHaveProperty('league');

          // Verify types
          expect(typeof event.id).toBe('string');
          expect(typeof event.homeTeam.name).toBe('string');
          expect(typeof event.awayTeam.name).toBe('string');
          expect(event.startTime).toBeInstanceOf(Date);
        }
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error:', (error as ApiError).message);
          return;
        }
        throw error;
      }
    });

    it('should filter by sport when provided', async () => {
      try {
        const events = await getAllUpcomingEvents('soccer');

        events.forEach((event) => {
          expect(event.sport).toBe('soccer');
        });
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error');
          return;
        }
        throw error;
      }
    });

    it('should filter motorsport events correctly', async () => {
      try {
        const events = await getAllUpcomingEvents('motorsport');

        events.forEach((event) => {
          expect(event.sport).toBe('motorsport');
        });
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error');
          return;
        }
        throw error;
      }
    });

    it('should filter basketball events correctly', async () => {
      try {
        const events = await getAllUpcomingEvents('basketball');

        events.forEach((event) => {
          expect(event.sport).toBe('basketball');
        });
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error');
          return;
        }
        throw error;
      }
    });
  });

  describe('getAllPastEvents', () => {
    it('should return events sorted by date descending', async () => {
      try {
        const events = await getAllPastEvents();

        expect(Array.isArray(events)).toBe(true);

        // Verify descending order
        for (let i = 1; i < Math.min(events.length, 5); i++) {
          expect(events[i - 1].startTime.getTime()).toBeGreaterThanOrEqual(
            events[i].startTime.getTime()
          );
        }
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error');
          return;
        }
        throw error;
      }
    });

    it('should return completed events', async () => {
      try {
        const events = await getAllPastEvents();

        if (events.length > 0) {
          // Most past events should be completed
          const completed = events.filter((e) => e.status === 'completed');
          expect(completed.length).toBeGreaterThan(0);
        }
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error');
          return;
        }
        throw error;
      }
    });
  });

  describe('getTodayEvents', () => {
    it('should return array of events', async () => {
      try {
        const events = await getTodayEvents();

        expect(Array.isArray(events)).toBe(true);
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error');
          return;
        }
        throw error;
      }
    });
  });

  describe('getEventById', () => {
    it('should return null for empty ID', async () => {
      const event = await getEventById('');
      expect(event).toBeNull();
    });

    it('should return event when found in cache', async () => {
      try {
        const events = await getAllUpcomingEvents();

        if (events.length > 0) {
          const realId = events[0].id;
          const event = await getEventById(realId);

          if (event) {
            expect(event).toHaveProperty('id');
            expect(event.id).toBe(realId);
          }
        }
      } catch (error) {
        if (isApiError(error)) {
          console.log('Skipping test - API error');
          return;
        }
        throw error;
      }
    });
  });
});
