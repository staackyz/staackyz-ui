// Why an item the person already saw never enters again, not even after F5

/** The attributes that name an item of a list by its id, an app passes its own list to playEntrancesOnce */
export const DEFAULT_ITEM_ATTRIBUTES: readonly string[] = ['data-card-id', 'data-item-id', 'data-kpi'];

export const SEEN_STORAGE_KEY = 'staackyz:entered';

interface ItemLike {
    getAttribute(name: string): string | null;
}

export const itemSelector = (attributes: readonly string[]): string => attributes.map((attribute) => `[${attribute}]`).join(',');

/** The item's name in the store, or null when the node is not an item of a list */
export function itemKey(item: ItemLike, attributes: readonly string[] = DEFAULT_ITEM_ATTRIBUTES): string | null {
    for (const attribute of attributes) {
        const value = item.getAttribute(attribute);

        if (value !== null && value !== '') return `${attribute}=${value}`;
    }

    return null;
}

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface SeenItems {
    has(key: string): boolean;
    add(key: string): void;
    /** Writes what changed since the last write, cheap to call often */
    flush(): void;
    clear(): void;
}

function read(storage: Store | null): string[] {
    try {
        const raw = storage?.getItem(SEEN_STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === 'string') : [];
    } catch {
        return [];
    }
}

export function createSeenItems(storage: Store | null, max = 4000): SeenItems {
    const keys = new Set(read(storage));
    let dirty = false;

    return {
        has: (key) => keys.has(key),
        add(key) {
            if (keys.has(key)) return;

            keys.add(key);
            dirty = true;

            // A Set iterates in insertion order, so the first one is the oldest
            for (const oldest of keys) {
                if (keys.size <= max) break;

                keys.delete(oldest);
            }
        },
        flush() {
            if (!dirty || !storage) return;

            dirty = false;

            try {
                storage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...keys]));
            } catch {
                // Full or blocked storage only costs the entrance being played again after F5
            }
        },
        clear() {
            keys.clear();
            dirty = false;

            try {
                storage?.removeItem(SEEN_STORAGE_KEY);
            } catch {
                // Blocked storage has nothing to clear
            }
        },
    };
}
