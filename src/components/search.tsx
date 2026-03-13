'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { useUpcomingEvents, usePastEvents } from '@/hooks/use-events';
import { SportEvent } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { SPORT_CONFIG } from '@/lib/constants';
import { format } from 'date-fns';

export function Search() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch events for searching
  const { data: upcomingEvents = [] } = useUpcomingEvents();
  const { data: pastEvents = [] } = usePastEvents();

  // Compute search results using useMemo
  const results = useMemo<SportEvent[]>(() => {
    if (debouncedQuery.length < 2) {
      return [];
    }

    const allEvents = [...upcomingEvents, ...pastEvents];
    const searchLower = debouncedQuery.toLowerCase();
    const filtered = allEvents.filter(
      (event) =>
        event.homeTeam.name.toLowerCase().includes(searchLower) ||
        event.awayTeam.name.toLowerCase().includes(searchLower) ||
        event.league.toLowerCase().includes(searchLower)
    );

    // Remove duplicates by id and limit to 6 results
    const uniqueResults = filtered.filter(
      (event, index, self) => index === self.findIndex((e) => e.id === event.id)
    );
    return uniqueResults.slice(0, 6);
  }, [debouncedQuery, upcomingEvents, pastEvents]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
      // Only trigger on / if not already focused on an input
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {!isOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="gap-2 h-9"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="hidden sm:inline text-muted-foreground">Search...</span>
          <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            /
          </kbd>
        </Button>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                placeholder="Search teams or leagues..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-40 sm:w-56 h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Search events"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-autocomplete="list"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
            >
              <span className="sr-only sm:not-sr-only">Cancel</span>
              <X className="h-4 w-4 sm:hidden" />
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {results.length > 0 && (
            <div
              id="search-results"
              className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-background border rounded-md shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto"
              role="listbox"
            >
              {results.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="block px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0"
                  role="option"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded text-white ${SPORT_CONFIG[event.sport].color}`}
                    >
                      {SPORT_CONFIG[event.sport].label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(event.startTime, 'MMM d')}
                    </span>
                  </div>
                  <p className="font-medium text-sm">
                    {event.homeTeam.name} vs {event.awayTeam.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.league}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-background border rounded-md shadow-lg z-50 p-4 text-center text-muted-foreground text-sm">
              No events found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
