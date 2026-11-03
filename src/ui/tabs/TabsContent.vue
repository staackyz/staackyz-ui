<script setup lang="ts">
import { TabsContent, useForwardProps, type TabsContentProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<TabsContentProps & { class?: HTMLAttributes['class'] }>();

// Class is stripped before forwarding because a declared prop that is not forwarded disappears silently
const forwarded = useForwardProps(
    computed(() => {
        const { class: _class, ...rest } = props;

        return rest;
    }),
);
</script>

<!-- The panel enters on every tab switch, it is new content where the eye already is -->
<template>
    <TabsContent v-bind="forwarded" :class="cn('mov-entra pt-4 focus-visible:outline-none', props.class)">
        <slot />
    </TabsContent>
</template>
