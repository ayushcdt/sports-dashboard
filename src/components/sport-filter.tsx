'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SPORT_CONFIG, ALL_SPORTS } from '@/lib/constants';
import { Sport } from '@/lib/api/types';

interface SportFilterProps {
  selected: Sport | 'all';
  onSelect: (sport: Sport | 'all') => void;
}

export function SportFilter({ selected, onSelect }: SportFilterProps) {
  return (
    <fieldset>
      <legend className="sr-only">Filter by sport</legend>
      <Tabs value={selected} onValueChange={(v) => onSelect(v as Sport | 'all')}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          {ALL_SPORTS.map((sport) => (
            <TabsTrigger
              key={sport}
              value={sport}
              className="text-xs sm:text-sm"
            >
              {SPORT_CONFIG[sport].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </fieldset>
  );
}
