<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import {
    DropdownMenuCheckboxItem,
    DropdownMenuItemIndicator,
    useForwardPropsEmits,
    type DropdownMenuCheckboxItemEmits,
    type DropdownMenuCheckboxItemProps,
} from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<DropdownMenuCheckboxItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DropdownMenuCheckboxItemEmits>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <DropdownMenuCheckboxItem
        v-bind="forwarded"
        :class="
            cn(
                // Radix focuses the row under the mouse too, so focus and hover share one fill and never a ring
                'mov-toque relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                props.class,
            )
        "
    >
        <!-- The check fades in, checking and unchecking is what the row exists for -->
        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <DropdownMenuItemIndicator class="mov-entra-leve">
                <Check class="h-4 w-4" />
            </DropdownMenuItemIndicator>
        </span>
        <slot />
    </DropdownMenuCheckboxItem>
</template>
