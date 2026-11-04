import { defineAsyncComponent } from 'vue';

export {
    categoryAt,
    companionOf,
    crosshairSeries,
    DIM,
    EXPECTED_SUFFIX,
    expectedIdOf,
    formatValue,
    nearest,
    valueAt,
    withCrosshair,
} from './chartCrosshair';
export { default as ChartFrame } from './ChartFrame.vue';
export { CHART_FONT, chartTheme } from './chartTheme';

/** Fetches the canvas ahead of time, for a screen that knows it will draw a chart before it does */
export const loadChartCanvas = () => import('./ChartCanvas.vue');

/** ECharts only reaches the bundle of a screen that draws a chart, so the canvas is always async */
export const ChartCanvas = defineAsyncComponent(loadChartCanvas);
