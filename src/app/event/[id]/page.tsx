'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useEvent } from '@/hooks/use-events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SPORT_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

const statusColors = {
  live: 'bg-red-600 animate-pulse',
  upcoming: 'bg-blue-600',
  completed: 'bg-gray-600',
};

const statusLabels = {
  live: 'LIVE',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export default function EventPage({ params }: EventPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: event, isLoading, error } = useEvent(id);

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading event details">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive">Error loading event</h1>
        <p className="text-muted-foreground mt-2">
          Something went wrong while loading this event.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <p className="text-muted-foreground mt-2">
          This event may have been removed or doesn&apos;t exist.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
          <Link href="/">
            <Button>View all events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sportConfig = SPORT_CONFIG[event.sport];

  return (
    <div className="space-y-6">
      {/* Breadcrumb with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <span>{event.league}</span>
        </nav>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('text-white', sportConfig.color)}>
                {sportConfig.label}
              </Badge>
              <span className="text-muted-foreground">{event.league}</span>
            </div>
            <Badge
              className={cn('text-white w-fit', statusColors[event.status])}
              role={event.status === 'live' ? 'status' : undefined}
              aria-live={event.status === 'live' ? 'polite' : undefined}
            >
              {statusLabels[event.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Responsive score layout - vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col md:flex-row items-center justify-between py-8 gap-6">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              {event.homeTeam.logo && (
                <Image
                  src={event.homeTeam.logo}
                  alt={`${event.homeTeam.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                  unoptimized
                />
              )}
              <span className="font-semibold text-lg text-center">
                {event.homeTeam.name}
              </span>
            </div>

            {/* Score - responsive sizing */}
            <div className="flex items-center gap-2 md:gap-4 px-4 md:px-8">
              <span className="text-4xl md:text-5xl font-bold">
                {event.homeTeam.score ?? '-'}
              </span>
              <span className="text-xl md:text-2xl text-muted-foreground">:</span>
              <span className="text-4xl md:text-5xl font-bold">
                {event.awayTeam.score ?? '-'}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              {event.awayTeam.logo && (
                <Image
                  src={event.awayTeam.logo}
                  alt={`${event.awayTeam.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                  unoptimized
                />
              )}
              <span className="font-semibold text-lg text-center">
                {event.awayTeam.name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Date & Time</dt>
              <dd className="font-medium">
                {format(event.startTime, 'EEEE, MMMM d, yyyy')}
              </dd>
              <dd className="font-medium">{format(event.startTime, 'HH:mm')}</dd>
            </div>
            {event.venue && (
              <div>
                <dt className="text-sm text-muted-foreground">Venue</dt>
                <dd className="font-medium">{event.venue}</dd>
              </div>
            )}
            {event.round && (
              <div>
                <dt className="text-sm text-muted-foreground">Round</dt>
                <dd className="font-medium">{event.round}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">Competition</dt>
              <dd className="font-medium">{event.league}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
