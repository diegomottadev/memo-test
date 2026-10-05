import { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorMessage from '../components/ErrorMessage';
import getDisplayName from '../utils/getDisplayName';

/**
 * Error boundaries can only be class components; `withErrorBoundary` exposes
 * this one as a HOC. "Try again" clears the error and renders the children again.
 */
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return <ErrorMessage message={this.props.message} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  message: PropTypes.string.isRequired,
  children: PropTypes.node,
};

/**
 * Renders a recoverable error message instead of a blank screen when
 * `WrappedComponent` throws while rendering. Applied to every page in `App.jsx`.
 *
 * @param {import('react').ComponentType<any>} WrappedComponent
 * @param {object} [options]
 * @param {string} [options.message] - Message shown to the user.
 * @returns {import('react').ComponentType<any>}
 */
export default function withErrorBoundary(
  WrappedComponent,
  { message = 'Something went wrong on this screen.' } = {},
) {
  function WithErrorBoundary(props) {
    return (
      <ErrorBoundary message={message}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${getDisplayName(WrappedComponent)})`;
  return WithErrorBoundary;
}
