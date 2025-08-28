const HK_TIMEZONE_OFFSET_MINUTES = 480;

// it should always return HK time
export function now(): Date {
    const date = new Date();
    const result = date.getTime() + (date.getTimezoneOffset() * 60000) + (HK_TIMEZONE_OFFSET_MINUTES * 60000);

    return new Date(result);
}