import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                indigo: {
                    50: '#EEF0FC',
                    100: '#DDE2F9',
                    200: '#B8C2F2',
                    300: '#92A3EB',
                    400: '#6D83E3',
                    500: '#4863DC',
                    600: '#3D55C0',
                    700: '#343D8A', // Base Deep Indigo
                    800: '#29306D',
                    900: '#1E2350',
                    950: '#121530',
                    DEFAULT: '#343D8A',
                },
                seamist: {
                    50: '#F8FDFD',
                    100: '#EEF8F9',
                    200: '#DCF0F2',
                    300: '#CAECEE', // Base Sea Mist
                    400: '#9ECDD1',
                    500: '#6CB0B5',
                    600: '#4B9096',
                    700: '#377378',
                    800: '#295B5F',
                    900: '#1D4346',
                    950: '#0F2628',
                    DEFAULT: '#F8FDFD', // Use light 50 as default background
                }
            }
        },
    },

    plugins: [forms],
};
