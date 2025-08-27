import {
    TYPE,
    NAME,
    EDITOR_TYPE,
    DESCRIPTION,
    MAX_TIME_SLOTS,
    IMG_SIZE_MEDIUM,
    IMG_TIME_OFFSET_MS,
    IMG_INTERVAL_MS,
    HkoRadarCardConfig,
} from "./const";

import { html } from "lit";


import { HomeAssistantCard, HomeAssistantCardEditor } from "../types";
import { cardStyles } from "./styles";
import { HkoRadarCardEditor } from "./editor";

function timeWithOffset(offsetIntervalCount: number): Date {
    let nowMs = new Date().getTime();
    return new Date(Math.floor((nowMs - IMG_TIME_OFFSET_MS) / IMG_INTERVAL_MS + offsetIntervalCount) * IMG_INTERVAL_MS);
}

function time2OffsetIntervalCount(date: Date): number {
    let nowMs = date.getTime();
    let latestTime = timeWithOffset(0).getTime();
    return Math.floor((nowMs - latestTime) / IMG_INTERVAL_MS);
}

function formatTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}`;
}

function getImageUrl(imgSize: string, date: Date): string {
    return `https://www.hko.gov.hk/wxinfo/radars/rad_${imgSize}_png/2d${imgSize}nradar_${formatTime(date)}.jpg`;
}

export class HkoRadarCard extends HomeAssistantCard {
    private config: HkoRadarCardConfig = (this.constructor as typeof HkoRadarCard).getStubConfig();
    private imgSize: string = this.config.defaultSize;
    private currentDatetime: Date = timeWithOffset(0);
    private preloadedImages: Map<string, HTMLImageElement> = new Map();
    private latestTime: Date = timeWithOffset(0);
    private updateTimer: any = null;

    static get properties() {
        return {
            config: { type: Object },
            currentDatetime: { type: Date },
            imgSize: { type: String },
            preloadedImages: { type: Object },
            latestTime: { type: Date },
        };
    }

    static get cardType(): string { return TYPE; }
    static get cardName(): string { return NAME; }
    static get cardDescription(): string { return DESCRIPTION; }
    static get cardPreview(): boolean { return true; }
    static get cardEditor(): typeof HomeAssistantCardEditor { return HkoRadarCardEditor; }
    static getConfigElement():HTMLElement { return document.createElement(EDITOR_TYPE); }
    static getStubConfig(): HkoRadarCardConfig {
        return {
            defaultSize: IMG_SIZE_MEDIUM,
            timeSlotCount: MAX_TIME_SLOTS,
            autoRefresh: false,
        };
    }
    static get styles() {
        return cardStyles;
    }

    constructor() {
        super();
        this.scheduleLatestDatetimeRefresh();
    }

    setConfig(config: HkoRadarCardConfig): void {
        if (!config) {
            throw new Error('Invalid configuration');
        }
        this.config = config;
        this.imgSize = this.config.defaultSize;
        this.latestTime = timeWithOffset(0);
        this.currentDatetime = timeWithOffset(0);

        this.scheduleLatestDatetimeRefresh();
        this.preloadImages();
    }

    render() {
        return html`
            <ha-card>
                <div class="card-content">
                    <img id="radar-image" src="${this.getPreloadedImageUrl(this.currentDatetime)}" alt="HKO Radar" />
                </div>
                <div class="card-content center">
                    <input
                        type="range"
                        style="width: 100%;"
                        min="0" max="${this.config.timeSlotCount - 1}"
                        value="${time2OffsetIntervalCount(this.currentDatetime) + this.config.timeSlotCount - 1}"
                        @input="${this._onSliderInput}"
                    />
                    <div id="time-display">${this.currentDatetime.toLocaleString()}</div>
                </div>
                <div class="card-content center">
                    <button class="ha-card-button ${this.imgSize === '064' ? 'active' : ''}" data-size="064" @click="${this._onButtonClick}">Small</button>
                    <button class="ha-card-button ${this.imgSize === '128' ? 'active' : ''}" data-size="128" @click="${this._onButtonClick}">Medium</button>
                    <button class="ha-card-button ${this.imgSize === '256' ? 'active' : ''}" data-size="256" @click="${this._onButtonClick}">Large</button>
                </div>
            </ha-card>
        `;
    }

    disconnectedCallback(): void {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
        super.disconnectedCallback();
    }

    private _onSliderInput(event: Event) {
        const value = parseInt((event.target as HTMLInputElement).value);
        this.currentDatetime = timeWithOffset(value - this.config.timeSlotCount + 1);
    }

    private _onButtonClick(event: Event) {
        const size = (event.target as HTMLElement).dataset.size;
        if (size) {
            this.imgSize = size;
            this.preloadImages();
        }
    }

    private preloadImages() {
        for (let i = 1; i <= this.config.timeSlotCount; i++) {
            const url = getImageUrl(this.imgSize, timeWithOffset(i - this.config.timeSlotCount ));
            
            if (!this.preloadedImages.has(url)) {
                const img = new Image();
                img.src = url;
                this.preloadedImages.set(url, img);
            }
        }
    }

    private getPreloadedImageUrl(date: Date): string {
        const url = getImageUrl(this.imgSize, date);
        const preloadedImg = this.preloadedImages.get(url);
        return preloadedImg?.src || url;
    }

    private scheduleLatestDatetimeRefresh() {
        const delay = Math.max(timeWithOffset(1).getTime() - new Date().getTime() + IMG_TIME_OFFSET_MS + 5000, 5000); // at least wait for 5 seconds
        if (this.updateTimer === null && this.config.autoRefresh) {
            this.updateTimer = setTimeout(() => {
                this.updateLatestDatetime();
                // clear old timer
                if (this.updateTimer) {
                    clearTimeout(this.updateTimer);
                    this.updateTimer = null;
                }
                // schedule next update
                this.scheduleLatestDatetimeRefresh();
            }, delay);
        } else if (this.updateTimer !== null && !this.config.autoRefresh) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
    }

    private updateLatestDatetime() {
        const newLatestTime = timeWithOffset(0);
        if (newLatestTime.getTime() !== this.latestTime.getTime()) {
            if (this.currentDatetime.getTime() === this.latestTime.getTime()) {
                this.currentDatetime = newLatestTime;
            } else if (Math.abs(time2OffsetIntervalCount(this.currentDatetime)) >= this.config.timeSlotCount) {
                this.currentDatetime = timeWithOffset(-(this.config.timeSlotCount - 1));
            }
            this.latestTime = newLatestTime;
            this.preloadImages();
        }
    }
}