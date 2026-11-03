<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

// mov-esqueleto is baked in, its sweep replaces animate-pulse and stops under reduced motion
interface SkeletonProps {
    class?: HTMLAttributes['class'];
}

const props = defineProps<SkeletonProps>();
</script>

<template>
    <div :class="cn('mov-esqueleto rounded-md bg-muted', props.class)" />
</template>
