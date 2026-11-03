/** A number counts up to its value on the token's clock, and is simply there when motion is off. Runs via `npm test`. */
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { nextTick, ref } from 'vue';
import { useCountUp } from '../src/composables/useCountUp.ts';

let clock = 0;
let frames = [];
const realPerformance = globalThis.performance;

const tick = (ms) => {
    clock += ms;
    const due = frames;
    frames = [];
    for (const frame of due) frame(clock);
};

const run = (ms) => {
    for (let spent = 0; spent < ms; spent += 16) tick(16);
};

beforeEach(() => {
    clock = 0;
    frames = [];
    globalThis.requestAnimationFrame = (frame) => frames.push(frame);
    globalThis.cancelAnimationFrame = () => (frames = []);
    Object.defineProperty(globalThis, 'performance', { value: { now: () => clock }, configurable: true, writable: true });
});

afterEach(() => {
    delete globalThis.requestAnimationFrame;
    delete globalThis.cancelAnimationFrame;
    delete globalThis.window;
    Object.defineProperty(globalThis, 'performance', { value: realPerformance, configurable: true, writable: true });
});

describe('useCountUp', () => {
    it('rises from zero to the value, never going back, and lands on it exactly', () => {
        const { value } = useCountUp(() => 366);
        const seen = [];

        for (let spent = 0; spent < 1200; spent += 16) {
            tick(16);
            seen.push(value.value);
        }

        assert.equal(value.value, 366);
        assert.ok(new Set(seen).size > 10, 'too few steps to be read as a count');
        assert.ok(
            seen.every((step, index) => index === 0 || step >= seen[index - 1]),
            'the count went back',
        );
    });

    it('jumps on the first read when fromZero is off, then counts from where it stands', async () => {
        const source = ref(10);
        const { value } = useCountUp(() => source.value, { fromZero: false });

        assert.equal(value.value, 10);

        source.value = 20;
        await nextTick();
        tick(16);
        tick(400);
        assert.ok(value.value > 10 && value.value < 20, `mid count at ${value.value}`);

        run(1200);
        assert.equal(value.value, 20);
    });

    it('keeps the decimals and formats the text', () => {
        const { value, text } = useCountUp(() => 12.345, { decimals: 2, format: (n) => `R$ ${n.toFixed(2)}` });

        tick(16);
        tick(300);
        assert.equal(Math.round(value.value * 100) / 100, value.value);

        run(1200);
        assert.equal(text.value, 'R$ 12.35');
    });

    it('is simply there under reduced motion', () => {
        globalThis.window = { matchMedia: () => ({ matches: true }) };

        const { value } = useCountUp(() => 42);

        assert.equal(value.value, 42);
        assert.equal(frames.length, 0);
    });

    it('reads a missing or broken value as zero', () => {
        assert.equal(useCountUp(() => null).value.value, 0);
        assert.equal(useCountUp(() => Number.NaN).value.value, 0);
    });
});
