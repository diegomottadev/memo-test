import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Card from './Card';

const baseCard = { id: '1-0', imageId: '1', imageUrl: 'dog.svg', imageLabel: 'Dog' };

const renderCard = (state, props = {}) => {
  const onFlip = vi.fn();
  render(<Card card={{ ...baseCard, ...state }} position={3} onFlip={onFlip} {...props} />);
  return onFlip;
};

describe('Card', () => {
  it('describes a face-down card and flips it on click', async () => {
    const user = userEvent.setup();
    const onFlip = renderCard({ isFlipped: false, isMatched: false });

    const button = screen.getByRole('button', { name: 'Card 3, face down' });
    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    await user.click(button);
    expect(onFlip).toHaveBeenCalledWith('1-0');
  });

  it('can be flipped with the keyboard', async () => {
    const user = userEvent.setup();
    const onFlip = renderCard({ isFlipped: false, isMatched: false });

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('describes a face-up card and ignores clicks on it', async () => {
    const user = userEvent.setup();
    const onFlip = renderCard({ isFlipped: true, isMatched: false });

    const button = screen.getByRole('button', { name: 'Card 3: Dog' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await user.click(button);
    expect(onFlip).not.toHaveBeenCalled();
  });

  it('describes a matched card', () => {
    renderCard({ isFlipped: true, isMatched: true });
    expect(screen.getByRole('button', { name: 'Card 3: Dog, pair found' })).toBeInTheDocument();
  });

  it('ignores clicks while the board is locked', async () => {
    const user = userEvent.setup();
    const onFlip = renderCard({ isFlipped: false, isMatched: false }, { disabled: true });

    await user.click(screen.getByRole('button'));
    expect(onFlip).not.toHaveBeenCalled();
  });
});
