export const EDITOR_TYPE: string = "hko-radar-card-editor";
export const TYPE: string = "hko-radar-card";
export const NAME: string = "HKO Radar Card";
export const DESCRIPTION: string = "Display HKO radar images with time slider and size options";

export const MAX_TIME_SLOTS: number = 15;

export type ImgSize = "064" | "128" | "256";

export const IMG_SIZE_SMALL: ImgSize = "064";
export const IMG_SIZE_MEDIUM: ImgSize = "128";
export const IMG_SIZE_LARGE: ImgSize = "256";

export const IMG_TIME_OFFSET_MS: number = 240000; // 4 minutes
export const IMG_INTERVAL_MS: number = 360000; // 6 minutes

export interface HkoRadarCardConfig {
    defaultSize: ImgSize;
    timeSlotCount: number;
    autoRefresh: boolean;
}