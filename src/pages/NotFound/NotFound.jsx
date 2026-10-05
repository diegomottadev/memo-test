import { Link } from 'react-router';
import Button from '../../components/Button';
import Text from '../../components/Text';
import { ROUTES } from '../../constants/routes';
import pageTitle from '../../utils/pageTitle';
import styles from './NotFound.module.css';

/**
 * Fallback for any URL that does not match a route.
 */
export default function NotFound() {
  return (
    <section className={styles.notFound} aria-labelledby="not-found-title">
      <title>{pageTitle('Page not found')}</title>
      <Text as="h1" variant="title" id="not-found-title">
        Page not found
      </Text>
      <Text variant="muted">This address does not match any screen of the game.</Text>
      <Button as={Link} to={ROUTES.HOME}>
        Back to home
      </Button>
    </section>
  );
}
