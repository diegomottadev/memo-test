import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router';
import { APP_NAME } from '../../constants/config';
import { FOOTER_LINKS } from '../../constants/links';
import { ROUTES } from '../../constants/routes';
import useDataSource from '../../hooks/useDataSource';
import DataSourceNotice from '../DataSourceNotice';
import ExternalLink from '../ExternalLink';
import styles from './AppLayout.module.css';

/**
 * Page shell shared by every route: header, data source notice, main content
 * and footer.
 *
 * Client-side navigation does not move focus like a full page load does, so
 * `<main>` is focused after each route change; screen readers then start
 * reading the new page instead of staying on the link that was activated.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - The current page.
 */
export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const dataSource = useDataSource();
  const mainRef = useRef(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Comparing paths (instead of skipping the first run) keeps StrictMode's
    // double effect from stealing focus on the initial load.
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.brand}>
          {APP_NAME}
        </Link>
      </header>
      {/* Always mounted, so the switch to the mocks is announced by screen readers. */}
      <DataSourceNotice source={dataSource} />
      <main ref={mainRef} tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <ul className={styles.links}>
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <ExternalLink href={link.href}>{link.label}</ExternalLink>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
