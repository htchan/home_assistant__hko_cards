// Mock lit and LitElement before importing
jest.mock('lit', () => ({
  html: jest.fn((strings, ...values) => strings.reduce((acc: string, str: string, i: number) => acc + str + (values[i] || ''), '')),
  css: jest.fn((strings, ...values) => ({ string: strings.join(''), values })),
  LitElement: class MockLitElement {
    static properties: any = {};
    requestUpdate = jest.fn();
    updateComplete = Promise.resolve();
    connectedCallback = jest.fn();
    disconnectedCallback = jest.fn();
    updated = jest.fn();
    firstUpdated = jest.fn();
  },
}));

import { HkoRadarCard } from "../src/cards/radar-card/card";
import { HkoRadarCardEditor } from "../src/cards/radar-card/editor";

// Mock customElements and window
global.customElements.define = jest.fn((name, element) => { return true })

const mockWindow = global.window as any;
mockWindow.customCards = [];

describe('Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow.customCards = [];
  });
  
  test('should register card and editor in customElements', () => {
    require('../src/index');
    
    expect(global.customElements.define).toHaveBeenCalledWith('hko-radar-card', HkoRadarCard);
    expect(global.customElements.define).toHaveBeenCalledWith('hko-radar-card-editor', HkoRadarCardEditor);

    expect(mockWindow.customCards).toHaveLength(1);
    expect(mockWindow.customCards[0]).toEqual({
      type: 'hko-radar-card',
      name: 'HKO Radar Card',
      description: 'Display HKO radar images with time slider and size options',
      preview: true,
    });
  });
});