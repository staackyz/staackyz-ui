<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuPortal, useForwardPropsEmits, type DropdownMenuContentEmits, type DropdownMenuContentProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';
import { radixPopIn } from '../radixMotion';

const props = withDefaults(defineProps<DropdownMenuContentProps & { class?: HTMLAttributes['class'] }>(), {
    sideOffset: 4,
});
const emits = defineEmits<DropdownMenuContentEmits>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <DropdownMenuPortal>
        <DropdownMenuContent
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
        </DropdownMenuContent>
    </DropdownMenuPortal>
</template>
