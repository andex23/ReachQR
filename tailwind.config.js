/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                milk: '#FAF9F6',
                ink: '#1A1A1A',
                'ink-light': '#333333',
                border: '#E5E5E5',
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
