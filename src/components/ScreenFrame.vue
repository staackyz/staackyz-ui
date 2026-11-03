<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../lib/utils';

// The frame owns the height of the screen, the header stays put and whatever scrolls lives in the body
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <div :class="cn('screen-frame flex min-h-0 flex-1 flex-col gap-4 p-[var(--screen-pad)]', props.class)">
        <!-- data-screen-header is the screen suite hook that checks this stays put after the list scrolls -->
        <div v-if="$slots.header" data-screen-header class="flex shrink-0 flex-col gap-3">
            <slot name="header" />
        </div>

        <!-- What is left of the screen, and whatever scrolls lives in here -->
        <div class="flex min-h-0 flex-1 flex-col">
            <slot />
        </div>
    </div>
</template>

<style>
/* The main that holds a frame takes the height left by the bars, so the frame scrolls inside and the page never does */
main:has(.screen-frame) {
    height: calc(100svh - var(--topbar-h) - var(--bottomnav-h));
    /* The height already gave the bar its strip, keeping the shell's padding too would subtract it twice */
    padding-bottom: 0;
}

/* The scroll region reaches the screen edge, so the hidden bar and the padding never cut a row */
.screen-scroll {
    margin-bottom: calc(var(--screen-pad) * -1);
    padding-bottom: var(--screen-pad);

    /* Room above and beside the first row for what a control draws outside itself, the scroller clips at its own edge, and the negative margin keeps every pixel where it was */
    margin-top: -0.25rem;
    padding-top: 0.25rem;
    margin-left: -0.25rem;
    padding-left: 0.25rem;
}

/* The bar is hidden by the shared scrollbar rule in base.css, so the padding is the whole frame pad and the content stays centred */
@media (min-width: 768px) {
    .screen-scroll {
        margin-right: calc(var(--screen-pad) * -1);
        padding-right: var(--screen-pad);
    }
}
</style>
