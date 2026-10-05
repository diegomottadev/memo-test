import { Route, Routes } from 'react-router';
import AppLayout from './components/AppLayout';
import { ROUTES } from './constants/routes';
import withErrorBoundary from './hocs/withErrorBoundary';
import GameSession from './pages/GameSession';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Each page gets its own boundary, so a crash never blanks the whole app.
const HomePage = withErrorBoundary(Home);
const GameSessionPage = withErrorBoundary(GameSession);

/**
 * Shared layout and every route of the app. It does not include a router, so
 * tests can render it inside a `MemoryRouter`.
 */
export default function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.GAME_SESSION} element={<GameSessionPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
