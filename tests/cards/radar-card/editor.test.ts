// Mock lit and LitElement before importing
jest.mock('lit', () => ({
  html: jest.fn((strings, ...values) => ({ strings: strings, values })),
  css: jest.fn((strings, ...values) => ({ string: strings.join(''), values })),
  LitElement: class MockLitElement {
    static properties: any = {};
    requestUpdate = jest.fn();
    updateComplete = Promise.resolve();
    connectedCallback = jest.fn();
    disconnectedCallback = jest.fn();
    updated = jest.fn();
    firstUpdated = jest.fn();
    private _listeners: Map<string, Function[]> = new Map();
    addEventListener = jest.fn((type: string, listener: Function) => {
      if (!this._listeners.has(type)) {
        this._listeners.set(type, []);
      }
      this._listeners.get(type)!.push(listener);
    });
    dispatchEvent = jest.fn((event: Event) => {
      const listeners = this._listeners.get(event.type) || [];
      listeners.forEach(listener => listener(event));
      return true;
    });
  },
}));

import { HkoRadarCardEditor } from "../../../src/cards/radar-card/editor";
import { HkoRadarCardConfig, IMG_SIZE_LARGE, IMG_SIZE_MEDIUM, IMG_SIZE_SMALL, MAX_TIME_SLOTS } from "../../../src/cards/radar-card/const";

describe('Radar Card Editor', () => {
  let editor: HkoRadarCardEditor;
  let mockConfig: HkoRadarCardConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = {
      defaultSize: IMG_SIZE_MEDIUM,
      timeSlotCount: MAX_TIME_SLOTS,
      autoRefresh: false,
    };

    editor = new HkoRadarCardEditor();
  });

  describe('static properties', () => {
    test('editorType', () => {
      expect(HkoRadarCardEditor.editorType).toEqual('hko-radar-card-editor');
    });
  });

  describe('variables', () => {
    test('config', () => {
      expect((editor as any).config).toEqual({
        defaultSize: IMG_SIZE_MEDIUM,
        timeSlotCount: MAX_TIME_SLOTS,
        autoRefresh: false,
      });
    });
  });

  describe('public functions', () => {
    describe('setConfig', () => {
      beforeEach(() => {
        mockConfig = {
          defaultSize: IMG_SIZE_LARGE,
          timeSlotCount: 20,
          autoRefresh: true,
        };
      });

      test('should set config', () => {
        editor.setConfig(mockConfig);
        expect((editor as any).config).toEqual({
          defaultSize: IMG_SIZE_LARGE,
          timeSlotCount: 20,
          autoRefresh: true,
        });
      });
    });

    describe('configChanged', () => {
      beforeEach(() => {
        mockConfig = {
          defaultSize: IMG_SIZE_SMALL,
          timeSlotCount: 15,
          autoRefresh: true,
        };
      });

      test('should emit config-changed event with updated config', () => {
        const mockEventListener = jest.fn();
        editor.addEventListener('config-changed', mockEventListener);

        editor.configChanged(mockConfig);
        expect(mockEventListener).toHaveBeenCalledTimes(1);
        expect(mockEventListener.mock.calls[0][0].detail).toEqual({ config: mockConfig });
      });
    });

    describe('render', () => {
      beforeEach(() => {
        mockConfig = {
          defaultSize: IMG_SIZE_SMALL,
          timeSlotCount: 15,
          autoRefresh: true,
        };
        editor.setConfig(mockConfig);
      });

      test('should render ha-form with correct schema and data', () => {
        const result = editor.render();
        expect(result.strings).toEqual([
          `
            <ha-form
                .data=`,
              `
                .schema=`,
              `
                @value-changed=`,
              `
            >
            </ha-form>
        `
        ]);
        expect(result.values[0]).toEqual({
          defaultSize: IMG_SIZE_SMALL,
          timeSlotCount: 15,
          autoRefresh: true,
        });
        expect(result.values[1]).toEqual([
          { 
            name: "defaultSize",
            required: true,
            selector: { 
              select: {
                mode: "dropdown",
                options: [
                  { value: IMG_SIZE_SMALL, label: "Small" },
                  { value: IMG_SIZE_MEDIUM, label: "Medium" },
                  { value: IMG_SIZE_LARGE, label: "Large" }
                ]
              }
            }
          },
          { 
            name: "timeSlotCount",
            required: true,
            selector: { 
              number: {
                min: 10,
                max: 30,
                step: 5
              }
            }
          },
          {
            name: "autoRefresh",
            label: "Auto Update",
            required: true,
            selector: { 
              boolean: {}
            }
          }
        ]);
        expect(typeof result.values[2]).toBe('function');
      });
    });
  });
});