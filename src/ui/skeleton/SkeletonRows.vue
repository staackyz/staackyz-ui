<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';
import Skeleton from './Skeleton.vue';

/**
 * The stack of identical bars that six screens were writing by hand, with the geometry made impossible to drift.
 *
 * `row` is the class the REAL row already carries. Passing the same class to both is the whole point, the
 * reserved space and the content that replaces it read their height from one place, so the screen cannot
 * jump when the data lands. A skeleton drawn at a height nobody measured is a layout shift with a nicer look
 */
interface SkeletonRowsProps {
    /** How many bars, which should be about what the screen usually shows above the fold */
    rows?: number;
    /** The size classes the real row uses, height included */
    row?: HTMLAttributes['class'];
    class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SkeletonRowsProps>(), {
    rows: 6,
    row: 'h-10 rounded-lg',
});
</script>

<template>
    <div :class="cn('flex flex-col gap-3', props.class)" aria-hidden="true">
        <Skeleton v-for="i in props.rows" :key="i" :class="props.row" />
    </div>
</template>
