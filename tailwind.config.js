/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    50: '#f0e7ff',
                    100: '#ddd0ff',
                    200: '#bba4ff',
                    300: '#9970ff',
                    400: '#7c3aed',
                    500: '#6d28d9',
                    600: '#5b21b6',
                    700: '#4c1d95',
                    DEFAULT: '#7c3aed',
                },
                surface: {
                    50: '#1a1a2e',
                    100: '#16213e',
                    200: '#0f3460',
                    DEFAULT: '#1a1a2e',
                },
                muted: {
                    DEFAULT: '#6b7280',
                    light: '#9ca3af',
                },
            },
            animation: {
                'gradient-shift': 'gradientShift 8s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};
