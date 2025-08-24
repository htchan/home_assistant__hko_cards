export const TYPE = "hko-radar-card";
export const NAME = "HKO Radar Card";
export const DESCRIPTION = "Display HKO radar images with time slider and size options";

export const MAX_TIME_SLOTS = 15;

export type ImgSize = "064" | "128" | "256";

export const IMG_SIZE_SMALL: ImgSize = "064";
export const IMG_SIZE_MEDIUM: ImgSize = "128";
export const IMG_SIZE_LARGE: ImgSize = "256";

export const IMG_TIME_OFFSET_MINUTES = 4;
export const IMG_INTERVAL_SLOT_MINUTES = 6;