import { cva, type VariantProps } from 'class-variance-authority';

export { default as Button } from './Button.vue';

// `mov-toque` replaces `transition-colors` here so every button in the product answers touch the same way
export const buttonVariants = cva(
    'mov-toque inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:bg-primary/90',
                // The same red as negative, the old red-500 under white measured 3.76 and failed AA, and hover goes a step darker since fading would lose contrast
                destructive: 'bg-negative text-negative-foreground shadow-sm hover:bg-negative-hover focus-visible:bg-negative-hover',
                // Actions that change something important carry their meaning in colour
                positive: 'bg-positive text-positive-foreground shadow-sm hover:bg-positive-hover focus-visible:bg-positive-hover',
                negative: 'bg-negative text-negative-foreground shadow-sm hover:bg-negative-hover focus-visible:bg-negative-hover',
                caution: 'bg-caution text-caution-foreground shadow-sm hover:bg-caution-hover focus-visible:bg-caution-hover',
                outline:
                    'border-2 border-primary bg-transparent text-primary shadow-sm hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground',
                // Paired actions that must not look alike, like stock in and stock out, the strong token flips for the dark theme
                'outline-success':
                    'border-2 border-success-strong bg-transparent text-success-strong shadow-sm hover:border-success hover:bg-success hover:text-success-foreground focus-visible:border-success focus-visible:bg-success focus-visible:text-success-foreground',
                'outline-destructive':
                    'border-2 border-destructive-strong bg-transparent text-destructive-strong shadow-sm hover:border-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:border-destructive focus-visible:bg-destructive focus-visible:text-destructive-foreground',
                secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline focus-visible:underline',
            },
            size: {
                default: 'h-10 px-5 py-2',
                sm: 'h-8 px-4 text-xs',
                lg: 'h-12 px-8 text-base',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
