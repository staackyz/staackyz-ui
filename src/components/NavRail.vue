<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen, Pin } from 'lucide-vue-next';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { RAIL_FULL_PX, RAIL_PX, useNavRail } from '../composables/useNavRail';
import { useUi } from '../lib/config';
import { railClock, reducedMotion } from '../lib/motion';
import type { ShellNav } from '../lib/nav';
import NavList from './NavList.vue';

// The rail from md up, widened over the content on hover and pinned beside it from lg up
const props = defineProps<{
    nav: ShellNav;
    currentPath: string;
    pending?: Record<string, number>;
    collapseKey?: string;
    currentHref?: string | null;
    /** Extra attributes on the pin button, for the app's own hooks like a guided tour step */
    controlAttrs?: Record<string, string>;
}>();

const { labels } = useUi();
const rail = useNavRail();

// Nothing to list is no rail at all, an empty column would only eat the width
const listsSomething = computed(() => props.nav.shortcuts.length > 0 || props.nav.groups.some((group) => group.items.length > 0));

// A short wait each way, so crossing the rail on the way to the screen neither opens it nor makes it blink
const PEEK_OPEN_DELAY = 140;
const PEEK_CLOSE_DELAY = 280;

const pointerInside = ref(false);
let timer: number | undefined;

const later = (action: () => void, delay: number) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(action, delay);
};

// Only a mouse peeks, a finger on a tablet taps an icon and goes there
const enter = (event: PointerEvent) => {
    // Chrome enters again when the node under the pointer is swapped, as the pin icon is on unpinning
    if (event.pointerType !== 'mouse' || pointerInside.value) return;

    pointerInside.value = true;
    if (!rail.expanded.value) later(() => (rail.peeking.value = true), PEEK_OPEN_DELAY);
};

const leave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;

    pointerInside.value = false;
    later(() => (rail.peeking.value = false), PEEK_CLOSE_DELAY);
};

onBeforeUnmount(() => window.clearTimeout(timer));

// While the pointer is over the rail its names are about to show, so a tooltip would only flash on the way
const tips = computed(() => !rail.open.value && !pointerInside.value);

// The column snaps to its new width in one layout and the content slides there on the GPU, in step with the clip of the panel
watch(
    rail.expanded,
    (wide, before) => {
        if (wide === before || reducedMotion()) return;

        const content = document.querySelector<HTMLElement>('[data-shell-content]');
        const from = wide ? RAIL_PX - RAIL_FULL_PX : RAIL_FULL_PX - RAIL_PX;

        content?.animate([{ transform: `translateX(${from}px)` }, { transform: 'none' }], railClock(wide));
    },
    { flush: 'post' },
);

const pinLabel = computed(() => {
    if (rail.expanded.value) return labels.value.railCollapse;

    return rail.peeking.value ? labels.value.railPin : labels.value.railExpand;
});

const pinIcon = computed(() => (rail.expanded.value ? PanelLeftClose : rail.peeking.value ? Pin : PanelLeftOpen));
</script>

<template>
    <!-- The column takes the room in the row and snaps once, the panel above it opens by its clip, never by its width -->
    <div
        v-if="listsSomething"
        class="relative hidden shrink-0 [--rail-full:16rem] [--rail-w:4rem] md:block"
        :class="rail.expanded.value ? 'w-[var(--rail-full)]' : 'w-[var(--rail-w)]'"
        data-nav-rail-column
    >
        <aside
            id="nav-rail"
            data-nav-rail
            :data-expanded="rail.open.value ? '' : undefined"
            :data-peeking="rail.peeking.value && !rail.expanded.value ? '' : undefined"
            class="nav-rail sticky top-0 z-40 flex h-svh w-[var(--rail-full)] flex-col border-r bg-card"
            @pointerenter="enter"
            @pointerleave="leave"
        >
            <!-- The edge of the narrow shape, the panel's own border sits past the clip -->
            <span class="nav-rail-edge pointer-events-none absolute inset-y-0 left-[calc(var(--rail-w)-1px)] w-px bg-border" aria-hidden="true" />
            <NavList
                :nav="nav"
                :current-path="currentPath"
                :current-href="currentHref"
                :pending="pending"
                :collapse-key="collapseKey"
                variant="rail"
                :compact="!rail.open.value"
                :pinned="rail.expanded.value"
                :tips="tips"
            >
                <template #mark><slot name="mark" /></template>
                <template #brand><slot name="brand" /></template>
                <template v-if="$slots.footer" #footer><slot name="footer" /></template>
            </NavList>

            <!-- Apart from the list and fixed at the foot, it is the rail's own control and not one more screen -->
            <div v-if="rail.docks.value" class="shrink-0 border-t px-2 py-2">
                <button
                    type="button"
                    v-bind="props.controlAttrs"
                    data-nav-rail-pin
                    class="mov-toque group flex h-9 w-full items-center gap-3 rounded-lg px-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
                    :aria-label="pinLabel"
                    :aria-expanded="rail.expanded.value"
                    aria-controls="nav-rail"
                    @click="rail.toggle"
                >
                    <span
                        class="flex size-8 shrink-0 items-center justify-center rounded-md transition-colors group-hover:bg-accent group-focus-visible:bg-accent"
                    >
                        <component :is="pinIcon" class="mov-icone h-4 w-4" />
                    </span>
                    <span class="nav-rail-fade min-w-0 flex-1 truncate text-left">{{ pinLabel }}</span>
                </button>
            </div>
        </aside>
    </div>
</template>
