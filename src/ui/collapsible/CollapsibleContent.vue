<script setup lang="ts">
import { CollapsibleContent, type CollapsibleContentProps } from 'reka-ui';

// Keyframes and not the gaveta class, radix Presence unmounts on animationend and a transition never fires it
const props = defineProps<CollapsibleContentProps>();
</script>

<template>
    <CollapsibleContent v-bind="props" class="gaveta-radix">
        <div class="min-h-0 overflow-hidden">
            <slot />
        </div>
    </CollapsibleContent>
</template>

<style scoped>
.gaveta-radix {
    display: grid;
    grid-template-rows: 1fr;
}

/* Opacity lands before the height so the block reads as opened, not as appeared after the row grew */
.gaveta-radix[data-state='open'] {
    animation:
        gaveta-radix-abre var(--mov-medio) var(--mov-chegada) both,
        gaveta-radix-acende var(--mov-curto) var(--mov-chegada) both;
}

.gaveta-radix[data-state='closed'] {
    animation:
        gaveta-radix-fecha var(--mov-medio) var(--mov-chegada) both,
        gaveta-radix-apaga var(--mov-curto) var(--mov-chegada) both;
}

@keyframes gaveta-radix-abre {
    from {
        grid-template-rows: 0fr;
    }
}

@keyframes gaveta-radix-fecha {
    to {
        grid-template-rows: 0fr;
    }
}

@keyframes gaveta-radix-acende {
    from {
        opacity: 0;
    }
}

@keyframes gaveta-radix-apaga {
    to {
        opacity: 0;
    }
}

/* With no animation radix Presence unmounts at once, which is what we want here since the base rule is already the final state */
@media (prefers-reduced-motion: reduce) {
    .gaveta-radix[data-state='open'],
    .gaveta-radix[data-state='closed'] {
        animation: none;
    }
}
</style>
