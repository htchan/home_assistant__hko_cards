global.document = {
  createElement: jest.fn(() => new HTMLElement()),
} as any;

// Mock setTimeout and clearTimeout
global.setTimeout = jest.fn((fn, delay) => {
  return setImmediate(fn);
}) as any;

global.clearTimeout = jest.fn();