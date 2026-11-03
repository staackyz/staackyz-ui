<script setup lang="ts">
import type { Component } from 'vue';

// Every screen header is drawn here, so changing the title's size is one file
defineProps<{
    // Only for a name the top bar does not already show, like an indicator opened from the dashboard
    title?: string;
    icon?: Component;
}>();
</script>

<template>
    <!-- On the phone the title and its gap scale with the width, continuously, and the desktop keeps its fixed sizes -->
    <div class="flex flex-wrap items-start justify-between gap-[clamp(0.5rem,2.5vw,0.75rem)] md:gap-3">
        <div class="min-w-0">
            <!-- mov-texto reveals the title in place instead of rising, and only the icon answers the pointer -->
            <h2
                v-if="title"
                class="ui-label mov-texto group flex items-center gap-2 text-[clamp(1.0625rem,4.8vw,1.25rem)] font-extrabold tracking-tight md:text-xl"
                style="--mov-i: 0"
            >
                <component :is="icon" v-if="icon" class="mov-icone h-5 w-5 text-primary" />
                {{ title }}
            </h2>
        </div>

        <!-- The create button lives here, never as a floating round button -->
        <div v-if="$slots.actions" class="ml-auto flex flex-wrap items-center gap-2">
            <slot name="actions" />
        </div>
    </div>
</template>
