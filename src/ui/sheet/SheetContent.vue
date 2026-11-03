<script setup lang="ts">
import { X } from 'lucide-vue-next';
import {
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    useForwardPropsEmits,
    type DialogContentEmits,
    type DialogContentProps,
} from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { sheetVariants, type SheetVariants } from '.';
import { useUi } from '../../lib/config';
import { cn } from '../../lib/utils';
import { radixOverlay } from '../radixMotion';

interface SheetContentProps extends DialogContentProps {
    class?: HTMLAttributes['class'];
    side?: SheetVariants['side'];
}

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<SheetContentProps>();

const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
    const { class: _, side, ...delegated } = props;

    return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);

const { labels } = useUi();
</script>

<template>
    <DialogPortal>
        <DialogOverlay :class="cn('fixed inset-0 z-50 bg-black/80', radixOverlay)" />
        <DialogContent :class="cn(sheetVariants({ side }), props.class)" v-bind="{ ...forwarded, ...$attrs }">
            <slot />

            <DialogClose
                class="mov-toque group absolute right-4 top-4 rounded-sm focus:outline-none focus-visible:bg-accent disabled:pointer-events-none data-[state=open]:bg-secondary"
            >
                <X class="mov-icone h-4 w-4 text-muted-foreground opacity-70 group-hover:opacity-100" />
                <span class="sr-only">{{ labels.close }}</span>
            </DialogClose>
        </DialogContent>
    </DialogPortal>
</template>
