/** A lit shortcut or item reads as one shape, its tile the filled end of the outline (T-452 of the CMMS). Runs via `npm test`. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const read = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');

const classesOf = (source, name) => (source.match(new RegExp(`const ${name} =\\s*'([^']+)'`))?.[1] ?? '').split(' ');

describe('the lit nav item', () => {
    const list = read('components/NavList.vue');

    it('keeps the 32px square unlit inside a 36px box flush with the row, so lighting grows it without moving it', () => {
        const tile = classesOf(list, 'TILE');

        for (const name of ['size-9', 'border-2', 'bg-clip-padding']) assert.ok(tile.includes(name), name);
        assert.ok(classesOf(list, 'ITEM_ROW').includes('pl-0'), 'the row put padding back between tile and outline');
    });

    it('draws the lit row with the same outline card as the lit shortcut, and squares the tile only when wide', () => {
        assert.ok(list.includes("(item.tone === 'danger' ? 'border-destructive bg-destructive/10' : 'border-primary bg-primary/10')"));
        assert.ok(list.includes("isCurrent(item) && !props.compact ? 'rounded-l-lg rounded-r-none' : 'rounded-lg'"));
        assert.ok(!/bg-primary\/10 font-semibold/.test(list), 'the lit row went back to a plain fill');
    });
});

describe('the rail shortcut', () => {
    const list = read('components/NavList.vue');

    it('puts the tile flush on the left of its card and as tall as the row', () => {
        const tile = classesOf(list, 'SHORTCUT_TILE');

        assert.ok(tile.includes('size-9'), 'the tile stopped filling the row height');
        assert.ok(tile.includes('border'), 'the narrow rail lost its bordered tile');
        assert.ok(list.includes("'relative w-full min-w-0 py-0 pl-0 font-bold'"), 'the row put padding back between tile and outline');
        assert.ok(!/min-h-10/.test(list), 'the pinned pair grew taller than the tile');
    });

    it('opens the right side of the tile into the card only when the rail is wide', () => {
        assert.ok(list.includes("props.compact ? 'rounded-lg' : 'rounded-l-lg rounded-r-none'"));
        assert.match(read('css/motion.css'), /\.nav-rail \.nav-rail-tile \{[^}]*border-radius var\(--mov-longo\) var\(--rail-curve\)/);
    });
});
