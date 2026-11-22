/** The lit shortcut reads as one shape, its tile the filled end of the outline (T-452 of the CMMS). Runs via `npm test`. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const read = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');

describe('the rail shortcut', () => {
    const list = read('components/NavList.vue');

    it('puts the tile flush on the left of its card and as tall as the row', () => {
        const tile = list.match(/const SHORTCUT_TILE =\s*'([^']+)'/)?.[1] ?? '';

        assert.match(tile, /\bsize-9\b/, 'the tile stopped filling the row height');
        assert.match(tile, /\bborder\b/, 'the narrow rail lost its bordered tile');
        assert.ok(list.includes("'relative w-full min-w-0 py-0 pl-0 font-bold'"), 'the row put padding back between tile and outline');
        assert.ok(!/min-h-10/.test(list), 'the pinned pair grew taller than the tile');
    });

    it('opens the right side of the tile into the card only when the rail is wide', () => {
        assert.ok(list.includes("props.compact ? 'rounded-lg' : 'rounded-l-lg rounded-r-none'"));
        assert.match(read('css/motion.css'), /\.nav-rail \.nav-rail-tile \{[^}]*border-radius var\(--mov-longo\) var\(--rail-curve\)/);
    });
});
