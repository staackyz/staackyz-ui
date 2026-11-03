<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { FocusScope } from 'reka-ui';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useUi } from '../lib/config';
import { vEnter } from '../lib/motion';
import type { PhoneHub, PhoneHubItem, PhoneNav } from '../lib/nav';

// Every screen of one hub, rising from the bottom bar
const props = defineProps<{
    nav: PhoneNav;
    // The hub tapped on the bar, null while the sheet is closed
    openKey: string | null;
    id: string;
    currentPath: string;
}>();

const emit = defineEmits<{ 'update:openKey': [key: string | null] }>();

const { labels, navigate } = useUi();

// The content stays drawn while the sheet leaves, so it never empties mid exit
const shownKey = ref<string | null>(props.openKey);
watch(
    () => props.openKey,
    (key) => {
        if (key) shownKey.value = key;
    },
);

const hub = computed<PhoneHub | null>(() => props.nav.hubs.find((candidate) => candidate.key === shownKey.value) ?? null);

// Screens of the same drawer group sit together, groups keep the order they first appear in
const sections = computed<PhoneHubItem[][]>(() => {
    const byGroup = new Map<string, PhoneHubItem[]>();

    for (const item of hub.value?.items ?? []) {
        const key = item.group ?? item.href;
        byGroup.set(key, [...(byGroup.get(key) ?? []), item]);
    }

    return [...byGroup.values()];
});

// The widest group sets the columns, so two groups of two read as a square and not as two thirds
const widest = computed(() => Math.max(0, ...sections.value.map((section) => section.length)));
const columns = computed(() => ({ gridTemplateColumns: `repeat(${Math.min(Math.max(widest.value, 2), 3)}, minmax(0, 1fr))` }));

// One running index across the sections, so the cascade reads as one list
const placeOf = (href: string) => (hub.value?.items ?? []).findIndex((item) => item.href === href);

const isCurrent = (item: PhoneHubItem) => props.nav.currentHref === item.href;

// The back button closes the sheet, so opening pushes a copy of the current entry and its pop is kept from Inertia
let guarded = false;
// The screen picked while the copy was still on the stack, visited once the copy is gone
let pending: string | null = null;

const onPop = (event: PopStateEvent) => {
    if (!guarded) return;

    event.stopImmediatePropagation();
    release();
    if (props.openKey) emit('update:openKey', null);

    if (pending) navigate(pending);
    pending = null;
};

const release = () => {
    guarded = false;
    window.removeEventListener('popstate', onPop, true);
};

watch(
    () => props.openKey,
    (key, before) => {
        if (key && !before && !guarded) {
            window.history.pushState(window.history.state, '', window.location.href);
            guarded = true;
            // Capture at the window runs before the router's own listener
            window.addEventListener('popstate', onPop, true);
        }

        // Closed by a tap, the copied entry goes and its pop is swallowed above
        if (!key && guarded) window.history.back();
    },
);

const close = () => emit('update:openKey', null);

// The copy leaves first and the visit follows, so history ends as if the sheet never opened
const pick = (event: MouseEvent, item: PhoneHubItem) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();

    if (isCurrent(item)) return close();

    if (guarded) pending = item.href;
    else navigate(item.href);

    close();
};

// A screen change from anywhere else ends the sheet without touching history
watch(
    () => props.currentPath,
    () => {
        if (!props.openKey) return;

        release();
        close();
    },
);

onBeforeUnmount(release);

const sheet = ref<HTMLElement | null>(null);

// Focus lands on the screen in front, or on the first one, never on the close button
const focusStart = async (event: Event) => {
    event.preventDefault();
    await nextTick();
    const target =
        sheet.value?.querySelector<HTMLElement>('[aria-current="page"]') ?? sheet.value?.querySelector<HTMLElement>('[data-hub-sheet-item]');
    target?.focus();
};

const titleId = computed(() => `${props.id}-title`);

const tileClass = (item: PhoneHubItem) => {
    if (item.tone === 'danger') return isCurrent(item) ? 'bg-destructive text-destructive-foreground' : 'bg-destructive/10 text-destructive';

    return isCurrent(item) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary';
};

const itemClass = (item: PhoneHubItem) => {
    if (item.tone === 'danger')
        return isCurrent(item) ? 'bg-destructive/10 text-destructive' : 'text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10';

    return isCurrent(item) ? 'bg-primary/10 text-primary' : 'text-foreground/85 hover:bg-accent focus-visible:bg-accent';
};
</script>

<template>
    <Teleport to="body">
        <!-- Under the bar and over everything else, so the bar stays a tap away and closes what it opened -->
        <Transition name="hub-veil">
            <div
                v-if="openKey"
                data-hub-sheet-backdrop
                aria-hidden="true"
                class="fixed inset-0 z-[39] touch-none bg-black/40 md:hidden"
                @click="close"
            />
        </Transition>

        <Transition name="hub-sheet">
            <div
                v-if="openKey && hub"
                :id="id"
                ref="sheet"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
                :data-hub-sheet="hub.key"
                class="has-bottom-nav elevation-float fixed inset-x-0 bottom-[var(--bottomnav-h)] z-[39] flex max-h-[calc(100dvh-var(--bottomnav-h)-4rem)] flex-col rounded-t-2xl border-t bg-card md:hidden"
                @keydown.esc.stop.prevent="close"
            >
                <FocusScope trapped loop class="flex min-h-0 flex-col" @mount-auto-focus="focusStart">
                    <div class="flex items-center gap-2 py-1 pl-4 pr-1">
                        <h2 :id="titleId" class="flex-1 truncate text-sm font-bold">{{ hub.title }}</h2>
                        <button
                            type="button"
                            data-hub-sheet-close
                            :aria-label="labels.close"
                            class="mov-toque flex size-11 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent focus-visible:bg-accent"
                            @click="close"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <nav
                        :key="hub.key"
                        data-page-memory
                        :aria-label="labels.hubScreens(hub.title)"
                        class="min-h-0 overflow-y-auto overscroll-contain px-3 pb-3"
                    >
                        <template v-for="(section, s) in sections" :key="s">
                            <!-- The groups are told apart by a hairline and nothing more, the group only groups -->
                            <hr v-if="s > 0" data-hub-sheet-divider class="mx-1 my-2 border-border" />
                            <ul class="grid gap-1.5" :style="columns">
                                <li v-for="item in section" :key="item.href" v-enter="placeOf(item.href)">
                                    <a
                                        :href="item.href"
                                        data-hub-sheet-item
                                        :data-nav-tone="item.tone"
                                        :data-nav-moved="item.moved ? '' : undefined"
                                        :aria-current="isCurrent(item) ? 'page' : undefined"
                                        class="mov-toque group flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-2 text-center text-xs font-semibold leading-tight outline-none transition-colors"
                                        :class="itemClass(item)"
                                        @click="pick($event, item)"
                                    >
                                        <span
                                            class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                                            :class="tileClass(item)"
                                        >
                                            <component :is="item.icon" class="h-5 w-5" />
                                        </span>
                                        <span class="line-clamp-2 break-words">{{ item.title }}</span>
                                    </a>
                                </li>
                            </ul>
                        </template>
                    </nav>
                </FocusScope>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* Rises on the arrival curve over the large surface step, and leaves faster than it came */
.hub-sheet-enter-active {
    transition:
        transform var(--mov-amplo) var(--mov-chegada),
        opacity var(--mov-medio) var(--mov-chegada);
}

.hub-sheet-leave-active {
    transition:
        transform var(--mov-amplo-saida) var(--mov-volta),
        opacity var(--mov-amplo-saida) var(--mov-volta);
}

.hub-sheet-enter-from,
.hub-sheet-leave-to {
    opacity: 0;
    transform: translateY(100%);
}

.hub-veil-enter-active {
    transition: opacity var(--mov-medio) var(--mov-chegada);
}

.hub-veil-leave-active {
    transition: opacity var(--mov-curto) var(--mov-volta);
}

.hub-veil-enter-from,
.hub-veil-leave-to {
    opacity: 0;
}

/* Only a fade is left, and the origin loses its offset too */
@media (prefers-reduced-motion: reduce) {
    .hub-sheet-enter-active,
    .hub-sheet-leave-active {
        transition: opacity var(--mov-curto) var(--mov-volta);
    }

    .hub-sheet-enter-from,
    .hub-sheet-leave-to {
        transform: none;
    }
}
</style>
