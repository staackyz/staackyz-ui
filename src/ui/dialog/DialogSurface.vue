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
    type PointerDownOutsideEvent,
} from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { useUi } from '../../lib/config';
import { cn } from '../../lib/utils';
import { radixOverlay, radixPopIn } from '../radixMotion';

const props = withDefaults(defineProps<DialogContentProps & { class?: HTMLAttributes['class']; scrollable?: boolean }>(), {
    scrollable: false,
});
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
    const { class: _, scrollable: __, ...delegated } = props;

    return delegated;
});
const forwarded = useForwardPropsEmits(delegatedProps, emits);

const { labels } = useUi();

const overlayClass = computed(() => cn('fixed inset-0 z-50 bg-black/80', props.scrollable && 'grid place-items-center overflow-y-auto'));
const contentClass = computed(() =>
    cn(
        props.scrollable
            ? 'elevation-float relative z-50 my-8 grid w-full max-w-lg gap-4 border bg-popover p-6 sm:rounded-lg md:w-full dark:bg-background'
            : 'elevation-float fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-popover p-6 sm:rounded-lg dark:bg-background',
        !props.scrollable &&
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        radixPopIn,
        props.class,
    ),
);

const protectScrollbar = (event: PointerDownOutsideEvent) => {
    if (!props.scrollable) return;

    const originalEvent = event.detail.originalEvent;
    const target = originalEvent.target;
    if (!(target instanceof HTMLElement)) return;
    if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) event.preventDefault();
};
</script>

<template>
    <DialogPortal>
        <DialogOverlay :class="cn(overlayClass, radixOverlay)">
            <DialogContent v-bind="forwarded" :class="contentClass" @pointer-down-outside="protectScrollbar">
                <slot />

                <DialogClose
                    :class="
                        props.scrollable
                            ? 'mov-toque group absolute right-3 top-3 rounded-md p-0.5 hover:bg-secondary'
                            : 'mov-toque group absolute right-4 top-4 rounded-sm focus:outline-none focus-visible:bg-accent disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
                    "
                >
                    <X :class="cn('mov-icone h-4 w-4', !props.scrollable && 'opacity-70 group-hover:opacity-100')" />
                    <span class="sr-only">{{ labels.close }}</span>
                </DialogClose>
            </DialogContent>
        </DialogOverlay>
    </DialogPortal>
</template>
