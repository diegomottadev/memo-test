import PropTypes from 'prop-types';
import { DATA_SOURCES } from '../../constants/config';
import styles from './DataSourceNotice.module.css';

const MESSAGES = {
  [DATA_SOURCES.MOCK]: 'Demo mode: the game uses sample data and scores stay in this browser.',
  [DATA_SOURCES.FALLBACK]:
    'Demo mode: the server is not answering, so the game uses sample data. Scores stay in this browser.',
};

/**
 * Tells the user that the app is not using the real server. It renders
 * nothing when the source is the server. The status role makes screen readers
 * announce it when the app switches to the mocks during a visit.
 *
 * @param {object} props
 * @param {'server'|'mock'|'fallback'} props.source - Current data source.
 */
export default function DataSourceNotice({ source }) {
  const message = MESSAGES[source];
  return (
    <div role="status" className={message ? styles.notice : undefined}>
      {message}
    </div>
  );
}

DataSourceNotice.propTypes = {
  source: PropTypes.oneOf(Object.values(DATA_SOURCES)).isRequired,
};
