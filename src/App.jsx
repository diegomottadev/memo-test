import { BrowserRouter } from 'react-router';
import AppRoutes from './AppRoutes';

// Vite's `base` ends with "/"; the router expects the base path without it.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

/**
 * Root component: the browser router around the app routes. `basename` lets
 * the app live in a subfolder, like https://<user>.github.io/<repo>/.
 */
export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}
