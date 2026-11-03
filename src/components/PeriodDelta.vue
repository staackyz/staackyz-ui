<script setup lang="ts">
import { computed } from 'vue';

export type DeltaDirection = 'up' | 'down' | 'same';

export interface DeltaWords {
    direction: DeltaDirection;
    /** The size of the change, never signed, the direction carries the sign */
    count: number;
    days: number;
}

/**
 * How a number moved against the period of equal length right before. The colour follows what the number means and
 * not the arrow, overdue going up is bad, finished going up is good, and a count with no side stays neutral
 */
const props = withDefaults(
    defineProps<{
        current: number;
        /** undefined while the comparison is on its way, null where there is none */
        previous: number | null | undefined;
        days: number | null | undefined;
        sense?: 'up_good' | 'up_bad' | 'neutral';
        /** The short form on the card, like a triangle, the count and the period */
        short: (words: DeltaWords) => string;
        /** The whole sentence for the tooltip and for screen readers */
        sentence: (words: DeltaWords) => string;
    }>(),
    { sense: 'neutral' },
);

const delta = computed(() => {
    if (props.previous === null || props.previous === undefined || !props.days) return null;

    const change = props.current - props.previous;
    const direction: DeltaDirection = change === 0 ? 'same' : change > 0 ? 'up' : 'down';
    const words: DeltaWords = { direction, count: Math.abs(change), days: props.days };
    const text = { text: props.short(words), sentence: props.sentence(words), direction };

    if (change === 0) return { ...text, tone: 'text-muted-foreground' };

    const better = props.sense === 'neutral' ? null : change > 0 === (props.sense === 'up_good');

    return { ...text, tone: better === null ? 'text-muted-foreground' : better ? 'text-success-strong' : 'text-destructive-strong' };
});
</script>

<template>
    <!-- The line keeps its height while the comparison is on its way, so nothing under the cards moves when it lands -->
    <p
        class="mt-1 min-h-4 truncate text-xs font-semibold leading-4"
        :class="delta?.tone"
        :data-period-delta="delta?.direction"
        :title="delta?.sentence"
    >
        <Transition name="mov-chega">
            <span v-if="delta"
                ><span aria-hidden="true">{{ delta.text }}</span
                ><span class="sr-only">{{ delta.sentence }}</span></span
            >
        </Transition>
    </p>
</template>
