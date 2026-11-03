/** Everything that floats over content wears the one elevation, and no surface writes a shadow of its own. Runs via `npm test`. */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

// The floating primitives every screen inherits from, each one on the token
const FLOATING = [
    'ui/dialog/DialogSurface.vue',
    'ui/sheet/index.ts',
    'ui/dropdown-menu/DropdownMenuContent.vue',
    'ui/dropdown-menu/DropdownMenuSubContent.vue',
    'ui/tooltip/TooltipContent.vue',
    'components/PhoneHubSheet.vue',
    'charts/ChartCrosshair.vue',
];

// What may keep a shadow of its own, and why, none of these floats over content as a surface
const OWN_SHADOW = new Map([['components/AppShell.vue', 'the skip link, a focused link and not a surface']]);

const files = (folder = '.') =>
    readdirSync(join(SRC, folder), { withFileTypes: true }).flatMap((entry) => {
        const path = folder === '.' ? entry.name : `${folder}/${entry.name}`;
        if (entry.isDirectory()) return files(path);

        return /\.(vue|ts)$/.test(entry.name) ? [path] : [];
    });

const read = (path) => readFileSync(join(SRC, path), 'utf8');

describe('elevation', () => {
    it('keeps the token values', () => {
        const css = read('css/base.css');

        for (const token of [
            '--elevation-ring: hsl(var(--foreground) / 0.14);',
            '--elevation-highlight: inset 0 1px 0 hsl(0 0% 100% / 0.06);',
            '--elevation-shadow: 0 2px 6px -2px rgb(0 0 0 / 0.35), 0 36px 90px -18px rgb(0 0 0 / 0.7);',
            '--elevation-shadow-sm: 0 1px 3px -1px rgb(0 0 0 / 0.3), 0 12px 32px -8px rgb(0 0 0 / 0.45);',
        ]) {
            assert.ok(css.includes(token), `base.css lost ${token}`);
        }
    });

    it('declares the ring again wherever the theme changes the text colour', () => {
        assert.match(read('css/base.css'), /:root,\s*\.theme-light,\s*\.dark\s*\{\s*--elevation-ring: hsl\(var\(--foreground\) \/ 0\.14\);/);
    });

    it('puts every floating primitive on the token', () => {
        const missing = FLOATING.filter((path) => !/elevation-float/.test(read(path)));

        assert.deepEqual(missing, [], `floating surface with no elevation, ${missing.join(', ')}`);
    });

    it('lets no file write shadow-md, shadow-lg, shadow-xl, shadow-2xl or an arbitrary shadow', () => {
        const offenders = files()
            .filter((path) => !OWN_SHADOW.has(path))
            .filter((path) => /\bshadow-(md|lg|xl|2xl|\[)/.test(read(path)));

        assert.deepEqual(offenders, [], `shadow written by hand, use elevation-float or elevation-float-sm, ${offenders.join(', ')}`);
    });
});
