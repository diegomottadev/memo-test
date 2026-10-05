import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import AppRoutes from './AppRoutes';
import { renderWithProviders } from './testUtils/renderWithProviders';

vi.mock('./api', async () => (await import('./testUtils/mockApi')).createApiMock());

describe('AppRoutes', () => {
  beforeEach(() => {
    api.getMemoTests.mockResolvedValue([{ id: '1', name: 'Animals', maxScore: null }]);
  });

  it('shows the not found page for unknown URLs', () => {
    renderWithProviders(<AppRoutes />, { route: '/no/such/page' });
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(document.title).toBe('Page not found · Memo Test');
  });

  it('goes home from the not found page and moves focus to the main content', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { route: '/no/such/page' });

    await user.click(screen.getByRole('link', { name: 'Back to home' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Choose a memo test' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('has a header link to home and footer links to the repositories', () => {
    renderWithProviders(<AppRoutes />, { route: '/no/such/page' });
    expect(screen.getByRole('link', { name: 'Memo Test' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Source code/ })).toHaveAttribute('target', '_blank');
  });

  it('does not move focus on the first page load', () => {
    renderWithProviders(<AppRoutes />, { route: '/' });
    expect(screen.getByRole('main')).not.toHaveFocus();
  });
});
