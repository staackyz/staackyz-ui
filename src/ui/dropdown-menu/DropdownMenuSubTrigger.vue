<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import { DropdownMenuSubTrigger, useForwardProps, type DropdownMenuSubTriggerProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <DropdownMenuSubTrigger
        v-bind="forwardedProps"
        :class="
            cn(
                // Radix focuses the row under the mouse too, so focus and hover share one fill and never a ring
                'mov-toque group flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
                props.class,
            )
        "
    >
        <slot />
        <!-- Only mov-icone, since pushing the arrow sideways would be a distance chosen here and distance has no sheet -->
        <ChevronRight class="mov-icone ml-auto h-4 w-4" />
    </DropdownMenuSubTrigger>
</template>
