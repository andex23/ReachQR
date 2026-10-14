export interface Theme {
    id: string;
    name: string;
    /** Page background behind the card */
    bg: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    /** Primary button */
    accent: string;
    accentText: string;
}

export const THEMES: Theme[] = [
    {
        id: 'classic',
        name: 'Classic',
        bg: '#F6F4EF',
        card: '#FFFFFF',
        text: '#141414',
        muted: '#6B6B6B',
        border: '#141414',
        accent: '#141414',
        accentText: '#F6F4EF',
    },
    {
        id: 'midnight',
        name: 'Midnight',
        bg: '#0C0D10',
        card: '#16181D',
        text: '#F4F4F5',
        muted: '#A1A1AA',
        border: '#2E3138',
        accent: '#D4F25A',
        accentText: '#0C0D10',
    },
    {
        id: 'sunset',
        name: 'Sunset',
        bg: '#FFE9DA',
        card: '#FFFFFF',
        text: '#2B1608',
        muted: '#8A5A3C',
        border: '#2B1608',
        accent: '#F2541B',
        accentText: '#FFFFFF',
    },
    {
        id: 'forest',
        name: 'Forest',
        bg: '#E6EFE4',
        card: '#FFFFFF',
        text: '#10291A',
        muted: '#4F6B58',
        border: '#10291A',
        accent: '#1E6B40',
        accentText: '#FFFFFF',
    },
    {
        id: 'ocean',
        name: 'Ocean',
        bg: '#E3EDFA',
        card: '#FFFFFF',
        text: '#0B2140',
        muted: '#4A6283',
        border: '#0B2140',
        accent: '#1F5ED6',
        accentText: '#FFFFFF',
    },
    {
        id: 'blush',
        name: 'Blush',
        bg: '#FBE8EE',
        card: '#FFFFFF',
        text: '#3A1222',
        muted: '#8C5468',
        border: '#3A1222',
        accent: '#D23A72',
        accentText: '#FFFFFF',
    },
];

export const DEFAULT_THEME_ID = 'classic';

export function getTheme(id: string | null | undefined): Theme {
    return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function isThemeId(id: unknown): id is string {
    return typeof id === 'string' && THEMES.some((t) => t.id === id);
}

/** CSS custom properties consumed by ProfileCard */
export function themeVars(theme: Theme): Record<string, string> {
    return {
        '--p-bg': theme.bg,
        '--p-card': theme.card,
        '--p-text': theme.text,
        '--p-muted': theme.muted,
        '--p-border': theme.border,
        '--p-accent': theme.accent,
        '--p-accent-text': theme.accentText,
    };
}
