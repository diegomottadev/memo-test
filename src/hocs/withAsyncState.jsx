import PropTypes from 'prop-types';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import getDisplayName from '../utils/getDisplayName';

const isEmptyByDefault = (data) =>
  data === null || data === undefined || (Array.isArray(data) && data.length === 0);

/**
 * Adds the loading, error and empty states of an async read to a component
 * that only shows data. The wrapped component only renders with valid data, received in
 * the `dataProp` prop. Designed for the result of `useAsync`:
 *
 * @example
 * const MemoTestListWithState = withAsyncState(MemoTestList, { dataProp: 'memoTests' });
 * <MemoTestListWithState loading={loading} error={error} data={data} onRetry={refetch} />
 *
 * @param {import('react').ComponentType<any>} WrappedComponent
 * @param {object} [options]
 * @param {string} [options.dataProp='data'] - Prop name used to pass the data down.
 * @param {import('react').ComponentType} [options.LoadingComponent] - Usually a skeleton shaped like the content.
 * @param {(data: any) => boolean} [options.isEmpty] - Defaults to null, undefined or an empty array.
 * @param {string} [options.emptyMessage]
 * @param {string} [options.errorMessage]
 * @returns {import('react').ComponentType<any>} Component that takes `loading`, `error`,
 *   `data` and `onRetry`, and forwards every other prop to `WrappedComponent`.
 */
export default function withAsyncState(
  WrappedComponent,
  {
    dataProp = 'data',
    LoadingComponent,
    isEmpty = isEmptyByDefault,
    emptyMessage = 'There is nothing to show.',
    errorMessage = 'Could not load the data.',
  } = {},
) {
  function WithAsyncState({ loading, error, data, onRetry, ...props }) {
    if (loading) return LoadingComponent ? <LoadingComponent /> : null;
    if (error) return <ErrorMessage message={errorMessage} onRetry={onRetry} />;
    if (isEmpty(data)) return <EmptyState message={emptyMessage} />;
    return <WrappedComponent {...props} {...{ [dataProp]: data }} />;
  }

  WithAsyncState.displayName = `withAsyncState(${getDisplayName(WrappedComponent)})`;
  WithAsyncState.propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error),
    data: PropTypes.any,
    onRetry: PropTypes.func,
  };

  return WithAsyncState;
}
