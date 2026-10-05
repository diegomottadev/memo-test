import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DataSourceNotice from './DataSourceNotice';

describe('DataSourceNotice', () => {
  it('shows nothing when the server is used', () => {
    render(<DataSourceNotice source="server" />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('explains the demo mode without a server', () => {
    render(<DataSourceNotice source="mock" />);
    expect(screen.getByRole('status')).toHaveTextContent('Demo mode: the game uses sample data');
  });

  it('explains that the server is not answering', () => {
    render(<DataSourceNotice source="fallback" />);
    expect(screen.getByRole('status')).toHaveTextContent('the server is not answering');
  });
});
