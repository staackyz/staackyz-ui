<script setup lang="ts">
import { useStatValue } from '../composables/useStatValue';
import KpiFrame from './KpiFrame.vue';

// The spark is hand made SVG and not ECharts, twenty points with no axis do not pay for a chart library
const props = defineProps<{
    label: string;
    value: string | number;
    href?: string;
    /** The number's colour, only where the number itself asks for attention */
    tone?: string;
    /** Last thirty days, a hole in the series is a day with no data and not a zero */
    spark?: (number | null)[] | null;
    /** Spark colour in hex, to match the detail screen */
    sparkColor?: string;
    /** The screen passes the raw number plus a formatter, a ready made string falls out of the count */
    format?: (value: number) => string;
    /** Money is 2, counting in whole units would show the cents only on the last frame */
    decimals?: number;
    money?: boolean;
}>();

const { path, finalText, displayed, valueClass, showSpark, key } = useStatValue(props);
</script>

<template>
    <KpiFrame
        :label="props.label"
        :href="props.href"
        :value-class="[valueClass, props.tone ?? ''].join(' ')"
        :money="props.money"
        :swap-key="key"
        :title="finalText"
    >
        {{ displayed }}
        <template #aside>
            <!-- The spark only shows where width allows, on a phone it would fight the number -->
            <svg v-if="showSpark" class="mb-1 hidden h-7 w-16 shrink-0 sm:block" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
                <path :d="path" fill="none" :stroke="props.sparkColor ?? 'currentColor'" stroke-width="1.5" vector-effect="non-scaling-stroke" />
            </svg>
        </template>
        <template v-if="$slots.note" #note><slot name="note" /></template>
    </KpiFrame>
</template>
