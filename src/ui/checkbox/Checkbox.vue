<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits, type CheckboxRootEmits, type CheckboxRootProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <!-- mov-toque gives the box its colour change and the press, the check only fades since scale at 14px reads as a wobble -->
    <CheckboxRoot
        v-bind="forwarded"
        :class="
            cn(
                'mov-toque peer size-5 shrink-0 rounded-sm border border-input focus-visible:border-input-focus focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:focus-visible:bg-primary/80',
                props.class,
            )
        "
    >
        <CheckboxIndicator class="mov-entra-leve flex h-full w-full items-center justify-center text-current">
            <slot>
                <Check class="size-3.5 stroke-[3]" />
            </slot>
        </CheckboxIndicator>
    </CheckboxRoot>
</template>
