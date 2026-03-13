import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import { SportFilter } from './sport-filter';

describe('SportFilter', () => {
  it('renders all sport tabs', () => {
    const onSelect = vi.fn();

    render(<SportFilter selected="all" onSelect={onSelect} />);

    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Soccer' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Basketball' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Motorsport' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tennis' })).toBeInTheDocument();
  });

  it('shows selected tab as active', () => {
    const onSelect = vi.fn();

    render(<SportFilter selected="soccer" onSelect={onSelect} />);

    const soccerTab = screen.getByRole('tab', { name: 'Soccer' });
    // shadcn tabs use aria-selected for accessibility
    expect(soccerTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect when tab is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<SportFilter selected="all" onSelect={onSelect} />);

    await user.click(screen.getByRole('tab', { name: 'Basketball' }));

    expect(onSelect).toHaveBeenCalledWith('basketball');
  });

  it('calls onSelect with "all" when All tab is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<SportFilter selected="soccer" onSelect={onSelect} />);

    await user.click(screen.getByRole('tab', { name: 'All' }));

    expect(onSelect).toHaveBeenCalledWith('all');
  });

  it('has correct number of tabs', () => {
    const onSelect = vi.fn();

    render(<SportFilter selected="all" onSelect={onSelect} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5); // All + 4 sports
  });
});
