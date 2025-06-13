/**
 * Test setup file for Jest
 * Sets up global mocks and test utilities
 */

// Mock Figma API
const mockFigma = {
  getStyleByIdAsync: jest.fn(),
  currentPage: {
    selection: [] as any[]
  },
  notify: jest.fn(),
  closePlugin: jest.fn(),
  clientStorage: {
    getAsync: jest.fn(),
    setAsync: jest.fn()
  },
  showUI: jest.fn(),
  ui: {
    postMessage: jest.fn(),
    onmessage: null as any
  },
  on: jest.fn()
};

// Set global figma mock
(global as any).figma = mockFigma;
(global as any).__html__ = '<div>Mock UI</div>';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockFigma.currentPage.selection = [];
  mockFigma.getStyleByIdAsync.mockResolvedValue(null);
  mockFigma.clientStorage.getAsync.mockResolvedValue({});
  mockFigma.clientStorage.setAsync.mockResolvedValue(undefined);
});

export {}; 