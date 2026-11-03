import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';

import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default defineConfigWithVueTs(
    vue.configs['flat/essential'],
    vueTsConfigs.recommended,
    {
        ignores: ['node_modules', 'tailwind-preset.js'],
    },
    {
        rules: {
            'vue/multi-word-component-names': 'off',
            'no-undef': 'error',
            'no-shadow': 'error',
            // The shadcn sources strip class before forwarding by naming it with an underscore
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true },
            ],
        },
    },
    {
        files: ['tests/**/*.mjs'],
        languageOptions: {
            globals: { process: 'readonly', console: 'readonly', URL: 'readonly', globalThis: 'readonly', setTimeout: 'readonly' },
        },
    },
    prettier,
);
