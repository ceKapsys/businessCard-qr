import "@testing-library/jest-dom/vitest";

// jsdom lacks ResizeObserver, which Radix primitives use for sizing.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
