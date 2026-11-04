import animate from 'tailwindcss-animate';
import defaultTheme from 'tailwindcss/defaultTheme';

// Tailwind still takes an opacity modifier on this form (bg-primary/10), and a plain bg-primary stays one declaration
// instead of two, which is kilobytes over every utility of a whole app
const token = (name) => `hsl(var(--${name}))`;

// The four steps a meaning carries, the solid block, the label on it, the pill fill and the pill text
const steps = (name) => ({
    DEFAULT: token(name),
    foreground: token(`${name}-foreground`),
    soft: token(`${name}-soft`),
    strong: token(`${name}-strong`),
});

// A button that changes something important, its fill, its label and a hover one step darker
const action = (name) => ({
    DEFAULT: token(name),
    foreground: token(`${name}-foreground`),
    hover: token(`${name}-hover`),
});

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['variant', '.dark &'],
    content: [],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope Variable', ...defaultTheme.fontFamily.sans],
            },
            // The floor of the product, nothing on a screen is smaller than 11px
            fontSize: {
                '2xs': '11px',
            },
            // The whole scale derives from --radius, a theme changes it in one place
            borderRadius: {
                sm: 'calc(var(--radius) - 4px)',
                md: 'calc(var(--radius) - 2px)',
                lg: 'var(--radius)',
                xl: 'calc(var(--radius) + 4px)',
                '2xl': 'calc(var(--radius) + 8px)',
                '3xl': 'calc(var(--radius) + 16px)',
            },
            colors: {
                background: token('background'),
                foreground: token('foreground'),
                card: { DEFAULT: token('card'), foreground: token('card-foreground') },
                field: token('field'),
                popover: { DEFAULT: token('popover'), foreground: token('popover-foreground') },
                primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
                secondary: { DEFAULT: token('secondary'), foreground: token('secondary-foreground') },
                muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
                accent: { DEFAULT: token('accent'), foreground: token('accent-foreground') },
                destructive: steps('destructive'),
                success: steps('success'),
                warning: steps('warning'),
                info: steps('info'),
                positive: action('positive'),
                negative: action('negative'),
                caution: action('caution'),
                border: token('border'),
                input: token('input'),
                ring: token('ring'),
                // Focus is a border and a fill, never a ring
                'input-focus': token('input-focus'),
                'field-focus': token('field-focus'),
            },
        },
    },
    plugins: [animate],
};
