<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useUi } from '../lib/config';
import { cn } from '../lib/utils';
import { TooltipProvider } from '../ui/tooltip';

// The rail on the left the full height, then the top bar, the screen and an optional side panel that survives the screen swap
const props = defineProps<{ class?: HTMLAttributes['class'] }>();

const { labels } = useUi();

// Focus moves by hand so the address bar keeps no leftover hash
const skipToContent = () => {
    document.getElementById('main-content')?.focus();
};
</script>

<template>
    <TooltipProvider :delay-duration="0">
        <!-- --topbar-h tells sticky children where the top bar ends, and the clip keeps the content sliding beside the rail off the page width -->
        <div :class="cn('flex min-h-svh w-full overflow-x-clip bg-background text-foreground [--topbar-h:3.5rem]', props.class)">
            <!-- First focusable node of the document, otherwise reaching the screen costs the whole bar in tab stops on every swap -->
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
                @click.prevent="skipToContent"
            >
                {{ labels.skipToContent }}
            </a>
            <slot name="rail" />
            <!-- data-shell-content is what slides beside the rail while the column changes width -->
            <div data-shell-content class="flex min-w-0 flex-1 flex-col">
                <slot name="topbar" />
                <div class="flex w-full flex-1">
                    <slot />
                    <slot name="aside" />
                </div>
            </div>
            <slot name="bottom" />
        </div>
    </TooltipProvider>
</template>
