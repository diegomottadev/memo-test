import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

/** Shows the current URL, so tests can check where the app navigated. */
function LocationProbe() {
  const { pathname } = useLocation();
  return <p>Navigated to {pathname}</p>;
}

/**
 * Renders a component inside the providers the app needs (today only the
 * router), using an in-memory history.
 *
 * @param {import('react').ReactElement} ui
 * @param {object} [options]
 * @param {string} [options.route='/'] - Initial URL.
 * @param {string} [options.path] - Route pattern for `ui`. Needed when `ui` reads
 *   URL params (e.g. `ROUTES.GAME_SESSION`) or navigates: any other URL renders
 *   "Navigated to <path>".
 * @returns {import('@testing-library/react').RenderResult}
 */
export function renderWithProviders(ui, { route = '/', path } = {}) {
  const content = path ? (
    <Routes>
      <Route path={path} element={ui} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  ) : (
    ui
  );
  return render(<MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>);
}
