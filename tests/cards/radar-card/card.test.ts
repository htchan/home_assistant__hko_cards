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

import { HkoRadarCard } from '../../../src/cards/radar-card/card';
import { HkoRadarCardConfig, IMG_SIZE_LARGE, IMG_SIZE_MEDIUM, MAX_TIME_SLOTS } from '../../../src/cards/radar-card/const';

describe('HkoRadarCard', () => {
  let card: HkoRadarCard;
  let mockConfig: HkoRadarCardConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T01:00:00Z'));
    
    mockConfig = {
      defaultSize: IMG_SIZE_MEDIUM,
      timeSlotCount: MAX_TIME_SLOTS,
      autoRefresh: false,
    };
    
    card = new HkoRadarCard();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('static properties', () => {
    test('card type', () => {
      expect(HkoRadarCard.cardType).toBe('hko-radar-card');
    });

    test('card name', () => {
      expect(HkoRadarCard.cardName).toBe('HKO Radar Card');
    });

    test('description', () => {
      expect(HkoRadarCard.cardDescription).toBe('Display HKO radar images with time slider and size options');
    });

    test('card preview', () => {
      expect(HkoRadarCard.cardPreview).toBe(true);
    });

    test('get stub config', () => {
      const stubConfig = HkoRadarCard.getStubConfig();
      expect(stubConfig).toEqual({
        defaultSize: IMG_SIZE_MEDIUM,
        timeSlotCount: MAX_TIME_SLOTS,
        autoRefresh: false,
      });
    });

    test('get config element', () => {
      const element = HkoRadarCard.getConfigElement();
      expect(element).toBeInstanceOf(HTMLElement);
    });
  });

  describe('variable', () => {
    test('config', () => {
      expect((card as any).config).toEqual({
        defaultSize: IMG_SIZE_MEDIUM,
        timeSlotCount: MAX_TIME_SLOTS,
        autoRefresh: false,
      });
    });

    test('img size', () => {
      expect((card as any).imgSize).toBe(IMG_SIZE_MEDIUM);
    });

    test('current datetime', () => {
      expect((card as any).currentDatetime).toBeInstanceOf(Date);
      expect((card as any).currentDatetime.toISOString()).toBe('2024-01-01T00:54:00.000Z');
    });

    test('preloaded images', () => {
      expect((card as any).preloadedImages).toBeInstanceOf(Map);
      expect((card as any).preloadedImages.size).toBe(0);
    });

    test('latest time', () => {
      expect((card as any).latestTime).toBeInstanceOf(Date);
      expect((card as any).latestTime.toISOString()).toBe('2024-01-01T00:54:00.000Z');
    });

    test('update timer', () => {
      expect((card as any).updateTimer).toBeNull();
    });
  });

  describe('public function', () => {
    describe('setConfig', () => {
      test('should set config correctly', () => {
        jest.setSystemTime(new Date('2024-01-01T01:30:00Z'));
        mockConfig = {
          defaultSize: IMG_SIZE_LARGE,
          timeSlotCount: 5,
          autoRefresh: true,
        };
        
        card.setConfig(mockConfig);
        expect((card as any).config).toEqual(mockConfig);
        expect((card as any).imgSize).toBe(IMG_SIZE_LARGE);
        expect((card as any).currentDatetime).toBeInstanceOf(Date);
        expect((card as any).currentDatetime.toISOString()).toBe('2024-01-01T01:24:00.000Z');
        expect((card as any).preloadedImages).toBeInstanceOf(Map);
        expect((card as any).preloadedImages.size).toBe(5);
        expect(Array.from((card as any).preloadedImages.keys())).toEqual([
          "https://www.hko.gov.hk/wxinfo/radars/rad_256_png/2d256nradar_202401010900.jpg", 
          "https://www.hko.gov.hk/wxinfo/radars/rad_256_png/2d256nradar_202401010906.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_256_png/2d256nradar_202401010912.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_256_png/2d256nradar_202401010918.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_256_png/2d256nradar_202401010924.jpg"
        ]);
        expect((card as any).latestTime).toBeInstanceOf(Date);
        expect((card as any).latestTime.toISOString()).toBe('2024-01-01T01:24:00.000Z');
        expect((card as any).updateTimer).not.toBeNull();
      });

      test('should throw error for invalid config', () => {
        expect(() => card.setConfig(null as any)).toThrow('Invalid configuration');
      });
    });

    describe('render', () => {
      beforeEach(() => {
        card.setConfig(mockConfig);
      });

      test('should render card with all elements', () => {
        expect(card.render()).toEqual(`
            <ha-card>
                <div class=\"card-content\">
                    <img id=\"radar-image\" src=\"https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010854.jpg\" alt=\"HKO Radar\" />
                </div>
                <div class=\"card-content center\">
                    <input
                        type=\"range\"
                        style=\"width: 100%;\"
                        min=\"0\" max=\"14\"
                        value=\"14\"
                        @input=\"_onSliderInput(event) {
        const value = parseInt(event.target.value);
        this.currentDatetime = timeWithOffset(value - this.config.timeSlotCount + 1);
    }\"
                    />
                    <div id=\"time-display\">1/1/2024, 8:54:00 AM</div>
                </div>
                <div class=\"card-content center\">
                    <button class=\"ha-card-button \" data-size=\"064\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Small</button>
                    <button class=\"ha-card-button active\" data-size=\"128\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Medium</button>
                    <button class=\"ha-card-button \" data-size=\"256\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Large</button>
                </div>
            </ha-card>
        `);
      });

      test('render result depends on current datetime', () => {
        (card as any).currentDatetime = new Date('2024-01-01T00:00:00Z');
        expect(card.render()).toEqual(`
            <ha-card>
                <div class=\"card-content\">
                    <img id=\"radar-image\" src=\"https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010800.jpg\" alt=\"HKO Radar\" />
                </div>
                <div class=\"card-content center\">
                    <input
                        type=\"range\"
                        style=\"width: 100%;\"
                        min=\"0\" max=\"14\"
                        value=\"5\"
                        @input=\"_onSliderInput(event) {
        const value = parseInt(event.target.value);
        this.currentDatetime = timeWithOffset(value - this.config.timeSlotCount + 1);
    }\"
                    />
                    <div id=\"time-display\">1/1/2024, 8:00:00 AM</div>
                </div>
                <div class=\"card-content center\">
                    <button class=\"ha-card-button \" data-size=\"064\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Small</button>
                    <button class=\"ha-card-button active\" data-size=\"128\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Medium</button>
                    <button class=\"ha-card-button \" data-size=\"256\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Large</button>
                </div>
            </ha-card>
        `);
      });


      test('render result depends on image size', () => {
        (card as any).imgSize = IMG_SIZE_LARGE;
        expect(card.render()).toEqual(`
            <ha-card>
                <div class=\"card-content\">
                    <img id=\"radar-image\" src=\"https://www.hko.gov.hk/wxinfo/radars/rad_256_png/2d256nradar_202401010854.jpg\" alt=\"HKO Radar\" />
                </div>
                <div class=\"card-content center\">
                    <input
                        type=\"range\"
                        style=\"width: 100%;\"
                        min=\"0\" max=\"14\"
                        value=\"14\"
                        @input=\"_onSliderInput(event) {
        const value = parseInt(event.target.value);
        this.currentDatetime = timeWithOffset(value - this.config.timeSlotCount + 1);
    }\"
                    />
                    <div id=\"time-display\">1/1/2024, 8:54:00 AM</div>
                </div>
                <div class=\"card-content center\">
                    <button class=\"ha-card-button \" data-size=\"064\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Small</button>
                    <button class=\"ha-card-button \" data-size=\"128\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Medium</button>
                    <button class=\"ha-card-button active\" data-size=\"256\" @click=\"_onButtonClick(event) {
        const size = event.target.dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }\">Large</button>
                </div>
            </ha-card>
        `);
      });
    });
  });

  describe('private function', () => {
    beforeEach(() => {
      card.setConfig(mockConfig);
    });

    describe('_onSliderInput', () => {
      test('should handle slider input', () => {
        const mockEvent = { target: { value: '5' } } as any;
        (card as any)._onSliderInput(mockEvent);
        expect((card as any).currentDatetime).toBeInstanceOf(Date);
        expect((card as any).currentDatetime.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      });
    });
    
    describe('_onButtonClick', () => {
      test('should handle button click', () => {
        const mockEvent = { target: { dataset: { size: '256' } } } as any;
        (card as any)._onButtonClick(mockEvent);
        expect((card as any).imgSize).toBe('256');
      });
    });

    describe('preloadImages', () => {
      test('should preload images', () => {
        (card as any).preloadImages();
        expect((card as any).preloadedImages.size).toBe(15);
        expect(Array.from((card as any).preloadedImages.keys())).toEqual([
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010730.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010736.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010742.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010748.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010754.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010800.jpg", 
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010806.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010812.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010818.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010824.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010830.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010836.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010842.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010848.jpg",
          "https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010854.jpg"
        ]);
      });
    });

    describe('getPreloadedImageUrl', () => {
      test('should return preloaded image URL if available', () => {
        (card as any).preloadImages();
        const date = new Date('2024-01-01T00:54:00Z');
        const url = (card as any).getPreloadedImageUrl(date);
        expect(url).toBe('https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401010854.jpg');
      });

      test('should return constructed URL if not preloaded', () => {
        const date = new Date('2024-01-01T02:00:00Z');
        const url = (card as any).getPreloadedImageUrl(date);
        expect(url).toBe('https://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_202401011000.jpg');
      });
    });

    describe('scheduleLatestDatetimeRefresh', () => {
      describe('when updateTimer is null and autoRefresh is true', () => {
        beforeEach(() => {
          (card as any).updateTimer = null;
          (card as any).config.autoRefresh = true;
        });

        test('set the timeout', () => {
          (card as any).scheduleLatestDatetimeRefresh();
          expect((card as any).updateTimer).not.toBeNull();
          expect((card as any).latestTime.toISOString()).toEqual('2024-01-01T00:54:00.000Z');
          jest.advanceTimersByTime(245000);
          expect((card as any).latestTime.toISOString()).toBe('2024-01-01T01:00:00.000Z');
        });
      });

      describe('when updateTimer is not null and autoRefresh is false', () => {
        beforeEach(() => {
          (card as any).updateTimer = setTimeout(() => {}, 1000);
          (card as any).config.autoRefresh = false;
        });

        test('set the timeout', () => {
          (card as any).scheduleLatestDatetimeRefresh();
          expect((card as any).updateTimer).toBeNull();
          expect((card as any).latestTime.toISOString()).toEqual('2024-01-01T00:54:00.000Z');
          jest.advanceTimersByTime(245000);
          expect((card as any).latestTime.toISOString()).toBe('2024-01-01T00:54:00.000Z');
        });
      });
    });

    describe('updateLatestDatetime', () => {
      beforeEach(() => {
        jest.setSystemTime(new Date('2024-01-01T01:05:00Z'));
      });

      describe('when currentDateTime is latestTime', () => {
        beforeEach(() => {
          (card as any).currentDatetime = (card as any).latestTime;
        });

        test('should update private variable', () => {
          (card as any).updateLatestDatetime();
          expect((card as any).latestTime.toISOString()).toEqual('2024-01-01T01:00:00.000Z');
          expect((card as any).currentDatetime.toISOString()).toEqual('2024-01-01T01:00:00.000Z');
          expect((card as any).preloadedImages.size).toBe(16);
        });
      });

      describe('when currentDateTime is the earliest possible latestTime', () => {
        beforeEach(() => {
          (card as any).currentDatetime = new Date('2023-12-31T23:30:00Z');
        });

        test('should update private variable', () => {
          (card as any).updateLatestDatetime();
          expect((card as any).latestTime.toISOString()).toEqual('2024-01-01T01:00:00.000Z');
          expect((card as any).currentDatetime.toISOString()).toEqual('2023-12-31T23:36:00.000Z');
          expect((card as any).preloadedImages.size).toBe(16);
        });
      });

      describe('when currentDateTime is not latestTime nor earliest', () => {
        beforeEach(() => {
          (card as any).currentDatetime = new Date('2024-01-01T00:00:00Z');
        });

        test('should update private variable', () => {
          (card as any).updateLatestDatetime();
          expect((card as any).latestTime.toISOString()).toEqual('2024-01-01T01:00:00.000Z');
          expect((card as any).currentDatetime.toISOString()).toEqual('2024-01-01T00:00:00.000Z');
          expect((card as any).preloadedImages.size).toBe(16);
        });
      });
    });
  });
});