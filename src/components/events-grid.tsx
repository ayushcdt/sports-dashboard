'use client';

import { Calendar, Trophy, Clock } from 'lucide-react';
import { EventCard } from './event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { SportEvent } from '@/lib/api/types';

interface EventsGridProps {
  events: SportEvent[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: 'calendar' | 'trophy' | 'clock';
}

function EventCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3" aria-hidden="true">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2 pt-2">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-6" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-6" />
        </div>
      </div>
    </div>
  );
}

const emptyIcons = {
  calendar: Calendar,
  trophy: Trophy,
  clock: Clock,
};

export function EventsGrid({
  events,
  isLoading,
  emptyMessage = 'No events found',
  emptyIcon = 'calendar',
}: EventsGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading events"
      >
        <span className="sr-only">Loading events, please wait...</span>
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    const EmptyIcon = emptyIcons[emptyIcon];
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-4 mb-4">
          <EmptyIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Check back later for updates or try a different filter.
        </p>
      </div>
    );
  }

  return (
    <section aria-label={`${events.length} events`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
