/**
 * The house theme for every ECharts drawing, built from the same tokens the rest of the screen paints with.
 * It only dresses text, lines and the tooltip, an option that names its own colour still wins
 */

// The palette ECharts' own dark theme used, kept so no series changes colour in the dark
const DARK_PALETTE = ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'];

export const CHART_FONT = "'Manrope Variable', ui-sans-serif, system-ui, sans-serif";

const token = (name: string, fallback: string): string => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    return value ? `hsl(${value})` : fallback;
};

const axis = (muted: string, border: string) => ({
    axisLine: { lineStyle: { color: border } },
    axisTick: { lineStyle: { color: border } },
    axisLabel: { color: muted, fontFamily: CHART_FONT },
    nameTextStyle: { color: muted, fontFamily: CHART_FONT },
    splitLine: { lineStyle: { color: [border] } },
});

/** Read on every build, so a theme switch registers the colours of the theme that is now on */
export function chartTheme(dark: boolean): Record<string, unknown> {
    const foreground = token('--foreground', dark ? '#fafafa' : '#0a0a0a');
    const muted = token('--muted-foreground', dark ? '#9ca3af' : '#5b6b80');
    const border = token('--border', dark ? '#1e293b' : '#d5dce8');
    const popover = token('--popover', dark ? '#121a2b' : '#f4f7fb');

    return {
        ...(dark ? { color: DARK_PALETTE } : {}),
        backgroundColor: 'transparent',
        textStyle: { fontFamily: CHART_FONT, color: muted },
        title: { textStyle: { color: foreground, fontFamily: CHART_FONT }, subtextStyle: { color: muted, fontFamily: CHART_FONT } },
        legend: { textStyle: { color: muted, fontFamily: CHART_FONT } },
        categoryAxis: axis(muted, border),
        valueAxis: axis(muted, border),
        timeAxis: axis(muted, border),
        logAxis: axis(muted, border),
        tooltip: {
            backgroundColor: popover,
            borderColor: border,
            borderWidth: 1,
            textStyle: { color: foreground, fontFamily: CHART_FONT },
            extraCssText: 'border-radius: 12px;',
        },
    };
}
