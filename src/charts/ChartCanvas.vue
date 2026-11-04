<script setup lang="ts">
import { useElementSize, useEventListener, useMediaQuery, useMutationObserver } from '@vueuse/core';
import { BarChart, LineChart, ScatterChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useUi } from '../lib/config';
import { STAGGER_CAP, arrivalEasing, sheetDuration } from '../lib/motion';
import { categoryAt, companionOf, crosshairSeries, formatValue, nearest, valueAt, withCrosshair } from './chartCrosshair';
import ChartCrosshair, { type CrosshairPoint } from './ChartCrosshair.vue';
import { chartTheme } from './chartTheme';

// Only this component knows ECharts exists, the caller hands ECharts' own option object
const props = defineProps<{
    option: Record<string, unknown>;
    /** The chart needs a fixed height because a canvas does not grow on its own */
    height?: string;
    /** The point the keyboard walks to, drawn with the same crosshair as the pointer */
    focusIndex?: number | null;
    /** How a plain value reads in the crosshair, the locale number when left out */
    formatNumber?: (value: number, decimals?: number) => string;
}>();

const emit = defineEmits<{ (e: 'select', name: string): void; (e: 'point', index: number): void }>();

// Every series type this registry answers for, and draw() below fails loudly in dev when an option asks for one missing here
const REGISTERED_CHART_TYPES = ['line', 'bar', 'scatter'];

echarts.use([LineChart, BarChart, ScatterChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const box = ref<HTMLElement | null>(null);
const { width } = useElementSize(box);

// Reduced motion also zeroes the chart animation, which is exactly what bothers who asked for it
const stillness = useMediaQuery('(prefers-reduced-motion: reduce)');

let chart: echarts.ECharts | null = null;

// The document class is what really knows the theme, since useAppearance returns a fresh ref per call
const isDark = () => document.documentElement.classList.contains('dark');

// A bar index can come as NaN from ECharts, so the cascade falls back to the first place
const cascade = (index: number) => Math.min(Number.isFinite(index) ? index : 0, STAGGER_CAP - 1) * sheetDuration('--mov-passo', 25);

// The motion goes after the screen option, so a screen can never write its own timing
const motion = () => ({
    animation: !stillness.value && document.visibilityState !== 'hidden',
    animationDuration: sheetDuration('--mov-conta', 1100),
    animationEasing: arrivalEasing,
    animationDelay: cascade,
    animationDurationUpdate: sheetDuration('--mov-medio', 220),
    animationEasingUpdate: arrivalEasing,
    // A value that moves does not cascade, since the cascade is the vocabulary of what arrives
    animationDelayUpdate: 0,
});

const asList = (value: unknown) => (Array.isArray(value) ? value : value === undefined ? [] : [value]);

// A type missing from REGISTERED_CHART_TYPES draws an empty frame with no console error, so dev catches it here instead
const assertRegisteredTypes = (option: Record<string, unknown>) => {
    if (!(import.meta as { env?: { DEV?: boolean } }).env?.DEV) return;

    const missing = asList(option.series)
        .map((series) => (series as { type?: string })?.type)
        .filter((type): type is string => !!type && !REGISTERED_CHART_TYPES.includes(type));

    if (missing.length) {
        throw new Error(`ChartCanvas, series type "${missing[0]}" is not registered in echarts.use, so the chart would silently draw empty`);
    }
};

// The shape is what decides between replacing and merging below
const shapeOf = (option: Record<string, unknown>): string => {
    const size = (owner: unknown) => {
        const data = (owner as { data?: unknown })?.data;

        return Array.isArray(data) ? data.length : 0;
    };

    const series = asList(option.series).map((one) => `${(one as { type?: string })?.type ?? ''}:${size(one)}`);
    const axes = [...asList(option.xAxis), ...asList(option.yAxis)].map(size);

    return [...series, '/', ...axes].join('|');
};

let drawnShape: string | null = null;

const draw = () => {
    if (!box.value) return;

    assertRegisteredTypes(props.option);

    if (!chart) {
        // Registered on every build, so the tokens read are the ones of the theme on screen now
        const theme = isDark() ? 'staackyz-dark' : 'staackyz-light';
        echarts.registerTheme(theme, chartTheme(isDark()));
        chart = echarts.init(box.value, theme, { renderer: 'canvas' });
    }

    // A new shape replaces the drawing, the same shape merges so the values move instead of being drawn again
    const shape = shapeOf(props.option);
    const reshaped = shape !== drawnShape;
    drawnShape = shape;

    chart.setOption({ backgroundColor: 'transparent', ...withCrosshair(props.option, focused.value), ...motion() }, { notMerge: reshaped });
};

// ECharts keeps the drawn geometry on its model, and only that knows where a stacked or smoothed point really sits
interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface SeriesData {
    getItemLayout(index: number): unknown;
    getLayout(key: 'points' | 'pointsRange'): unknown;
    getVisual(key: 'style'): { stroke?: unknown; fill?: unknown } | undefined;
    getItemVisual(index: number, key: 'style'): { stroke?: unknown; fill?: unknown } | undefined;
}

interface ChartModel {
    getSeriesByIndex(index: number): { getData(): SeriesData } | undefined;
    getComponent(main: string, index?: number): { coordinateSystem?: { getRect(): Rect } } | undefined;
}

const ui = useUi();

const number = (value: number, decimals?: number) => {
    const format = props.formatNumber ?? ui.formatNumber;

    return format ? format(value, decimals) : new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }).format(value);
};

const candidates = computed(() => crosshairSeries(props.option));
const point = ref<CrosshairPoint | null>(null);
const focused = computed(() => point.value?.series ?? null);

let pointer: { x: number; y: number } | null = null;

const model = () => (chart as unknown as { getModel(): ChartModel } | null)?.getModel();

const seriesList = () => (Array.isArray(props.option.series) ? props.option.series : []) as { type?: string; name?: string }[];

// A line keeps every point in one flat typed array, two numbers each, and only bars keep a layout per item
const linePoint = (data: SeriesData, index: number): { x: number; y: number } | null => {
    const points = data.getLayout('points');
    const range = data.getLayout('pointsRange');
    const start = range && typeof range === 'object' && 'start' in range && typeof range.start === 'number' ? range.start : 0;
    const flat = points instanceof Float32Array || Array.isArray(points) ? points : null;
    const at = (index - start) * 2;

    return flat && at >= 0 && at + 1 < flat.length ? { x: Number(flat[at]), y: Number(flat[at + 1]) } : null;
};

const pixelOf = (series: number, index: number): { x: number; y: number } | null => {
    const data = model()?.getSeriesByIndex(series)?.getData();
    const layout = data?.getItemLayout(index);
    let spot: { x: number; y: number } | null = null;

    if (Array.isArray(layout)) spot = { x: Number(layout[0]), y: Number(layout[1]) };
    else if (data && seriesList()[series]?.type === 'line') spot = linePoint(data, index);
    // A bar's point is the end away from the baseline, where its value is read
    else if (layout && typeof layout === 'object' && 'width' in layout) {
        const bar = layout as Rect;
        spot = { x: bar.x + bar.width / 2, y: bar.y + bar.height };
    }

    return spot && Number.isFinite(spot.x) && Number.isFinite(spot.y) ? spot : null;
};

const colorOf = (series: number, index: number): string => {
    const data = model()?.getSeriesByIndex(series)?.getData();
    const style = seriesList()[series]?.type === 'line' ? data?.getVisual('style') : data?.getItemVisual(index, 'style');
    const paint = seriesList()[series]?.type === 'line' ? (style?.stroke ?? style?.fill) : (style?.fill ?? style?.stroke);

    return typeof paint === 'string' ? paint : 'currentColor';
};

const categoryCount = () => {
    const axis = Array.isArray(props.option.xAxis) ? props.option.xAxis[0] : props.option.xAxis;
    const data = (axis as { data?: unknown[] } | undefined)?.data;

    return Array.isArray(data) ? data.length : 0;
};

const nearestIndex = (x: number): number | null => {
    let best: { index: number; distance: number } | null = null;

    for (let index = 0; index < categoryCount(); index++) {
        const at = chart?.convertToPixel({ xAxisIndex: 0 }, index);
        const distance = typeof at === 'number' ? Math.abs(at - x) : Infinity;

        if (!best || distance < best.distance) best = { index, distance };
    }

    return best?.index ?? null;
};

// The pointer's height picks the series, and without one (the keyboard) the series already shown stays
const place = (index: number, y: number | null) => {
    const rect = model()?.getComponent('grid', 0)?.coordinateSystem?.getRect();

    if (!chart || !rect || !box.value) return;

    const points = candidates.value.flatMap((series) => {
        const spot = valueAt(seriesList()[series], index) === null ? null : pixelOf(series, index);

        return spot ? [{ series, ...spot }] : [];
    });

    const series =
        y !== null ? nearest(points, y) : (points.find((candidate) => candidate.series === point.value?.series)?.series ?? points[0]?.series ?? null);
    const spot = points.find((candidate) => candidate.series === series);
    const guideX = chart.convertToPixel({ xAxisIndex: 0 }, index);

    if (series === null || !spot) {
        point.value = null;

        return;
    }

    const value = valueAt(seriesList()[series], index) ?? 0;
    const companion = companionOf(props.option, series);
    const expected = companion === null ? null : valueAt(seriesList()[companion], index);

    point.value = {
        x: typeof guideX === 'number' ? guideX : spot.x,
        y: spot.y,
        index,
        series,
        color: colorOf(series, index),
        name: seriesList()[series]?.name ?? '',
        value: formatValue(props.option, value, (raw) => number(raw), series),
        expected: expected === null || companion === null ? null : formatValue(props.option, expected, (raw) => number(raw, 1), companion),
        label: categoryAt(props.option, index),
        grid: rect,
        width: box.value.clientWidth,
    };

    emit('point', index);
};

const clear = () => {
    pointer = null;

    if (props.focusIndex === null || props.focusIndex === undefined) point.value = null;
    else place(props.focusIndex, null);
};

const trackAt = (spot: { x: number; y: number }, mouse: boolean) => {
    if (!chart || candidates.value.length === 0) return;

    if (!chart.containPixel({ gridIndex: 0 }, [spot.x, spot.y])) {
        if (mouse) clear();

        return;
    }

    const index = nearestIndex(spot.x);

    pointer = spot;

    if (index !== null) place(index, spot.y);
};

let touched = false;

const track = (event: PointerEvent) => {
    if (!box.value) return;

    touched = event.pointerType === 'touch';

    const bounds = box.value.getBoundingClientRect();

    trackAt({ x: event.clientX - bounds.left, y: event.clientY - bounds.top }, event.pointerType === 'mouse');
};

// On a card that is a link, the finger asked for the crosshair and not for the page behind it
const keepTap = (event: MouseEvent) => {
    if (!touched || candidates.value.length === 0) return;

    event.preventDefault();
    event.stopPropagation();
};

const leave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') clear();
};

// Geometry changes under a redraw or a resize, so whatever is shown is placed again from where it was asked
const replace = () => {
    if (pointer) trackAt(pointer, false);
    else if (point.value) place(point.value.index, null);
};

// A touch keeps the crosshair until the finger lands somewhere else, since there is no hover to end it
useEventListener(document, 'pointerdown', (event: PointerEvent) => {
    if (point.value && event.target instanceof Node && !box.value?.parentElement?.contains(event.target)) clear();
});

watch(
    () => props.focusIndex,
    (index) => {
        if (index === null || index === undefined) {
            if (!pointer) point.value = null;
        } else place(index, null);
    },
);

// The focused series fades the others through the option, so a change of series redraws once and a move along it never does
watch(focused, () => draw());

// Clicking a bar returns its name, which the dashboard turns into a filter
const listen = () =>
    chart?.on('click', (event: { name?: string }) => {
        if (event.name) emit('select', event.name);
    });

// ECharts picks the palette at creation, so light to dark needs a new instance
let dark = false;

const rebuild = () => {
    if (dark === isDark()) return;

    dark = isDark();
    chart?.dispose();
    chart = null;
    // A fresh instance has no old value to move from, so the stored shape is the discarded one
    drawnShape = null;
    draw();
    listen();
    replace();
};

onMounted(() => {
    dark = isDark();
    draw();
    listen();

    // The surrounding grid sometimes settles its width after this tick, and without this the chart is born too small
    requestAnimationFrame(() => chart?.resize());
});

watch(
    () => props.option,
    () => {
        draw();
        replace();
    },
    { deep: true },
);
watch(width, () => {
    chart?.resize();
    replace();
});

// The document class is what reports a theme change, from the menu, another tab or the system
useMutationObserver(document.documentElement, rebuild, { attributes: true, attributeFilter: ['class'] });

onBeforeUnmount(() => {
    chart?.dispose();
    chart = null;
});
</script>

<template>
    <!-- The drawing sits outside the flow, a canvas in flow becomes the floor of the card width and never shrinks -->
    <div
        class="relative w-full"
        :class="candidates.length ? 'touch-pan-y' : ''"
        :style="{ height: props.height ?? '18rem' }"
        @pointermove="track"
        @pointerdown="track"
        @pointerleave="leave"
        @click="keepTap"
    >
        <div ref="box" class="absolute inset-0" />
        <ChartCrosshair v-if="point" :point="point" />
    </div>
</template>
