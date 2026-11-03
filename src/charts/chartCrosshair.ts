// The crosshair every line chart shares, decided from the option alone

type Option = Record<string, unknown>;

interface Series {
    type?: string;
    id?: string;
    name?: string;
    silent?: boolean;
    data?: unknown[];
    lineStyle?: Record<string, unknown>;
    itemStyle?: Record<string, unknown>;
    areaStyle?: Record<string, unknown>;
    [key: string]: unknown;
}

/** The dashed companion of a series is found by this id, so the tooltip can show both */
export const EXPECTED_SUFFIX = ':expected';

export const expectedIdOf = (id: string) => `${id}${EXPECTED_SUFFIX}`;

/** How much the series away from the pointer fade, slight on purpose so they stay readable */
export const DIM = 0.5;

const list = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]) as T[];

const seriesOf = (option: Option) => list<Series>(option.series);

/** The series the pointer can land on, empty when the chart is not a line chart over one category axis */
export const crosshairSeries = (option: Option): number[] => {
    const xAxes = list<{ type?: string }>(option.xAxis);
    const yAxes = list(option.yAxis);
    const tooltip = option.tooltip as { show?: boolean } | undefined;

    if (xAxes.length !== 1 || xAxes[0]?.type !== 'category' || yAxes.length > 1 || tooltip?.show === false) return [];

    const series = seriesOf(option);

    if (!series.some((serie) => serie.type === 'line' && !serie.silent)) return [];

    return series.flatMap((serie, index) => ((serie.type === 'line' || serie.type === 'bar') && !serie.silent ? [index] : []));
};

/** The raw value of a point, null when there is none to show */
export const valueAt = (serie: Series | undefined, index: number): number | null => {
    let raw = serie?.data?.[index];

    if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) raw = (raw as { value?: unknown }).value;
    if (Array.isArray(raw)) raw = raw[raw.length - 1];

    const value = typeof raw === 'string' ? Number(raw) : raw;

    return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

/** The dashed expectation drawn for a series, if the screen gave it one */
export const companionOf = (option: Option, seriesIndex: number): number | null => {
    const series = seriesOf(option);
    const id = series[seriesIndex]?.id;

    if (!id) return null;

    const found = series.findIndex((serie) => serie.id === expectedIdOf(id));

    return found < 0 ? null : found;
};

/** The point closest to the pointer by vertical distance, so the reader only has to be nearest, never on the line */
export const nearest = (points: { series: number; y: number }[], pointerY: number): number | null => {
    let best: { series: number; distance: number } | null = null;

    for (const point of points) {
        const distance = Math.abs(point.y - pointerY);

        if (!best || distance < best.distance) best = { series: point.series, distance };
    }

    return best?.series ?? null;
};

const faded = (style: Record<string, unknown> | undefined, factor: number, fallback: number) => ({
    ...style,
    opacity: (typeof style?.opacity === 'number' ? style.opacity : fallback) * factor,
});

/**
 * The option as drawn under a crosshair, the ECharts tooltip and hover state give way to the shared overlay, and
 * every series but the focused one and its expectation fades. Opacities are always written, since a merge keeps
 * the faded value of a key the plain option leaves out.
 */
export const withCrosshair = (option: Option, focus: number | null): Option => {
    const candidates = crosshairSeries(option);

    if (candidates.length === 0) return option;

    const companion = focus === null ? null : companionOf(option, focus);
    const touched = new Set(candidates.flatMap((index) => [index, companionOf(option, index)].filter((i): i is number => i !== null)));

    const series = seriesOf(option).map((serie, index) => {
        if (!touched.has(index)) return serie;

        const factor = focus === null || index === focus || index === companion ? 1 : DIM;

        return {
            ...serie,
            emphasis: { ...(serie.emphasis as Record<string, unknown> | undefined), disabled: true },
            lineStyle: faded(serie.lineStyle, factor, 1),
            itemStyle: faded(serie.itemStyle, factor, 1),
            ...(serie.areaStyle ? { areaStyle: faded(serie.areaStyle, factor, 0.7) } : {}),
        };
    });

    return { ...option, tooltip: { ...(option.tooltip as Option | undefined), show: false }, series };
};

/** The value as the screen already writes it on the series tooltip, the chart tooltip or its axis, else as a plain number */
export const formatValue = (option: Option, value: number, plain: (amount: number) => string, seriesIndex?: number): string => {
    const own =
        seriesIndex === undefined ? undefined : (seriesOf(option)[seriesIndex]?.tooltip as { valueFormatter?: unknown } | undefined)?.valueFormatter;
    const formatter = own ?? (option.tooltip as { valueFormatter?: unknown } | undefined)?.valueFormatter;

    if (typeof formatter === 'function') return String(formatter(value));

    const axisLabel = (list<{ axisLabel?: { formatter?: unknown } }>(option.yAxis)[0] ?? {}).axisLabel?.formatter;

    if (typeof axisLabel === 'string' && axisLabel.includes('{value}')) return axisLabel.replace('{value}', plain(value));

    return plain(value);
};

/** The category written under the vertical guide */
export const categoryAt = (option: Option, index: number): string => {
    const data = list<{ data?: unknown[] }>(option.xAxis)[0]?.data ?? [];
    const label = data[index];

    return label !== null && typeof label === 'object' ? String((label as { value?: unknown }).value ?? '') : String(label ?? '');
};
