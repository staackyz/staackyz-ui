import { useMediaQuery } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

/** The 4rem and 16rem of NavRail in pixels, for whoever has to know how much of the row the rail takes */
export const RAIL_PX = 64;
export const RAIL_FULL_PX = 256;

// Per device and not per person, the width of this screen is what the choice is about
const STORAGE_KEY = 'nav-rail-expanded';

const read = (): boolean => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
};

// Module state read before the first paint, so a reload never plays the opening again
const pinned = ref(typeof window === 'undefined' ? false : read());

// Wide over the content while the pointer rests on the narrow rail, it never takes room from the row
const peeking = ref(false);

watch(pinned, (value) => {
    try {
        if (value) window.localStorage.setItem(STORAGE_KEY, '1');
        else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Storage blocked, the choice lasts until the page reloads
    }
});

/**
 * The rail beside the content from md up. Resting the pointer on it widens it over the content, and from lg up the
 * button at its foot pins it wide beside the content. Between md and lg the top bar button opens the drawer instead
 */
export function useNavRail() {
    const docks = useMediaQuery('(min-width: 1024px)');
    const shows = useMediaQuery('(min-width: 768px)');

    const expanded = computed(() => docks.value && pinned.value);

    return {
        docks,
        pinned,
        peeking,
        /** Pinned wide, the column pushes the content */
        expanded,
        /** Drawn wide, pinned or only peeking over the content */
        open: computed(() => expanded.value || peeking.value),
        /** What the rail takes from the row right now, a side panel pushes into what is left */
        taken: computed(() => (!shows.value ? 0 : expanded.value ? RAIL_FULL_PX : RAIL_PX)),
        toggle: () => {
            pinned.value = !pinned.value;

            // Unpinning under the pointer would leave it peeking, so the click reads as nothing happened
            if (!pinned.value) peeking.value = false;
        },
    };
}
