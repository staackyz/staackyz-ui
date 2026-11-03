/** The shared crosshair decides from the option alone which charts get it and how the rest fade. Runs via `npm test`. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DIM, crosshairSeries, expectedIdOf, formatValue, nearest, valueAt, withCrosshair } from '../src/charts/chartCrosshair.ts';

const line = (id, data, extra = {}) => ({ id, name: id, type: 'line', data, ...extra });
const chart = (series, extra = {}) => ({ xAxis: { type: 'category', data: ['a', 'b', 'c'] }, yAxis: { type: 'value' }, series, ...extra });

describe('which charts get the crosshair', () => {
    it('takes every line and bar that is not silent', () => {
        const option = chart([line('a', [1, 2, 3]), line(expectedIdOf('a'), [1, 1, 1], { silent: true }), { type: 'bar', data: [1, 2, 3] }]);

        assert.deepEqual(crosshairSeries(option), [0, 2]);
    });

    it('leaves alone a bar chart, the TV and a sideways ranking', () => {
        assert.deepEqual(crosshairSeries(chart([{ type: 'bar', data: [1] }])), []);
        assert.deepEqual(crosshairSeries(chart([line('a', [1])], { tooltip: { show: false } })), []);
        assert.deepEqual(crosshairSeries({ xAxis: { type: 'value' }, yAxis: { type: 'category' }, series: [line('a', [1])] }), []);
    });
});

describe('the point under the pointer', () => {
    it('is the series nearest in height', () => {
        assert.equal(
            nearest(
                [
                    { series: 0, y: 10 },
                    { series: 2, y: 80 },
                ],
                70,
            ),
            2,
        );
    });

    it('reads plain, object and missing values', () => {
        assert.equal(valueAt(line('a', [1, { value: 4 }, null]), 1), 4);
        assert.equal(valueAt(line('a', [1, { value: 4 }, null]), 2), null);
    });

    it('keeps the unit the screen already writes', () => {
        assert.equal(formatValue(chart([], { yAxis: { axisLabel: { formatter: '{value}%' } } }), 42, String), '42%');
        assert.equal(formatValue(chart([], { tooltip: { valueFormatter: (v) => `R$ ${v}` } }), 7, String), 'R$ 7');
    });

    it('lets one series write its own value, like a bar drawn below zero that still counts up', () => {
        const option = chart([{ type: 'bar', data: [-3], tooltip: { valueFormatter: (v) => String(Math.abs(v)) } }, line('net', [-3])]);

        assert.equal(formatValue(option, -3, String, 0), '3');
        assert.equal(formatValue(option, -3, String, 1), '-3');
    });
});

describe('the option under the crosshair', () => {
    it('fades the others but keeps the dashed expectation of the focused one', () => {
        const option = chart([line('a', [1, 2, 3]), line(expectedIdOf('a'), [1, 1, 1], { silent: true }), line('b', [3, 2, 1])]);
        const drawn = withCrosshair(option, 0);

        assert.equal(drawn.tooltip.show, false);
        assert.equal(drawn.series[0].lineStyle.opacity, 1);
        assert.equal(drawn.series[1].lineStyle.opacity, 1);
        assert.equal(drawn.series[2].lineStyle.opacity, DIM);
    });

    it('writes the full opacity back when the pointer leaves, so a merge cannot keep the fade', () => {
        const drawn = withCrosshair(chart([line('a', [1]), line('b', [2], { areaStyle: {} })]), null);

        assert.equal(drawn.series[1].lineStyle.opacity, 1);
        assert.equal(drawn.series[1].areaStyle.opacity, 0.7);
    });
});
