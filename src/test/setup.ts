import '@testing-library/jest-dom/vitest';

// Radix popovers size themselves with ResizeObserver, which jsdom lacks. An inert stub is
// enough: there is no layout to observe.
window.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
