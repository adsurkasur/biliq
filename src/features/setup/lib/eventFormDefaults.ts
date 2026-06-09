export const CAPTURE_COUNT_OPTIONS = [1, 2, 3, 4] as const;

export type CaptureCountOption = (typeof CAPTURE_COUNT_OPTIONS)[number];
