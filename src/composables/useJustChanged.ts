import { nextTick, onUnmounted, ref, watch, type Ref } from 'vue';

// Only an item linked to the person flashes, and the first read never does

// Covers the whole destaque-mudou animation plus a breath, a highlight that never clears stops informing
const DURATION = 1600;

// Above this it is not someone editing an item, it is the whole list being another one
const MAX_PULSE = 6;

type Key = number | string;

interface ChangedBox {
    marked: Ref<Set<Key>>;
    timers: Map<Key, ReturnType<typeof setTimeout>>;
}

function unmark(box: ChangedBox, id: Key) {
    const next = new Set(box.marked.value);
    next.delete(id);
    box.marked.value = next;
    box.timers.delete(id);
}

// Without a frame without the class the browser will not restart the animation, and the second change goes silent
async function clearBeforeRepeat(box: ChangedBox, ids: Key[]) {
    const repeated = ids.filter((id) => box.marked.value.has(id));

    if (!repeated.length) return;

    const next = new Set(box.marked.value);
    for (const id of repeated) next.delete(id);
    box.marked.value = next;
    await nextTick();
}

async function mark(box: ChangedBox, ids: Key[]) {
    await clearBeforeRepeat(box, ids);

    const next = new Set(box.marked.value);

    for (const id of ids) {
        next.add(id);
        const previous = box.timers.get(id);
        if (previous) clearTimeout(previous);
        box.timers.set(
            id,
            setTimeout(() => unmark(box, id), DURATION),
        );
    }

    box.marked.value = next;
}

function idsThatChanged(seen: Map<Key, string>, now: Map<Key, string>): Key[] {
    const list: Key[] = [];

    for (const [id, json] of now) {
        if (seen.get(id) !== json) list.push(id);
    }

    return list;
}

function track<T extends { id: Key }>(box: ChangedBox, source: () => readonly T[] | undefined, isMine: (item: T) => boolean) {
    /** null until the baseline has been read */
    let seen: Map<Key, string> | null = null;

    watch(
        source,
        (list) => {
            if (!list) return;

            const now = new Map<Key, string>(list.map((item) => [item.id, JSON.stringify(item)]));
            const changed = seen ? idsThatChanged(seen, now) : null;

            seen = now;

            if (!changed || changed.length === 0 || changed.length > MAX_PULSE) return;

            // Only what the person answers for flashes, everything else just takes its new values
            const mine = list.filter((item) => changed.includes(item.id) && isMine(item)).map((item) => item.id);

            if (mine.length) void mark(box, mine);
        },
        { immediate: true },
    );
}

/**
 * @param source the list that comes from the server, never the filtered one, filtering swaps the array on every keystroke
 * @param isMine the module's link between the person and an item, and without one nothing ever flashes
 */
export function useJustChanged<T extends { id: Key }>(source: () => readonly T[] | undefined, isMine?: (item: T) => boolean) {
    const box: ChangedBox = { marked: ref(new Set<Key>()), timers: new Map() };

    // A module with no link to the person compares nothing, the values still update in place
    if (isMine) track(box, source, isMine);

    onUnmounted(() => {
        for (const timer of box.timers.values()) clearTimeout(timer);
        box.timers.clear();
    });

    const pulseClass = (id: Key): string => (box.marked.value.has(id) ? 'destaque-mudou' : '');

    return { pulseClass };
}
