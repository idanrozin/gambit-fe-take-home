import '@testing-library/jest-dom/vitest';

// Radix popovers size themselves with ResizeObserver, which jsdom lacks. An inert stub is
// enough: there is no layout to observe.
window.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom has no matchMedia. Default to "light"; tests that need a dark OS replace it.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList;
