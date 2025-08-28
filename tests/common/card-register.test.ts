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

import { HkoRadarCard } from "../../src/cards/radar-card/card";
import { HkoRadarCardEditor } from "../../src/cards/radar-card/editor";
import { HomeAssistantCard } from "../../src/cards/types";
import { registerCard } from "../../src/common/card-register";

// Mock customElements and window
const mockDefine = jest.fn((name, element) => { return true });
global.customElements.define = mockDefine

const mockWindow = global.window as any;
mockWindow.customCards = [];


describe('registerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow.customCards = [];
  });

  describe('card with editor', () => {
    const mockCardEditor = {
      editorType: 'hko-radar-card-editor',
    }

    const mockCard = {
      cardType: 'hko-radar-card',
      cardName: 'HKO Radar Card',
      cardDescription: 'Display HKO radar images with time slider and size options',
      cardPreview: true,
      cardEditor: mockCardEditor,
    };

    test('should register card and editor in customElements', () => {
      registerCard((mockCard as typeof HomeAssistantCard));
      
      expect(global.customElements.define).toHaveBeenCalledTimes(2)
      expect(global.customElements.define).toHaveBeenCalledWith('hko-radar-card', mockCard);
      expect(global.customElements.define).toHaveBeenCalledWith('hko-radar-card-editor', mockCardEditor);
      
      expect(mockWindow.customCards).toHaveLength(1);
      expect(mockWindow.customCards[0]).toEqual({
        type: 'hko-radar-card',
        name: 'HKO Radar Card',
        description: 'Display HKO radar images with time slider and size options',
        preview: true,
      });
    });
  });

  describe('card with editor', () => {
    const mockCard = {
      cardType: 'hko-radar-card',
      cardName: 'HKO Radar Card',
      cardDescription: 'Display HKO radar images with time slider and size options',
      cardPreview: true,
      cardEditor: null,
    };

    test('should register card and editor in customElements', () => {
      registerCard((mockCard as typeof HomeAssistantCard));
      
      expect(global.customElements.define).toHaveBeenCalledTimes(1)
      expect(global.customElements.define).toHaveBeenCalledWith('hko-radar-card', mockCard);
      
      expect(mockWindow.customCards).toHaveLength(1);
      expect(mockWindow.customCards[0]).toEqual({
        type: 'hko-radar-card',
        name: 'HKO Radar Card',
        description: 'Display HKO radar images with time slider and size options',
        preview: true,
      });
    });
  });
});