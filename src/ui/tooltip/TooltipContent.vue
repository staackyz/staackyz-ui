<script setup lang="ts">
import { TooltipContent, TooltipPortal, useForwardPropsEmits, type TooltipContentEmits, type TooltipContentProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';
import { radixTooltipPopIn } from '../radixMotion';

defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(defineProps<TooltipContentProps & { class?: HTMLAttributes['class'] }>(), {
    sideOffset: 4,
});

const emits = defineEmits<TooltipContentEmits>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <TooltipPortal>
        <TooltipContent
            v-bind="{ ...forwarded, ...$attrs }"
            :class="
                cn(
                    'elevation-float-sm z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground',
                    'origin-[var(--reka-tooltip-content-transform-origin)]',
                    radixTooltipPopIn,
                    props.class,
                )
            "
        >
            <slot />
        </TooltipContent>
    </TooltipPortal>
</template>
