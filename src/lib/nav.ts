import type { Component } from 'vue';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const readCollapsed = (store: Store | null, key: string): Set<string> => {
    try {
        const raw = store?.getItem(key);
        const parsed: unknown = raw ? JSON.parse(raw) : [];

        return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
    } catch {
        return new Set();
    }
};

// Returns the next set whatever the storage does, so a blocked storage still lasts until the page reloads
export const toggleCollapsed = (store: Store | null, key: string, current: ReadonlySet<string>, group: string): Set<string> => {
    const next = new Set(current);

    if (next.has(group)) next.delete(group);
    else next.add(group);

    try {
        if (next.size === 0) store?.removeItem(key);
        else store?.setItem(key, JSON.stringify([...next]));
    } catch {
        // Storage blocked
    }

    return next;
};

/** The path a link points to, with no host, query, hash or trailing slash */
export function normalizePath(url: string): string {
    const bare = url
        .split('?')[0]
        .split('#')[0]
        .replace(/^https?:\/\/[^/]+/, '');

    return bare.replace(/\/+$/, '') || '/';
}

/** True when the path is the link itself or a screen hanging from it, the home only matches itself */
export function covers(href: string, path: string): boolean {
    const target = normalizePath(href);

    if (target === '/') return path === '/';

    return path === target || path.startsWith(`${target}/`);
}

/** One screen of the navigation, the app builds the list already filtered by what the person may open */
export interface NavItem {
    title: string;
    href: string;
    icon?: Component;
    /** An item that erases or restores keeps the destructive colour, lit or not */
    tone?: 'danger';
    hidden?: boolean;
    /** Marks an item that moved to another group, for the app's own hooks */
    moved?: boolean;
}

export interface NavGroup {
    key: string;
    label: string;
    items: NavItem[];
    /** Screens with no row of their own that light the item they hang from */
    extras?: { href: string; parent: string }[];
}

/** A highlighted button above the list, which the list then does not repeat */
export interface NavShortcut {
    key: string;
    title: string;
    href: string;
    icon: Component;
    /** tint stands out as a feature, plain is a door like any other */
    tone: 'plain' | 'tint';
}

export interface ShellNav {
    shortcuts: NavShortcut[];
    groups: NavGroup[];
}

export interface PhoneHubItem {
    title: string;
    href: string;
    icon?: Component;
    /** The paths that read as this item, its own and the screens hanging from it */
    claims: string[];
    /** Only the path itself reads as this item, for a home every other screen of the area starts with */
    exact?: boolean;
    /** The group the screen comes from, so the sheet can set groups apart */
    group?: string;
    tone?: NavItem['tone'];
    moved?: boolean;
}

export interface PhoneHub {
    key: string;
    title: string;
    icon: Component;
    items: PhoneHubItem[];
    /** The hub draws the app's own menu through the menu slot of BottomNav instead of a sheet or a link */
    menu?: boolean;
}

export interface PhoneNav {
    /** Only the hubs with at least one screen this person may open */
    hubs: PhoneHub[];
    active: PhoneHub | null;
    /** The item lit inside the active hub */
    currentHref: string | null;
}

const claimLength = (claim: string, path: string, exact: boolean): number => {
    const target = normalizePath(claim);

    if (target === '/' || exact) return path === target ? target.length : -1;

    return path === target || path.startsWith(`${target}/`) ? target.length : -1;
};

/** The hub and item a URL belongs to, the longest claim wins so a nested screen lights its own item */
export function phoneNavAt(hubs: PhoneHub[], url: string): PhoneNav {
    const path = normalizePath(url);
    let best: { hub: PhoneHub; href: string; length: number } | null = null;

    for (const hub of hubs) {
        for (const item of hub.items) {
            for (const claim of item.claims) {
                const length = claimLength(claim, path, item.exact === true);

                if (length > 0 && (!best || length > best.length)) best = { hub, href: item.href, length };
            }
        }
    }

    return { hubs, active: best?.hub ?? null, currentHref: best?.href ?? null };
}
