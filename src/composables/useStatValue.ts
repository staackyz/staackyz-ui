import { computed } from 'vue';
import { useCountUp } from './useCountUp';

export interface StatValueProps {
    value: string | number;
    /** Last thirty days, a hole in the series is a day with no data and not a zero */
    spark?: (number | null)[] | null;
    /** The screen passes the raw number plus a formatter, a ready made string falls out of the count */
    format?: (value: number) => string;
    /** Money is 2, counting in whole units would show the cents only on the last frame */
    decimals?: number;
}

// Scales by the series own maximum, the spark tells the shape of the month and not the magnitude
const sparkPath = (points: (number | null)[] | null | undefined): string => {
    if (!points || points.length < 2) return '';

    const known = points.filter((point): point is number => point !== null);

    if (!known.length) return '';

    const top = Math.max(...known, 1);
    const step = 100 / (points.length - 1);

    return points
        .map((point, index) => {
            const y = 28 - ((point ?? 0) / top) * 24 - 2;

            return `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
};

// Scale by length and not by kind of data, currency changes width on its own between locales
const scaleForLength = (length: number): string => {
    if (length <= 6) return 'text-3xl';
    if (length <= 9) return 'text-2xl';
    if (length <= 13) return 'text-xl';

    return 'text-lg';
};

// The formatting decision chain a StatCard runs on its way from a raw prop to a rendered number
export function useStatValue(props: StatValueProps) {
    const path = computed(() => sparkPath(props.spark));

    // Only counts when the screen sends the raw number, taking a formatted currency apart would guess separators of three locales
    const raw = computed(() => (typeof props.value === 'number' && Number.isFinite(props.value) ? props.value : null));

    const { text } = useCountUp(() => raw.value ?? 0, { decimals: props.decimals ?? 0, format: props.format });

    // The target text and not the counting one, otherwise the card rescales on every step of the count
    const finalText = computed(() => (raw.value === null ? String(props.value) : props.format ? props.format(raw.value) : String(raw.value)));

    const displayed = computed(() => (raw.value === null ? props.value : text.value));
    const valueClass = computed(() => scaleForLength(finalText.value.length));

    /** The spark gives up its place when the number needs it */
    const showSpark = computed(() => Boolean(path.value) && finalText.value.length <= 9);

    // Fixed while the number counts, otherwise counting would restart the node on every step
    const key = computed(() => (raw.value === null ? String(props.value) : 'counting'));

    return { path, finalText, displayed, valueClass, showSpark, key };
}
