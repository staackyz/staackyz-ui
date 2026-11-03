<script setup lang="ts">
import { TabsTrigger, useForwardProps, type TabsTriggerProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] }>();

// A declared prop that is not forwarded disappears silently
const forwarded = useForwardProps(
    computed(() => {
        const { class: _class, ...rest } = props;

        return rest;
    }),
);
</script>

<!-- mov-toque gives back the colours it drops, so transition-colors leaves instead of living beside it -->
<template>
    <TabsTrigger
        v-bind="forwarded"
        :class="
            cn(
                // Focus takes the hover fill and text, never a ring
                'ui-label mov-toque -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-primary',
                props.class,
            )
        "
    >
        <slot />
    </TabsTrigger>
</template>
