<script setup lang="ts">
import { fromInnerControl } from '../lib/innerControl';

// One line per item, the whole row opens it and every action lives in the menu at the end
const props = defineProps<{
    /** What the screen reader announces for the row, usually the code and the name */
    label: string;
}>();

const emit = defineEmits<{ open: [event: MouseEvent | KeyboardEvent] }>();

const onClick = (event: MouseEvent) => {
    if (!fromInnerControl(event)) emit('open', event);
};
</script>

<template>
    <!-- data-selectable lets the row carry the mark of the item the person came back from -->
    <div data-selectable class="group flex min-w-0 cursor-pointer items-center gap-1 transition-colors hover:bg-accent/50" @click="onClick($event)">
        <!-- A control that belongs before the row, like the tree arrow, stops its own click -->
        <slot name="before" />

        <!-- No press shrink anywhere on a row, anything that shrinks slides the controls inside it out from under the pointer -->
        <div
            role="button"
            tabindex="0"
            data-opens-item
            :aria-label="props.label"
            class="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 rounded-md py-2 focus-visible:bg-accent focus-visible:outline-none sm:flex-nowrap"
            @keydown.enter.self.prevent="emit('open', $event)"
            @keydown.space.self.prevent="emit('open', $event)"
        >
            <slot />
        </div>

        <!-- The menu is its own Tab stop, and neither its click nor its keys reach the row -->
        <div v-if="$slots.menu" class="flex shrink-0 items-center" @click.stop @keydown.stop>
            <slot name="menu" />
        </div>
    </div>
</template>
