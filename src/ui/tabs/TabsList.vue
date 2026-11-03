<script setup lang="ts">
import { TabsList, useForwardProps, type TabsListProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>();

// A declared prop that is never forwarded disappears silently, so everything but `class` goes through
const forwarded = useForwardProps(
    computed(() => {
        const { class: _class, ...rest } = props;

        return rest;
    }),
);
</script>

<!-- The bar is capped and scrolls sideways with no visible bar, a tab never wraps to a second line -->
<template>
    <TabsList
        v-bind="forwarded"
        :class="
            cn('inline-flex max-w-full items-center gap-1 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', props.class)
        "
    >
        <slot />
    </TabsList>
</template>
