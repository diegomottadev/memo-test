import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import { describe, expect, it, vi } from 'vitest';
import withAsyncState from './withAsyncState';

function Names({ names, title }) {
  return <p>{`${title}: ${names.join(', ')}`}</p>;
}
Names.propTypes = {
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
};

const Loading = () => <p>Loading names</p>;
const NamesWithState = withAsyncState(Names, {
  dataProp: 'names',
  LoadingComponent: Loading,
  emptyMessage: 'No names',
  errorMessage: 'Names failed',
});

describe('withAsyncState', () => {
  it('renders the loading component while loading', () => {
    render(<NamesWithState loading error={null} data={undefined} />);
    expect(screen.getByText('Loading names')).toBeInTheDocument();
  });

  it('renders an alert with a retry button on error', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<NamesWithState loading={false} error={new Error('x')} onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Names failed');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the empty message for an empty list', () => {
    render(<NamesWithState loading={false} error={null} data={[]} />);
    expect(screen.getByText('No names')).toBeInTheDocument();
  });

  it('passes the data in dataProp and forwards the other props', () => {
    render(<NamesWithState loading={false} error={null} data={['Ana', 'Leo']} title="Team" />);
    expect(screen.getByText('Team: Ana, Leo')).toBeInTheDocument();
  });

  it('has a readable display name', () => {
    expect(NamesWithState.displayName).toBe('withAsyncState(Names)');
  });
});
