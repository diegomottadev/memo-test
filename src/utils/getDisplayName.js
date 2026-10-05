/**
 * Name shown in React DevTools for components created by HOCs.
 *
 * @param {import('react').ComponentType} WrappedComponent
 * @returns {string}
 */
export default function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
