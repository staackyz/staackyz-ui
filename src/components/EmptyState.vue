<script setup lang="ts">
import type { Component } from 'vue';

/**
 * An empty list says what is missing and offers the next step, the thin icon of the subject, one sentence, and at most
 * one action in the slot. A bare grey line reads as a broken screen
 */
const props = withDefaults(
    defineProps<{
        icon?: Component;
        message: string;
        /** A board column or a table cell, where the full height would push the rest away */
        compact?: boolean;
    }>(),
    { icon: undefined, compact: false },
);
</script>

<template>
    <div class="flex flex-col items-center text-center" :class="props.compact ? 'gap-1.5 px-4 py-4' : 'gap-3 py-10'" data-empty-state>
        <component
            :is="props.icon"
            v-if="props.icon"
            class="text-muted-foreground/70"
            :class="props.compact ? 'h-5 w-5' : 'h-8 w-8'"
            :stroke-width="1.5"
            aria-hidden="true"
        />
        <p class="max-w-sm text-muted-foreground" :class="props.compact ? 'text-xs' : 'text-sm'">{{ props.message }}</p>
        <slot />
    </div>
</template>
