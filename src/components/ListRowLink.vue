<script setup lang="ts">
const props = defineProps<{ href: string }>();

const emit = defineEmits<{ open: [] }>();

// A real href keeps ctrl+click, the middle button and copying the address, while a plain click opens the sheet over the list
const onClick = (event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;

    event.preventDefault();
    emit('open');
};
</script>

<template>
    <!-- Out of the Tab order because the row around it is already the stop that opens the same thing -->
    <a
        :href="props.href"
        tabindex="-1"
        data-opens-item
        class="shrink-0 font-mono text-xs font-bold text-primary hover:underline"
        @click.stop="onClick($event)"
    >
        <slot />
    </a>
</template>
