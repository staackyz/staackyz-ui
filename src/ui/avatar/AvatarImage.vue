<script setup lang="ts">
import { AvatarImage, type AvatarImageProps } from 'reka-ui';

const props = defineProps<AvatarImageProps>();
</script>

<template>
    <!-- Opacity only, since growing a small round avatar reads as a wobble -->
    <AvatarImage v-bind="props" class="mov-entra-leve h-full w-full object-cover" />
</template>
