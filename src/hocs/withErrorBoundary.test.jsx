import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import withErrorBoundary from './withErrorBoundary';

let shouldThrow = true;
function Fragile() {
  if (shouldThrow) throw new Error('render failed');
  return <p>Working page</p>;
}
const SafePage = withErrorBoundary(Fragile, { message: 'Page failed' });

describe('withErrorBoundary', () => {
  it('shows the message instead of crashing, and renders again with "Try again"', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    shouldThrow = true;
    render(<SafePage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Page failed');

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Working page')).toBeInTheDocument();
  });

  it('has a readable display name', () => {
    expect(SafePage.displayName).toBe('withErrorBoundary(Fragile)');
  });
});
