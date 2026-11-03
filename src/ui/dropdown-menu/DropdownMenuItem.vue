<script setup lang="ts">
import { DropdownMenuItem, useForwardProps, type DropdownMenuItemProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<DropdownMenuItemProps & { class?: HTMLAttributes['class']; inset?: boolean }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <DropdownMenuItem
        v-bind="forwardedProps"
        :class="
            cn(
                // `mov-toque` replaces `transition-colors` and gives back the colors it drops
                // Radix focuses the row under the mouse too, so focus and hover share one fill and never a ring
                'mov-toque relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
                inset && 'pl-8',
                props.class,
            )
        "
    >
        <slot />
    </DropdownMenuItem>
</template>
