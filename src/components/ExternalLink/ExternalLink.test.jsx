import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ExternalLink from './ExternalLink';

describe('ExternalLink', () => {
  it('opens in a new tab safely and says so to screen readers', () => {
    render(<ExternalLink href="https://example.com">Docs</ExternalLink>);

    const link = screen.getByRole('link', { name: 'Docs (opens in a new tab)' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
