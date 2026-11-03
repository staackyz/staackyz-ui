import { staggeredEntrance, type EntranceVariant } from '../lib/motion';

// Resetting each frame keeps a late arrival from inheriting place four hundred
function waveCounter() {
    let next = 0;
    let waveOpen = false;

    return () => {
        if (!waveOpen && typeof requestAnimationFrame !== 'undefined') {
            waveOpen = true;
            requestAnimationFrame(() => {
                next = 0;
                waveOpen = false;
            });
        }

        return next++;
    };
}

/** One entrance queue per screen instead of per list, so two lists cascading at once still read in order */
export function useEntranceQueue() {
    /** Stable places keep --mov-i from dancing on every poll */
    const slots = new Map<string | number, number>();
    const nextSlot = waveCounter();

    const enter = (key: string | number, variant: EntranceVariant = 'default') => {
        let slot = slots.get(key);

        if (slot === undefined) {
            slot = nextSlot();
            slots.set(key, slot);
        }

        return staggeredEntrance(slot, variant);
    };

    return { enter };
}
