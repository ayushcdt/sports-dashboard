'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePastEvents } from '@/hooks/use-events';
import { EventsGrid } from '@/components/events-grid';
import { SportFilter } from '@/components/sport-filter';
import { QueryError } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Sport } from '@/lib/api/types';

export default function ResultsPage() {
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
  const {
    data: events = [],
    isLoading,
    error,
    refresh,
    lastUpdated,
    isFetching,
  } = usePastEvents(selectedSport === 'all' ? undefined : selectedSport);

  if (error && !events.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">Completed matches and final scores</p>
        </div>
        <QueryError
          error={error}
          onRetry={refresh}
          message="Failed to load results"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">Completed matches and final scores</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <SportFilter selected={selectedSport} onSelect={setSelectedSport} />

      <EventsGrid
        events={events}
        isLoading={isLoading}
        emptyMessage={
          selectedSport === 'all'
            ? 'No results found'
            : `No ${selectedSport} results found`
        }
      />
    </div>
  );
}
