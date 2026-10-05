import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../api';
import { ROUTES } from '../../constants/routes';
import { MEMO_TEST } from '../../testUtils/mockApi';
import { renderWithProviders } from '../../testUtils/renderWithProviders';
import GameSession from './GameSession';

vi.mock('../../api', async () => (await import('../../testUtils/mockApi')).createApiMock());

const renderGame = (action = 'new') =>
  renderWithProviders(<GameSession />, {
    route: `/game/1/session/9/${action}`,
    path: ROUTES.GAME_SESSION,
  });

const card = (name) => screen.getByRole('button', { name });
const findBoard = () => screen.findByRole('list', { name: 'Board' });
// Value next to a stat label in the <dl> of GameStats.
const stat = (label) => screen.getByText(label).nextElementSibling;

describe('GameSession', () => {
  beforeEach(() => {
    // With this value the shuffle keeps the deck order: Dog, Dog, Cat, Cat.
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    api.getMemoTest.mockResolvedValue(MEMO_TEST);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a loading state while the memo test loads', () => {
    api.getMemoTest.mockReturnValue(new Promise(() => {}));
    renderGame();
    expect(screen.getByRole('status')).toHaveTextContent('Loading board…');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Loading game…');
  });

  it('shows an error and loads again with "Try again"', async () => {
    const user = userEvent.setup();
    api.getMemoTest.mockRejectedValueOnce(new Error('offline'));
    renderGame();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the memo test.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await findBoard()).toBeInTheDocument();
  });

  it('shows the empty state when the memo test does not exist', async () => {
    api.getMemoTest.mockResolvedValue(null);
    renderGame();
    expect(
      await screen.findByText('This memo test does not exist or has no pictures.'),
    ).toBeInTheDocument();
  });

  it('renders the board with the title, stats and face-down cards', async () => {
    renderGame();
    const board = await findBoard();

    expect(within(board).getAllByRole('button')).toHaveLength(4);
    expect(card('Card 1, face down')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Animals' })).toBeInTheDocument();
    expect(document.title).toBe('Animals · Memo Test');
    expect(screen.getByText('0 of 2')).toBeInTheDocument();
  });

  it('keeps a found pair face up, announces it and saves the progress', async () => {
    const user = userEvent.setup();
    renderGame();
    await findBoard();

    await user.click(card('Card 1, face down'));
    expect(screen.getByText('Card 1: Dog.')).toBeInTheDocument();
    await user.click(card('Card 2, face down'));

    expect(card('Card 1: Dog, pair found')).toHaveAttribute('aria-disabled', 'true');
    expect(card('Card 2: Dog, pair found')).toBeInTheDocument();
    expect(screen.getByText('Pair found! Dog.')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(api.updateGameSessionProgress).toHaveBeenCalledWith({
      id: '9',
      memoTestId: '1',
      retries: 2,
      matchedPairs: 1,
    });
  });

  it('turns two different cards back after one second and ignores clicks meanwhile', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderGame();
    await findBoard();

    await user.click(card('Card 2, face down'));
    await user.click(card('Card 3, face down'));
    expect(screen.getByText('No match: Dog and Cat.')).toBeInTheDocument();

    await user.click(card('Card 1, face down'));
    expect(card('Card 1, face down')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));

    expect(card('Card 2, face down')).toBeInTheDocument();
    expect(card('Card 3, face down')).toBeInTheDocument();
    expect(stat('Tries')).toHaveTextContent('2');
  });

  it('shows the score, saves it and moves focus when the game ends', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('memoTestSession_1', '"9"');
    renderGame();
    await findBoard();

    for (const position of [1, 2, 3, 4]) {
      await user.click(card(`Card ${position}, face down`));
    }

    const heading = await screen.findByRole('heading', { level: 1, name: 'Well done!' });
    expect(heading).toHaveFocus();
    expect(screen.getByText('Score: 100')).toBeInTheDocument();
    expect(await screen.findByText('Score saved.')).toBeInTheDocument();
    expect(api.finishGameSession).toHaveBeenCalledWith({ id: '9', memoTestId: '1', score: 100 });
    expect(window.localStorage.getItem('memoTestSession_1')).toBeNull();
    expect(window.localStorage.getItem('memoGameState_1')).toBeNull();
  });

  it('shows an error when the score cannot be saved, and retries', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.finishGameSession.mockRejectedValueOnce(new Error('offline'));
    renderGame();
    await findBoard();

    for (const position of [1, 2, 3, 4]) {
      await user.click(card(`Card ${position}, face down`));
    }

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save the score.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Score saved.')).toBeInTheDocument();
    expect(api.finishGameSession).toHaveBeenCalledTimes(2);
  });

  it('resumes the saved game with "continue"', async () => {
    const cards = [
      { id: '10-0', imageId: '10', isFlipped: true, isMatched: true },
      { id: '10-1', imageId: '10', isFlipped: true, isMatched: true },
      { id: '20-0', imageId: '20', isFlipped: true, isMatched: false },
      { id: '20-1', imageId: '20', isFlipped: false, isMatched: false },
    ];
    window.localStorage.setItem('memoGameState_1', JSON.stringify({ cards, retries: 5 }));
    renderGame('continue');
    await findBoard();

    expect(card('Card 1: Dog, pair found')).toBeInTheDocument();
    // A card that was face up without its pair is turned back.
    expect(card('Card 3, face down')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(stat('Tries')).toHaveTextContent('5');
  });

  it('starts a new game with "new" even if there is a saved game', async () => {
    window.localStorage.setItem(
      'memoGameState_1',
      JSON.stringify({ cards: [{ id: '10-0', imageId: '10', isMatched: true }], retries: 5 }),
    );
    renderGame('new');
    await findBoard();
    expect(screen.getByText('0 of 2')).toBeInTheDocument();
  });

  it('goes back home with the "Back to home" link', async () => {
    const user = userEvent.setup();
    renderGame();
    await findBoard();

    await user.click(screen.getByRole('link', { name: 'Back to home' }));
    expect(screen.getByText('Navigated to /')).toBeInTheDocument();
  });
});
