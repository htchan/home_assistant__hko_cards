import {
    TYPE,
    NAME,
    DESCRIPTION,
    MAX_TIME_SLOTS,
    IMG_SIZE_SMALL,
    IMG_SIZE_MEDIUM,
    IMG_SIZE_LARGE,
    IMG_TIME_OFFSET_MINUTES,
    IMG_INTERVAL_SLOT_MINUTES
} from "./const";

import { cardStyles } from "../../utils/card-styles";

export class HkoRadarCard extends HTMLElement {
    private maxTimeSlots: number = MAX_TIME_SLOTS;
    private currentTimeIndex: number = MAX_TIME_SLOTS - 1;
    private imgSize: string = IMG_SIZE_MEDIUM;
    private config: any;
    private preloadedImages: Map<string, HTMLImageElement> = new Map();

    static get cardType(): string {
        return TYPE;
    }
    static get cardName(): string {
        return NAME;
    }
    static get cardDescription(): string {
        return DESCRIPTION;
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    setConfig(config: any): void {
        if (!config) {
        throw new Error('Invalid configuration');
        }
        this.config = config;
        this.render();
        this.preloadImages();
    }

    private getTimeForIndex(index: number): Date {
        const latestTime = new Date((new Date()).getTime() - (IMG_TIME_OFFSET_MINUTES * 60000));
        const roundedMinutes = Math.floor(latestTime.getMinutes() / IMG_INTERVAL_SLOT_MINUTES) * IMG_INTERVAL_SLOT_MINUTES;
        latestTime.setMinutes(roundedMinutes, 0, 0);
        
        return new Date(latestTime.getTime() - ((this.maxTimeSlots - 1 - index) * IMG_INTERVAL_SLOT_MINUTES * 60000));
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

    render() {
        this.shadowRoot!.innerHTML = `
            <style>${cardStyles.cssText}</style>
            <ha-card>
                <div>testing v0.0.1</div>
                <div class="card-content">
                    <img id="radar-image" src="${this.getImageUrl()}" alt="HKO Radar" />
                </div>
                <div class="card-content center">
                    <input type="range" id="time-slider" style="width: 100%;" min="0" max="${this.maxTimeSlots - 1}" value="${this.currentTimeIndex}">
                    <div id="time-display">${this.getTimeForIndex(this.currentTimeIndex).toLocaleString()}</div>
                </div>
                <div class="card-content center">
                    <button class="ha-card-button ${this.imgSize === '064' ? 'active' : ''}" data-size="064">Small</button>
                    <button class="ha-card-button ${this.imgSize === '128' ? 'active' : ''}" data-size="128">Medium</button>
                    <button class="ha-card-button ${this.imgSize === '256' ? 'active' : ''}" data-size="256">Large</button>
                </div>
            </ha-card>
        `;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const slider = this.shadowRoot!.querySelector('#time-slider') as HTMLInputElement;
        const sizeButtons = this.shadowRoot!.querySelectorAll('.ha-card-button');

        slider?.addEventListener('input', (e) => {
            this.currentTimeIndex = parseInt((e.target as HTMLInputElement).value);
            this.updateImage();
            this.updateTimeDisplay();
        });

        sizeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.imgSize = (e.target as HTMLElement).dataset.size!;
                this.updateSizeButtons();
                this.updateImage();
                this.preloadImages();
            });
        });
    }

    private updateImage() {
        const radarImage = this.shadowRoot!.querySelector('#radar-image') as HTMLImageElement;
        if (radarImage) radarImage.src = this.getImageUrl();
    }

    private updateTimeDisplay() {
        const timeDisplay = this.shadowRoot!.querySelector('#time-display');
        if (timeDisplay) timeDisplay.textContent = this.getTimeForIndex(this.currentTimeIndex).toLocaleString();
    }

    private updateSizeButtons() {
        const sizeButtons = this.shadowRoot!.querySelectorAll('.ha-card-button');
        sizeButtons.forEach(button => {
            button.classList.toggle('active', (button as HTMLElement).dataset.size === this.imgSize);
        });
    }

    private preloadImages() {
        for (let i = 0; i < this.maxTimeSlots; i++) {
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

    getCardSize() {
        return 3;
    }

    static getConfigElement() {
        return document.createElement('hko-radar-card-editor');
    }

    static getStubConfig() {
        return {};
    }
}