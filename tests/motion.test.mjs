/** The entrance queue, the easings and the token reader hold their rules with no DOM. Runs via `npm test`. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { arrivalEasing, countEasing, reducedMotion, sheetDuration, STAGGER_CAP, staggeredEntrance } from '../src/lib/motion.ts';
import { createSeenItems, itemKey, SEEN_STORAGE_KEY } from '../src/lib/seenItems.ts';

const memory = () => {
    const data = new Map();

    return {
        data,
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, value),
        removeItem: (key) => data.delete(key),
    };
};

describe('staggeredEntrance', () => {
    it('places an item in the cascade by its index', () => {
        assert.deepEqual(staggeredEntrance(3), { class: 'mov-entra', style: { '--mov-i': '3' } });
    });

    it('sends everything past the cap into the tail, all at the last place', () => {
        assert.deepEqual(staggeredEntrance(STAGGER_CAP), { class: 'mov-entra-fim', style: { '--mov-i': String(STAGGER_CAP - 1) } });
        assert.equal(staggeredEntrance(400).style['--mov-i'], String(STAGGER_CAP - 1));
    });

    it('fades a row and gives a tall card the wider step', () => {
        assert.equal(staggeredEntrance(0, 'row').class, 'mov-entra-linha');
        assert.deepEqual(staggeredEntrance(1, 'card').style, { '--mov-i': '1', '--mov-passo': 'var(--mov-passo-largo)' });
    });
});

describe('easings', () => {
    for (const [name, easing] of [
        ['arrival', arrivalEasing],
        ['count', countEasing],
    ]) {
        it(`${name} starts at 0, ends at 1 and never goes back`, () => {
            assert.equal(easing(0), 0);
            assert.equal(easing(1), 1);

            let last = 0;
            for (let t = 0; t <= 1; t += 0.05) {
                assert.ok(easing(t) >= last, `${name} went back at ${t}`);
                last = easing(t);
            }
        });
    }

    it('lets the count ease more gently than the arrival, so its last values stay readable', () => {
        assert.ok(countEasing(0.5) < arrivalEasing(0.5));
    });
});

describe('outside a browser', () => {
    it('reads the fallback duration and no reduced motion', () => {
        assert.equal(sheetDuration('--mov-conta', 1100), 1100);
        assert.equal(reducedMotion(), false);
    });
});

describe('seen items', () => {
    it('names an item by the first id attribute it carries', () => {
        const item = { getAttribute: (name) => (name === 'data-item-id' ? '7' : null) };

        assert.equal(itemKey(item), 'data-item-id=7');
        assert.equal(itemKey(item, ['data-order-row']), null);
    });

    it('remembers across reads, forgets the oldest past the cap and clears for the next person', () => {
        const store = memory();
        const seen = createSeenItems(store, 2);

        seen.add('a');
        seen.add('b');
        seen.add('c');
        seen.flush();

        assert.deepEqual(JSON.parse(store.data.get(SEEN_STORAGE_KEY)), ['b', 'c']);
        assert.ok(createSeenItems(store).has('c'));

        seen.clear();
        assert.equal(store.data.has(SEEN_STORAGE_KEY), false);
    });

    it('survives a blocked storage and a broken value', () => {
        const fail = () => {
            throw new Error('blocked');
        };
        const seen = createSeenItems({ getItem: () => '{not json', setItem: fail, removeItem: fail });

        seen.add('a');
        assert.doesNotThrow(() => seen.flush());
        assert.doesNotThrow(() => seen.clear());
    });
});

describe('the stylesheet', () => {
    const css = readFileSync(new URL('../src/css/motion.css', import.meta.url), 'utf8');
    const reduced = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)].map((match) => match[1]).join('\n');

    it('keeps the three durations and the two curves', () => {
        for (const token of [
            '--mov-curto: 130ms;',
            '--mov-medio: 220ms;',
            '--mov-longo: 420ms;',
            '--mov-chegada: cubic-bezier(0.22, 1, 0.36, 1);',
            '--mov-volta: cubic-bezier(0.4, 0, 0.2, 1);',
        ]) {
            assert.ok(css.includes(token), `motion.css lost ${token}`);
        }
    });

    it('turns every moving class off under reduced motion', () => {
        const moving = [
            '.mov-entra',
            '.mov-entra-fim',
            '.mov-entra-linha',
            '.mov-toque',
            '.mov-cartao',
            '.mov-icone',
            '.mov-texto',
            '.mov-troca-enter-active',
            '.gaveta-enter-active',
            '.fold-rows',
            '.live-enter-active',
            '.live-row-enter-active',
            '.mov-dispensa-leave-active',
            '.mov-conclui-leave-active',
            '.mov-pulsa',
            '.mov-esqueleto::after',
            '.mov-atualiza',
            '.mov-barra',
            '.destaque-mudou',
            '[data-selected][data-selected]',
            '.nav-rail',
        ];
        const missing = moving.filter((selector) => !reduced.includes(selector));

        assert.deepEqual(missing, [], `moves with reduced motion on, ${missing.join(', ')}`);
    });

    it('zeroes the origin of every Vue transition as well, or a frame is left transparent', () => {
        const origins = [...css.matchAll(/^(\.[\w-]+-enter-from)/gm)].map((match) => match[1]);
        const missing = [...new Set(origins)].filter((selector) => !reduced.includes(selector));

        assert.deepEqual(missing, [], `origin left as is under reduced motion, ${missing.join(', ')}`);
    });

    it('never eases linearly, whatever moves eases', () => {
        assert.doesNotMatch(css, /\blinear\b(?!-gradient)/);
    });
});
