<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUi } from '../lib/config';
import type { PhoneHub, PhoneNav } from '../lib/nav';
import PhoneHubSheet from './PhoneHubSheet.vue';

// The phone's whole navigation, hubs that open their screens in a sheet, a hub of one screen that goes straight there, and the app's own menu hub
const props = defineProps<{
    nav: PhoneNav;
    /** The path of the screen in front, a change closes the sheet */
    currentPath: string;
    /** Extra attributes on the bar, for the app's own hooks like a guided tour step */
    controlAttrs?: Record<string, string>;
}>();

const { labels, link } = useUi();

// A missing hub leaves no hole, the strip splits its width among the ones left
const columns = computed(() => ({ gridTemplateColumns: `repeat(${props.nav.hubs.length}, minmax(0, 1fr))` }));

// A hub with one screen has nothing to choose from, so it goes straight there
const opensSheet = (hub: PhoneHub) => hub.items.length > 1;

const openKey = ref<string | null>(null);
const sheetId = 'phone-hub-sheet';

// Tapping the open hub again closes it, another hub swaps what the sheet lists
const toggle = (hub: PhoneHub) => {
    openKey.value = openKey.value === hub.key ? null : hub.key;
};

const active = (hub: PhoneHub) => props.nav.active?.key === hub.key;
const lit = (hub: PhoneHub) => (openKey.value ? openKey.value === hub.key : active(hub));

// Opening the app's menu puts the sheet away, one floating thing at a time
const closeSheet = () => (openKey.value = null);

const slotClass = 'mov-toque group relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 outline-none focus-visible:bg-accent';
</script>

<template>
    <!-- Fixed, because the screens that own their height scroll inside, and a bar in the flow would ride away with them -->
    <!-- has-bottom-nav here too, since the bar sits beside main and would not inherit the height it is the source of -->
    <nav
        v-bind="props.controlAttrs"
        data-page-memory
        data-bottomnav
        :aria-label="labels.mainNavigation"
        class="has-bottom-nav fixed inset-x-0 bottom-0 z-40 h-[var(--bottomnav-h)] border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
        <div class="grid h-full" :style="columns">
            <template v-for="hub in nav.hubs" :key="hub.key">
                <slot
                    v-if="hub.menu"
                    name="menu"
                    :hub="hub"
                    :active="active(hub)"
                    :button-class="[slotClass, active(hub) ? 'text-primary' : 'text-muted-foreground']"
                    :close-sheet="closeSheet"
                />

                <button
                    v-else-if="opensSheet(hub)"
                    type="button"
                    :data-bottomnav-hub="hub.key"
                    aria-haspopup="dialog"
                    :aria-expanded="openKey === hub.key"
                    :aria-controls="openKey === hub.key ? sheetId : undefined"
                    :aria-current="active(hub) ? 'page' : undefined"
                    :class="[slotClass, lit(hub) ? 'text-primary' : 'text-muted-foreground', openKey === hub.key ? 'bg-primary/10' : '']"
                    @click="toggle(hub)"
                >
                    <!-- A bar and not only a colour, so the hub in front reads the same for whoever does not see the hue -->
                    <span v-if="lit(hub)" aria-hidden="true" class="absolute inset-x-[22%] top-0 h-[3px] rounded-b-full bg-primary" />
                    <component :is="hub.icon" class="h-6 w-6 shrink-0" />
                    <span class="max-w-full truncate text-2xs font-semibold leading-none">{{ hub.title }}</span>
                </button>

                <component
                    :is="link"
                    v-else-if="hub.items.length"
                    :href="hub.items[0].href"
                    :data-bottomnav-hub="hub.key"
                    :aria-current="active(hub) ? 'page' : undefined"
                    :class="[slotClass, lit(hub) ? 'text-primary' : 'text-muted-foreground']"
                    @click="closeSheet"
                >
                    <span v-if="lit(hub)" aria-hidden="true" class="absolute inset-x-[22%] top-0 h-[3px] rounded-b-full bg-primary" />
                    <component :is="hub.icon" class="h-6 w-6 shrink-0" />
                    <span class="max-w-full truncate text-2xs font-semibold leading-none">{{ hub.title }}</span>
                </component>
            </template>
        </div>
    </nav>
    <PhoneHubSheet :id="sheetId" v-model:open-key="openKey" :nav="nav" :current-path="currentPath" />
</template>
