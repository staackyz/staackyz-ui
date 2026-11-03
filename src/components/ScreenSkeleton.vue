<script setup lang="ts">
import { Skeleton } from '../ui/skeleton';

export type SkeletonShape = 'board' | 'list' | 'tiles';

// The destination drawn in outline while a slow click waits on it
defineProps<{ shape: SkeletonShape }>();
</script>

<template>
    <!-- Over the screen being left and never instead of it, so nothing is unmounted before the answer arrives -->
    <div
        class="absolute inset-0 z-10 flex flex-col gap-4 overflow-hidden bg-background p-[var(--screen-pad)]"
        data-screen-skeleton
        aria-hidden="true"
    >
        <div class="flex shrink-0 items-center gap-3">
            <Skeleton class="h-9 w-full max-w-xs rounded-lg" />
            <Skeleton class="ml-auto h-9 w-28 shrink-0 rounded-lg" />
        </div>

        <div v-if="shape === 'board'" class="flex min-h-0 flex-1 items-start gap-3">
            <div v-for="i in 4" :key="i" class="kanban-col flex shrink-0 flex-col gap-2 rounded-xl bg-muted/60 p-3 sm:w-80">
                <Skeleton class="h-5 w-24 rounded bg-background/70" />
                <Skeleton v-for="j in 4 - (i % 2)" :key="j" class="h-20 rounded-lg bg-card/80" />
            </div>
        </div>

        <div v-else-if="shape === 'tiles'" class="flex min-h-0 flex-1 flex-col gap-4">
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
            </div>
            <div class="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
                <Skeleton class="h-64 rounded-xl" />
                <Skeleton class="hidden h-64 rounded-xl lg:block" />
            </div>
        </div>

        <div v-else class="flex min-h-0 flex-1 flex-col gap-1 rounded-xl border bg-card p-2">
            <Skeleton v-for="i in 9" :key="i" class="h-12 rounded-lg bg-muted/60" />
        </div>
    </div>
</template>
