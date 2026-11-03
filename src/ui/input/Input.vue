<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { ref, type HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<{
    defaultValue?: string | number;
    modelValue?: string | number;
    class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
    (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: props.defaultValue,
});

const el = ref<HTMLInputElement | null>(null);

// Callers hold the component proxy, not the element, so the focus has to be handed out
defineExpose({
    focus: () => el.value?.focus(),
});
</script>

<template>
    <input
        ref="el"
        v-model="modelValue"
        :class="
            cn(
                'flex h-10 w-full rounded-md border border-input bg-field px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-input-focus focus-visible:bg-field-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                props.class,
            )
        "
    />
</template>
