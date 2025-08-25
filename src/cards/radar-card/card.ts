import {
    TYPE,
    NAME,
    EDITOR_TYPE,
    DESCRIPTION,
    MAX_TIME_SLOTS,
    IMG_SIZE_MEDIUM,
    IMG_TIME_OFFSET_MINUTES,
    IMG_INTERVAL_SLOT_MINUTES,
} from "./const";
import { HkoRadarCardConfig } from "./config";

import { html } from "lit";


import { HomeAssistantCard, HomeAssistantCardEditor } from "../types";
import { cardStyles } from "./card-style";
import { HkoRadarCardEditor } from "./card-editor";

export class HkoRadarCard extends HomeAssistantCard {
    private config: HkoRadarCardConfig = (this.constructor as typeof HkoRadarCard).getStubConfig();
    private currentTimeIndex: number = this.config.timeSlotCount - 1;
    private imgSize: string = this.config.defaultSize;
    private preloadedImages: Map<string, HTMLImageElement> = new Map();

    static get properties() {
        return {
            config: { type: Object },
            currentTimeIndex: { type: Number },
            imgSize: { type: String },
            preloadedImages: { type: Object },
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
        };
    }

    setConfig(config: HkoRadarCardConfig): void {
        if (!config) {
            throw new Error('Invalid configuration');
        }
        this.config = config
        this.imgSize = this.config.defaultSize;
        this.currentTimeIndex = this.config.timeSlotCount - 1;

        this.preloadImages();
    }

    render() {
        return html`
            <style>${cardStyles.cssText}</style>
            <ha-card>
                <div class="card-content">
                    <img id="radar-image" src="${this.getPreloadedImageUrl()}" alt="HKO Radar" />
                </div>
                <div class="card-content center">
                    <input 
                        type="range"
                        style="width: 100%;"
                        min="0" max="${this.config.timeSlotCount - 1}"
                        value="${this.currentTimeIndex}"
                        @input="${this._onSliderInput}"
                    />
                    <div id="time-display">${this.getTimeForIndex(this.currentTimeIndex).toLocaleString()}</div>
                </div>
                <div class="card-content center">
                    <button class="ha-card-button ${this.imgSize === '064' ? 'active' : ''}" data-size="064" @click="${this._onButtonClick}">Small</button>
                    <button class="ha-card-button ${this.imgSize === '128' ? 'active' : ''}" data-size="128" @click="${this._onButtonClick}">Medium</button>
                    <button class="ha-card-button ${this.imgSize === '256' ? 'active' : ''}" data-size="256" @click="${this._onButtonClick}">Large</button>
                </div>
            </ha-card>
        `;
    }

    private getTimeForIndex(index: number): Date {
        const latestTime = new Date((new Date()).getTime() - (IMG_TIME_OFFSET_MINUTES * 60000));
        const roundedMinutes = Math.floor(latestTime.getMinutes() / IMG_INTERVAL_SLOT_MINUTES) * IMG_INTERVAL_SLOT_MINUTES;
        latestTime.setMinutes(roundedMinutes, 0, 0);
        
        return new Date(latestTime.getTime() - ((this.config.timeSlotCount - 1 - index) * IMG_INTERVAL_SLOT_MINUTES * 60000));
    }

    private formatTime(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}${month}${day}${hours}${minutes}`;
    }

    private getImageUrl(): string {
        const formatted = this.formatTime(this.getTimeForIndex(this.currentTimeIndex));
        return `https://www.hko.gov.hk/wxinfo/radars/rad_${this.imgSize}_png/2d${this.imgSize}nradar_${formatted}.jpg`;
    }

    private getPreloadedImageUrl(): string {
        const url = this.getImageUrl();
        const preloadedImg = this.preloadedImages.get(url);
        return preloadedImg?.src || url;
    }

    private _onSliderInput(event: Event) {
        this.currentTimeIndex = parseInt((event.target as HTMLInputElement).value);
    }

    private _onButtonClick(event: Event) {
        this.imgSize = (event.target as HTMLElement).dataset.size!;
        this.preloadImages();
    }

    private preloadImages() {
        for (let i = 0; i < this.config.timeSlotCount; i++) {
            const time = this.getTimeForIndex(i);
            const formatted = this.formatTime(time);
            const url = `https://www.hko.gov.hk/wxinfo/radars/rad_${this.imgSize}_png/2d${this.imgSize}nradar_${formatted}.jpg`;
            
            if (!this.preloadedImages.has(url)) {
                const img = new Image();
                img.src = url;
                this.preloadedImages.set(url, img);
            }
        }
    }
}