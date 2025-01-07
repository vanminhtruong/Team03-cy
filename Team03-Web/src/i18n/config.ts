export const locales = ['en', 'vi','ko'] as const;

export type Locale = (typeof locales)[number];
