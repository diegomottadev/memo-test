import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HOW_TO_PLAY_STEPS } from '../../constants/howToPlay';
import HowToPlay from './HowToPlay';

describe('HowToPlay', () => {
  it('shows every step when it is open', () => {
    render(<HowToPlay defaultOpen />);
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(HOW_TO_PLAY_STEPS.length);
    expect(steps[0]).toBeVisible();
  });

  it('is closed by default and opens when the title is clicked', async () => {
    const user = userEvent.setup();
    render(<HowToPlay />);
    const firstStep = screen.getByText(HOW_TO_PLAY_STEPS[0]);
    expect(firstStep).not.toBeVisible();

    await user.click(screen.getByText('How to play'));
    expect(firstStep).toBeVisible();
  });
});
