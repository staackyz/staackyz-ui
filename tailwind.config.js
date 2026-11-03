import preset from './tailwind-preset.js';

// Only for the class sorting of prettier, the apps hold the real config
export default {
    presets: [preset],
    content: ['./src/**/*.{vue,ts}'],
};
