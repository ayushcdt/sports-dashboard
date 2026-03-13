'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SportEvent } from '@/lib/api/types';
import { SPORT_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: SportEvent;
}

const statusColors = {
  live: 'bg-red-600 animate-pulse',
  upcoming: 'bg-blue-600',
  completed: 'bg-gray-600',
};

export function EventCard({ event }: EventCardProps) {
  const sportConfig = SPORT_CONFIG[event.sport];

  const statusLabels = {
    live: 'LIVE',
    upcoming: format(event.startTime, 'HH:mm'),
    completed: 'FT',
  };

  return (
    <Link
      href={`/event/${event.id}`}
      aria-label={`${event.homeTeam.name} vs ${event.awayTeam.name} - ${event.league}`}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn('text-white', sportConfig.color)}>
              {sportConfig.label}
            </Badge>
            <Badge
              className={cn('text-white', statusColors[event.status])}
              role={event.status === 'live' ? 'status' : undefined}
              aria-live={event.status === 'live' ? 'polite' : undefined}
            >
              {statusLabels[event.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{event.league}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {event.homeTeam.logo && (
                  <Image
                    src={event.homeTeam.logo}
                    alt={`${event.homeTeam.name} logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized
                  />
                )}
                <span className="font-medium">{event.homeTeam.name}</span>
              </div>
              {event.homeTeam.score && (
                <span className="text-xl font-bold">{event.homeTeam.score}</span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {event.awayTeam.logo && (
                  <Image
                    src={event.awayTeam.logo}
                    alt={`${event.awayTeam.name} logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized
                  />
                )}
                <span className="font-medium">{event.awayTeam.name}</span>
              </div>
              {event.awayTeam.score && (
                <span className="text-xl font-bold">{event.awayTeam.score}</span>
              )}
            </div>

            {/* Event info */}
            {event.status === 'upcoming' && (
              <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                {format(event.startTime, 'EEE, MMM d · HH:mm')}
              </p>
            )}
            {event.venue && event.status === 'upcoming' && (
              <p className="text-xs text-muted-foreground text-center">
                {event.venue}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
