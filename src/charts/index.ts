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

/** ECharts only reaches the bundle of a screen that draws a chart, so the canvas is always async */
export const ChartCanvas = defineAsyncComponent(() => import('./ChartCanvas.vue'));
