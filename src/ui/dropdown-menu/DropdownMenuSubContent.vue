<script setup lang="ts">
import { DropdownMenuSubContent, useForwardPropsEmits, type DropdownMenuSubContentEmits, type DropdownMenuSubContentProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';
import { radixPopIn } from '../radixMotion';

const props = defineProps<DropdownMenuSubContentProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DropdownMenuSubContentEmits>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <DropdownMenuSubContent
        v-bind="forwarded"
        :class="
            cn(
                'elevation-float-sm z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground',
                'origin-[var(--reka-dropdown-menu-content-transform-origin)]',
                radixPopIn,
                props.class,
            )
        "
    >
        <slot />
    </DropdownMenuSubContent>
</template>
