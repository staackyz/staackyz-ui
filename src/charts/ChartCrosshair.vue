<script setup lang="ts">
import { computed } from 'vue';
import { useUi } from '../lib/config';

export interface CrosshairPoint {
    x: number;
    y: number;
    index: number;
    series: number;
    color: string;
    name: string;
    value: string;
    expected: string | null;
    label: string;
    grid: { x: number; y: number; width: number; height: number };
    width: number;
}

// Drawn in HTML over the canvas so the theme tokens paint it and a test can read it
const props = defineProps<{ point: CrosshairPoint }>();

const { labels } = useUi();

// Near an edge the chip leans inward instead of hanging out of the card
const xChipShift = computed(() => {
    const { x, width } = props.point;

    if (x < 48) return '0%';
    if (x > width - 48) return '-100%';

    return '-50%';
});

const tooltipLeft = computed(() => props.point.x > props.point.width / 2);
const tooltipY = computed(() => Math.min(Math.max(props.point.y, props.point.grid.y + 24), props.point.grid.y + props.point.grid.height - 24));
</script>

<template>
    <div class="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true" data-chart-crosshair :data-index="point.index">
        <div
            class="crosshair-move absolute left-0 w-px bg-foreground/35"
            :style="{ top: `${point.grid.y}px`, height: `${point.grid.height}px`, transform: `translateX(${point.x}px)` }"
            data-crosshair-x
        />
        <div
            class="crosshair-move absolute top-0 h-px bg-foreground/35"
            :style="{ left: `${point.grid.x}px`, width: `${point.grid.width}px`, transform: `translateY(${point.y}px)` }"
            data-crosshair-y
        />

        <span
            class="crosshair-move absolute left-0 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-2xs font-semibold leading-none text-background"
            :style="{ top: `${point.grid.y + point.grid.height + 4}px`, transform: `translateX(${point.x}px) translateX(${xChipShift})` }"
            data-crosshair-x-label
            >{{ point.label }}</span
        >
        <span
            class="crosshair-move absolute top-0 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-2xs font-semibold tabular-nums leading-none text-background"
            :style="{ right: `calc(100% - ${point.grid.x - 4}px)`, transform: `translateY(${point.y}px) translateY(-50%)` }"
            data-crosshair-y-label
            >{{ point.value }}</span
        >

        <span
            class="crosshair-move absolute left-0 top-0 -ml-[6px] -mt-[6px] h-3 w-3 rounded-full ring-2 ring-card"
            :style="{ backgroundColor: point.color, transform: `translate(${point.x}px, ${point.y}px)` }"
            :data-series="point.series"
            data-crosshair-marker
        />

        <div
            class="crosshair-move elevation-float-sm absolute left-0 top-0 flex flex-col gap-0.5 whitespace-nowrap rounded-md border bg-popover px-2 py-1.5 text-xs text-popover-foreground"
            :style="{
                transform: tooltipLeft
                    ? `translate(${point.x - 14}px, ${tooltipY}px) translate(-100%, -50%)`
                    : `translate(${point.x + 14}px, ${tooltipY}px) translate(0, -50%)`,
            }"
            data-crosshair-tooltip
        >
            <span class="text-2xs text-muted-foreground">{{ point.label }}</span>
            <span class="flex items-center gap-1.5">
                <span class="h-0.5 w-3 shrink-0 rounded-full" :style="{ backgroundColor: point.color }" />
                <b class="tabular-nums" data-crosshair-value>{{ point.value }}</b>
                <span v-if="point.name" class="text-muted-foreground" data-crosshair-name>{{ point.name }}</span>
            </span>
            <span v-if="point.expected !== null" class="flex items-center gap-1.5 text-muted-foreground" data-crosshair-expected>
                <svg class="h-0.5 w-3 shrink-0" viewBox="0 0 12 2" preserveAspectRatio="none">
                    <line x1="0" y1="1" x2="12" y2="1" :stroke="point.color" stroke-width="2" stroke-dasharray="3 2" />
                </svg>
                <span class="tabular-nums">{{ labels.expected(point.expected) }}</span>
            </span>
        </div>
    </div>
</template>

<style scoped>
/* Only transform moves, so following the pointer never recalculates the page */
.crosshair-move {
    transition: transform var(--mov-curto) var(--mov-chegada);
}

@media (prefers-reduced-motion: reduce) {
    .crosshair-move {
        transition: none;
    }
}
</style>
