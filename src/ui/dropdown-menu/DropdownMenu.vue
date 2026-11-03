<script setup lang="ts">
import { DropdownMenuRoot, useForwardPropsEmits, type DropdownMenuRootEmits, type DropdownMenuRootProps } from 'reka-ui';

// Not modal by default, a modal menu locks the page scroll and hides the scrollbar while it is open
const props = withDefaults(defineProps<DropdownMenuRootProps>(), { modal: false });
const emits = defineEmits<DropdownMenuRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
    <DropdownMenuRoot v-bind="forwarded">
        <slot />
    </DropdownMenuRoot>
</template>
