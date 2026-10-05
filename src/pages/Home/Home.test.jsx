import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../api';
import { ROUTES } from '../../constants/routes';
import { renderWithProviders } from '../../testUtils/renderWithProviders';
import Home from './Home';

vi.mock('../../api', async () => (await import('../../testUtils/mockApi')).createApiMock());

const MEMO_TESTS = [
  { id: '1', name: 'Animals', maxScore: 80 },
  { id: '2', name: 'Food', maxScore: null },
];

const renderHome = () => renderWithProviders(<Home />, { path: ROUTES.HOME });

describe('Home', () => {
  beforeEach(() => {
    api.getMemoTests.mockResolvedValue(MEMO_TESTS);
  });

  it('shows a loading state while the memo tests load', () => {
    api.getMemoTests.mockReturnValue(new Promise(() => {}));
    renderHome();
    expect(screen.getByRole('status')).toHaveTextContent('Loading memo tests…');
  });

  it('lists the memo tests with their best score', async () => {
    renderHome();
    expect(await screen.findByRole('heading', { name: 'Animals' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Food' })).toBeInTheDocument();
    expect(screen.getByText('Best score: 80')).toBeInTheDocument();
    expect(screen.getAllByText(/Best score/)).toHaveLength(1);
  });

  it('shows the empty state when there are no memo tests', async () => {
    api.getMemoTests.mockResolvedValue([]);
    renderHome();
    expect(await screen.findByText('There are no memo tests to play yet.')).toBeInTheDocument();
  });

  it('shows an error and loads again with "Try again"', async () => {
    const user = userEvent.setup();
    api.getMemoTests.mockRejectedValueOnce(new Error('offline'));
    renderHome();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the memo tests.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Animals' })).toBeInTheDocument();
    expect(api.getMemoTests).toHaveBeenCalledTimes(2);
  });

  it('creates a session and opens a new game', async () => {
    const user = userEvent.setup();
    api.createGameSession.mockResolvedValue({ id: '7' });
    renderHome();

    await user.click(await screen.findByRole('button', { name: 'Start Animals' }));

    expect(await screen.findByText('Navigated to /game/1/session/7/new')).toBeInTheDocument();
    expect(api.createGameSession).toHaveBeenCalledWith({ memoTestId: '1' });
    expect(window.localStorage.getItem('memoTestSession_1')).toBe('"7"');
  });

  it('disables the list while the session is being created', async () => {
    const user = userEvent.setup();
    api.createGameSession.mockReturnValue(new Promise(() => {}));
    renderHome();

    await user.click(await screen.findByRole('button', { name: 'Start Animals' }));

    expect(screen.getByRole('button', { name: 'Creating game… Animals' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Start Food' })).toBeDisabled();
  });

  it('resumes an unfinished game without creating a session', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('memoTestSession_1', '"5"');
    renderHome();

    await user.click(await screen.findByRole('button', { name: 'Continue Animals' }));

    expect(await screen.findByText('Navigated to /game/1/session/5/continue')).toBeInTheDocument();
    expect(api.createGameSession).not.toHaveBeenCalled();
  });

  it('shows an error when the session cannot be created, and retries', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.createGameSession
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ id: '8' });
    renderHome();

    await user.click(await screen.findByRole('button', { name: 'Start Food' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not start "Food".');

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Navigated to /game/2/session/8/new')).toBeInTheDocument();
  });

  it('sets the page title and has one main heading', async () => {
    renderHome();
    await screen.findByRole('heading', { name: 'Animals' });
    expect(document.title).toBe('Memo Test');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
