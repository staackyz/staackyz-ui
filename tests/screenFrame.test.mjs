/** A framed screen never grows the page: what sits deep in its list stays inside the scroller (T-449 of the CMMS). Runs via `npm test`. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const frame = readFileSync(new URL('../src/components/ScreenFrame.vue', import.meta.url), 'utf8');

const rule = (selector) => {
    const start = frame.indexOf(`${selector} {`);
    assert.ok(start >= 0, `the ${selector} rule is gone`);

    return frame.slice(start, frame.indexOf('}', start));
};

describe('the screen frame', () => {
    it('clips the main that holds it, so nothing placed against main stretches the document', () => {
        assert.match(rule('main:has(.screen-frame)'), /\boverflow:\s*clip;/);
    });

    it('positions the scroller, so an absolute child scrolls and clips with the rows', () => {
        assert.match(rule('.screen-scroll'), /\bposition:\s*relative;/);
    });
});
