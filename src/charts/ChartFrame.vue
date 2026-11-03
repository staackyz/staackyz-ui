<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { computed, defineAsyncComponent, ref } from 'vue';
import Skeleton from '../ui/skeleton/Skeleton.vue';

// ECharts is fetched only when the card nears the viewport, a chart scrolled out of sight costs nothing
const props = defineProps<{
    option: Record<string, unknown>;
    // Also the height of the placeholder, which is what keeps the page from jumping
    height?: string;
    focusIndex?: number | null;
    formatNumber?: (value: number, decimals?: number) => string;
}>();

const emit = defineEmits<{ (e: 'select', name: string): void; (e: 'point', index: number): void }>();

const ChartCanvas = defineAsyncComponent(() => import('./ChartCanvas.vue'));

const height = computed(() => props.height ?? '18rem');

const frame = ref<HTMLElement | null>(null);

const wanted = ref(false);

const drawn = ref(false);

// 128px is enough lead time to be ready on entry without dragging in what is a full scroll below
const { stop, isSupported } = useIntersectionObserver(
    frame,
    ([entry]) => {
        if (!entry?.isIntersecting) return;

        wanted.value = true;
        stop();
    },
    { rootMargin: '128px' },
);

// Without IntersectionObserver the browser falls back to loading everything at once, never to no chart
if (!isSupported.value) wanted.value = true;
</script>

<template>
    <div ref="frame" class="relative w-full" :style="{ height }">
        <!-- Out of flow on purpose, so this appearing and leaving never resizes anything -->
        <Skeleton v-if="!drawn" class="absolute inset-0" aria-hidden="true" />

        <Transition name="mov-chega">
            <ChartCanvas
                v-if="wanted"
                :option="props.option"
                :height="height"
                :focus-index="props.focusIndex"
                :format-number="props.formatNumber"
                @select="(name: string) => emit('select', name)"
                @point="(index: number) => emit('point', index)"
                @vue:mounted="drawn = true"
            />
        </Transition>
    </div>
</template>
