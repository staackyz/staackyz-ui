<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useUi } from '../lib/config';
import { railClock, reducedMotion } from '../lib/motion';
import { covers, normalizePath, readCollapsed, toggleCollapsed, type NavGroup, type NavItem, type NavShortcut, type ShellNav } from '../lib/nav';
import { cn } from '../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// The one list behind the drawer and the rail, so an item, a group or a lit state exists in one place
const props = defineProps<{
    nav: ShellNav;
    /** The path of the screen in front, the longest matching item lights */
    currentPath: string;
    // The rail draws every row as icon and name so its narrow shape is the same rows clipped, the drawer keeps its two big buttons
    variant: 'drawer' | 'rail';
    // Only the rail folds to its icons, with no group titles and a thin divider where each group starts
    compact?: boolean;
    // The narrow rail names its icons in tooltips, but not while the pointer is on it and the names are about to show
    tips?: boolean;
    // Pinned by a click, the only state where the highlighted pair may change shape, a peek never moves what is under the pointer
    pinned?: boolean;
    /** What waits for the person on each address, shown as a counter on the icon */
    pending?: Record<string, number>;
    /** Where the folded groups are remembered on this device, per person and per area, nothing is kept without it */
    collapseKey?: string;
    /** Lights this item instead of the longest match, null lights none */
    currentHref?: string | null;
}>();

const emit = defineEmits<{ navigate: [] }>();

const { labels, navLink: link } = useUi();

const rail = computed(() => props.variant === 'rail');
const path = computed(() => normalizePath(props.currentPath));

// The highlighted buttons sit above the list, so the list does not repeat them
const above = computed(() => new Set(props.nav.shortcuts.map((shortcut) => shortcut.href)));

const groups = computed(() =>
    props.nav.groups
        .map((group) => ({ ...group, items: group.items.filter((item) => !item.hidden && !above.value.has(item.href)) }))
        .filter((group) => group.items.length > 0),
);

// A screen with no row of its own lights the item it hangs from
const claims = (item: NavItem, group: NavGroup) => [
    item.href,
    ...(group.extras ?? []).filter((extra) => extra.parent === item.href).map((extra) => extra.href),
];

// The longest match wins, so a nested screen does not also light its parent
const matched = computed(() => {
    let best: { href: string; length: number } | null = null;

    for (const group of groups.value) {
        for (const item of group.items) {
            for (const href of claims(item, group)) {
                const length = normalizePath(href).length;

                if (covers(href, path.value) && (!best || length > best.length)) best = { href: item.href, length };
            }
        }
    }

    return best?.href ?? null;
});

const isCurrent = (item: NavItem) => (props.currentHref === undefined ? matched.value : props.currentHref) === item.href;

const store = (): Storage | null => {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
};

// Every group starts open, and only what a person folds is remembered
const collapsed = ref(new Set<string>());

// The drawer mounts this on every opening, so a choice made in the rail or in another tab shows up there too
onMounted(() => {
    if (props.collapseKey) collapsed.value = readCollapsed(store(), props.collapseKey);
});

const toggle = (key: string) => {
    collapsed.value = props.collapseKey
        ? toggleCollapsed(store(), props.collapseKey, collapsed.value, key)
        : toggleCollapsed(null, '', collapsed.value, key);
};

const pendingOf = (href: string) => props.pending?.[href] ?? 0;
const pendingText = (count: number) => (count > 99 ? '99+' : String(count));

// The narrow rail keeps the lit and hover state on the tile, a row fill cut at the rail edge would end square on one side
// The same row height in both shapes, so widening the rail never moves the item under the pointer
const ITEM = 'mov-toque group flex min-h-9 items-center gap-3 rounded-lg px-2 py-0.5 text-sm font-medium outline-none transition-colors';
const TILE = 'flex size-8 shrink-0 items-center justify-center rounded-md transition-colors';
// The counter sits on the icon's corner, so it reads the same on the narrow rail, the wide one and the drawer
const PENDING =
    'pointer-events-none absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-2xs font-bold leading-none text-white shadow-sm';

const itemClass = (item: NavItem) => {
    const lit = isCurrent(item);

    if (props.compact) return item.tone === 'danger' ? 'text-destructive' : lit ? 'font-semibold text-primary' : 'text-foreground/80';

    if (item.tone === 'danger') {
        return lit ? 'bg-destructive/10 font-semibold text-destructive' : 'text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10';
    }

    return lit ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:bg-accent';
};

const tileClass = (item: NavItem) => {
    const lit = isCurrent(item);

    if (item.tone === 'danger') {
        if (lit) return 'bg-destructive text-destructive-foreground';

        return props.compact
            ? 'bg-destructive/10 text-destructive group-hover:bg-destructive/20 group-focus-visible:bg-destructive/20'
            : 'bg-destructive/10 text-destructive';
    }

    if (lit) return 'bg-primary text-primary-foreground';

    return props.compact
        ? 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-primary group-focus-visible:bg-accent group-focus-visible:text-primary'
        : 'bg-muted text-muted-foreground group-hover:text-primary';
};

const litShortcut = (shortcut: NavShortcut) => path.value === normalizePath(shortcut.href);

// Narrow, the highlight is a bordered tile, wide it is the card around the whole row, and the tinted one keeps its tint in both
const shortcutCardClass = (shortcut: NavShortcut) => {
    if (litShortcut(shortcut)) return 'border-primary bg-primary/10';

    return shortcut.tone === 'tint'
        ? 'border-primary/40 bg-primary/10 shadow-sm group-hover:border-primary/70 group-focus-visible:border-primary/70'
        : 'border-primary/25 bg-card shadow-sm group-hover:border-primary/60 group-focus-visible:border-primary/60';
};

const shortcutTileClass = (shortcut: NavShortcut) => {
    if (litShortcut(shortcut)) return 'border-primary bg-primary text-primary-foreground';

    if (!props.compact) return 'border-transparent text-primary';

    return shortcut.tone === 'tint'
        ? 'border-primary/40 bg-primary/15 text-primary shadow-sm group-hover:border-primary/70 group-focus-visible:border-primary/70'
        : 'border-primary/25 bg-card text-primary shadow-sm group-hover:border-primary/60 group-focus-visible:border-primary/60';
};

// The pinned rail lays the highlighted pair side by side, narrow and peeking they stay stacked where they are
const pairWide = computed(() => rail.value && props.pinned && !props.compact && props.nav.shortcuts.length > 1);

const shortcutList = ref<HTMLElement | null>(null);
const SHORTCUT_FLIP = 'rail-shortcut-flip';

const shortcutLinks = () => [...(shortcutList.value?.querySelectorAll<HTMLElement>('[data-rail-shortcut]') ?? [])];

let shortcutsBefore = new Map<string, DOMRect>();

// Where each button is drawn before the layout swaps, a move still in flight included
watch(
    pairWide,
    () => {
        shortcutsBefore = new Map(shortcutLinks().map((el) => [el.dataset.railShortcut ?? '', el.getBoundingClientRect()]));
    },
    { flush: 'pre' },
);

// The layout swaps in one frame and each button glides from where it was on the GPU, on the same clock as the rail's clip
watch(
    pairWide,
    (wide) => {
        if (reducedMotion()) return;

        const { duration, easing } = railClock(wide);

        for (const el of shortcutLinks()) {
            el.getAnimations()
                .filter((animation) => animation.id === SHORTCUT_FLIP)
                .forEach((animation) => animation.cancel());

            const from = shortcutsBefore.get(el.dataset.railShortcut ?? '');
            if (!from) continue;

            const to = el.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

            el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration, easing, id: SHORTCUT_FLIP });
        }
    },
    { flush: 'post' },
);

const SHORTCUT =
    'mov-toque flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-bold outline-none transition-colors focus-visible:bg-accent';

const shortcutClass = (shortcut: NavShortcut) => {
    if (litShortcut(shortcut)) return 'border-primary bg-primary text-primary-foreground';

    return shortcut.tone === 'tint'
        ? 'border-primary/30 bg-primary/10 text-primary hover:border-primary/60'
        : 'border-border bg-background hover:border-primary/50';
};
</script>

<template>
    <TooltipProvider :delay-duration="150">
        <div class="flex min-h-0 flex-1 flex-col">
            <!-- In the rail the brand row is as tall as the top bar beside it, so the two bottom borders meet in one line -->
            <div class="flex shrink-0 items-center gap-2.5 border-b py-3" :class="rail ? 'h-14 px-4' : 'px-4 pr-12'">
                <slot name="mark" />
                <div class="nav-rail-fade min-w-0 leading-none">
                    <slot name="brand" />
                </div>
            </div>

            <div class="scrollbar-hidden flex-1 overflow-y-auto overflow-x-hidden pb-4 pt-3" :class="rail ? 'px-2' : 'px-3'" data-page-memory>
                <div v-if="nav.shortcuts.length && !rail" class="grid gap-2" :class="nav.shortcuts.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
                    <component
                        :is="link"
                        v-for="shortcut in nav.shortcuts"
                        :key="shortcut.key"
                        :href="shortcut.href"
                        v-bind="{ [`data-drawer-${shortcut.key}`]: '' }"
                        :aria-current="litShortcut(shortcut) ? 'page' : undefined"
                        :class="[SHORTCUT, shortcutClass(shortcut)]"
                        @click="emit('navigate')"
                    >
                        <component :is="shortcut.icon" class="h-5 w-5" :class="litShortcut(shortcut) ? '' : 'text-primary'" />
                        {{ shortcut.title }}
                        <span
                            v-if="pendingOf(shortcut.href)"
                            class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-2xs font-bold leading-none text-white"
                            data-nav-pending
                        >
                            {{ pendingText(pendingOf(shortcut.href)) }}
                            <span class="sr-only">{{ labels.pending(pendingOf(shortcut.href)) }}</span>
                        </span>
                    </component>
                </div>

                <!-- Stacked narrow and peeking, one row pinned, centred in a block of the stacked height so pinning moves nothing below -->
                <ul
                    v-else-if="nav.shortcuts.length"
                    ref="shortcutList"
                    class="grid"
                    :class="[
                        pairWide ? 'grid-cols-[auto_minmax(0,1fr)] content-center gap-1.5' : 'grid-cols-1 content-start gap-0.5',
                        { 'h-[4.625rem]': nav.shortcuts.length > 1 },
                    ]"
                    data-rail-shortcuts
                >
                    <li v-for="shortcut in nav.shortcuts" :key="shortcut.key" class="flex min-w-0">
                        <Tooltip :disabled="!tips">
                            <TooltipTrigger as-child>
                                <component
                                    :is="link"
                                    :href="shortcut.href"
                                    v-bind="{ [`data-drawer-${shortcut.key}`]: '' }"
                                    :data-rail-shortcut="shortcut.key"
                                    :aria-current="litShortcut(shortcut) ? 'page' : undefined"
                                    :class="
                                        cn(
                                            ITEM,
                                            'relative w-full min-w-0 font-bold',
                                            pairWide ? 'min-h-10 gap-2 pr-2.5' : 'min-h-9',
                                            shortcut.tone === 'tint' || litShortcut(shortcut) ? 'text-primary' : 'text-foreground',
                                        )
                                    "
                                    @click="emit('navigate')"
                                >
                                    <!-- The wide card fades in with the names, so the narrow shape never shows a row cut square at its edge -->
                                    <span
                                        aria-hidden="true"
                                        class="nav-rail-fade pointer-events-none absolute inset-0 rounded-lg border"
                                        :class="shortcutCardClass(shortcut)"
                                    />
                                    <span :class="['relative border', TILE, shortcutTileClass(shortcut)]">
                                        <component :is="shortcut.icon" class="h-4 w-4" />
                                        <span v-if="pendingOf(shortcut.href)" :class="PENDING" data-nav-pending aria-hidden="true">
                                            {{ pendingText(pendingOf(shortcut.href)) }}
                                        </span>
                                    </span>
                                    <span v-if="pendingOf(shortcut.href)" class="sr-only">{{ labels.pending(pendingOf(shortcut.href)) }}</span>
                                    <span class="nav-rail-fade relative min-w-0 flex-1 truncate">{{ shortcut.title }}</span>
                                </component>
                            </TooltipTrigger>
                            <TooltipContent side="right" data-nav-tip>{{ shortcut.title }}</TooltipContent>
                        </Tooltip>
                    </li>
                </ul>

                <nav :aria-label="labels.mainNavigation" :class="rail ? 'mt-1' : 'mt-4 space-y-1'">
                    <section v-for="group in groups" :key="group.key" :data-nav-group="group.key">
                        <!-- One slot of the same height in both shapes, the divider narrow and the folding title wide, so widening moves no item -->
                        <div v-if="rail" class="relative h-7">
                            <span aria-hidden="true" class="nav-rail-divider pointer-events-none absolute left-2 top-1/2 h-px w-8 bg-border" />
                            <button
                                type="button"
                                class="nav-rail-fade absolute inset-0 flex w-full items-center gap-2 rounded-md px-2 text-2xs font-bold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                                :inert="compact || undefined"
                                :aria-expanded="!collapsed.has(group.key)"
                                :aria-controls="`nav-group-${group.key}`"
                                @click="toggle(group.key)"
                            >
                                <span class="flex-1 truncate text-left">{{ group.label }}</span>
                                <ChevronDown class="nav-chevron h-3.5 w-3.5 shrink-0" :class="{ '-rotate-90': collapsed.has(group.key) }" />
                            </button>
                        </div>
                        <button
                            v-else
                            type="button"
                            class="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-2xs font-bold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                            :aria-expanded="!collapsed.has(group.key)"
                            :aria-controls="`nav-group-${group.key}`"
                            @click="toggle(group.key)"
                        >
                            <span class="flex-1 truncate text-left">{{ group.label }}</span>
                            <ChevronDown class="nav-chevron h-3.5 w-3.5 shrink-0" :class="{ '-rotate-90': collapsed.has(group.key) }" />
                        </button>

                        <!-- The narrow rail lists every item, a folded group hides its items only where its title shows -->
                        <div :id="`nav-group-${group.key}`" class="fold-rows" :data-open="compact || !collapsed.has(group.key) ? '' : undefined">
                            <div>
                                <ul class="space-y-0.5" :class="rail ? 'pb-1' : 'pb-2'">
                                    <li v-for="item in group.items" :key="item.href">
                                        <Tooltip :disabled="!tips">
                                            <TooltipTrigger as-child>
                                                <component
                                                    :is="link"
                                                    :href="item.href"
                                                    :data-nav-tone="item.tone"
                                                    :data-nav-moved="item.moved ? '' : undefined"
                                                    :aria-current="isCurrent(item) ? 'page' : undefined"
                                                    :class="[ITEM, itemClass(item)]"
                                                    @click="emit('navigate')"
                                                >
                                                    <span :class="['relative', TILE, tileClass(item)]">
                                                        <component :is="item.icon" v-if="item.icon" class="h-4 w-4" />
                                                        <span v-if="pendingOf(item.href)" :class="PENDING" data-nav-pending aria-hidden="true">
                                                            {{ pendingText(pendingOf(item.href)) }}
                                                        </span>
                                                    </span>
                                                    <span v-if="pendingOf(item.href)" class="sr-only">{{
                                                        labels.pending(pendingOf(item.href))
                                                    }}</span>
                                                    <span class="nav-rail-fade min-w-0 flex-1 truncate">{{ item.title }}</span>
                                                </component>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" data-nav-tip>{{ item.title }}</TooltipContent>
                                        </Tooltip>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </nav>
            </div>

            <!-- The narrow rail has no room for the foot, it folds away with the names and takes no focus while hidden -->
            <div v-if="$slots.footer" :class="{ 'fold-rows': rail }" :data-open="!compact ? '' : undefined" :inert="compact || undefined">
                <div>
                    <div class="border-t px-3 py-3">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </div>
    </TooltipProvider>
</template>
