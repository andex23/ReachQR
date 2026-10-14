/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                paper: '#F6F4EF',
                ink: '#141414',
                accent: '#D4F25A',
                line: '#E4E1D8',
                muted: '#6B6B6B',
                // Per-profile theme, set as CSS variables by ProfileCard
                p: {
                    bg: 'var(--p-bg)',
                    card: 'var(--p-card)',
                    text: 'var(--p-text)',
                    muted: 'var(--p-muted)',
                    border: 'var(--p-border)',
                    accent: 'var(--p-accent)',
                    'accent-text': 'var(--p-accent-text)',
                },
            },
            fontFamily: {
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
            },
            boxShadow: {
                'hard-sm': '2px 2px 0 0 #141414',
                hard: '4px 4px 0 0 #141414',
                'hard-lg': '8px 8px 0 0 #141414',
            },
            keyframes: {
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-50%)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.35s ease-out both',
            },
        },
    },
    plugins: [],
};
