import { createSeenItems, DEFAULT_ITEM_ATTRIBUTES, itemKey, itemSelector, type SeenItems } from './seenItems';

// The whole vocabulary lives in motion.css, and only what CSS cannot decide lives here

/** Past this place the cascade stops and the rest of the list enters with the last one, in opacity */
export const STAGGER_CAP = 14;

/** A row only fades, a card takes the wider step */
export type EntranceVariant = 'default' | 'row' | 'card';

const ENTRANCE_CLASS: Record<EntranceVariant, string> = {
    default: 'mov-entra',
    row: 'mov-entra-linha',
    card: 'mov-entra',
};

const TAIL_CLASS = 'mov-entra-fim';

const VARIANT_TOKENS: Partial<Record<EntranceVariant, Record<string, string>>> = {
    card: { '--mov-passo': 'var(--mov-passo-largo)' },
};

// mov-entra-fim and mov-entra-linha borrow the light keyframes
const ENTRANCE_KEYFRAMES = new Set(['mov-entra', 'mov-entra-leve']);

const ENTRANCE_CLASSES = '.mov-entra, .mov-entra-leve, .mov-entra-fim, .mov-entra-linha';

function markEntered(event: AnimationEvent) {
    if (event.pseudoElement || !ENTRANCE_KEYFRAMES.has(event.animationName)) return;
    if (event.target instanceof Element) event.target.setAttribute('data-entered', '');
}

let seen: SeenItems | null = null;
let attributes: readonly string[] = DEFAULT_ITEM_ATTRIBUTES;
let selector = itemSelector(attributes);
let flushTimer: ReturnType<typeof setTimeout> | undefined;

function sessionStore(): Storage | null {
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

// Appearing is what counts, a person who pressed F5 mid cascade already saw the card that started entering
function rememberAppeared(event: AnimationEvent) {
    if (!seen || event.pseudoElement || !ENTRANCE_KEYFRAMES.has(event.animationName) || !(event.target instanceof Element)) return;

    const item = event.target.closest(selector);
    const key = item ? itemKey(item, attributes) : null;

    if (!key) return;

    seen.add(key);
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => seen?.flush(), 300);
}

function markAsEntered(item: Element) {
    item.setAttribute('data-entered', '');
    item.querySelectorAll(ENTRANCE_CLASSES).forEach((inside) => inside.setAttribute('data-entered', ''));
}

/** A node drawn for an item already seen is marked before the frame is painted, so its entrance never starts */
function skipSeenEntrances(records: MutationRecord[]) {
    if (!seen) return;

    for (const record of records) {
        for (const node of record.addedNodes) {
            if (!(node instanceof Element)) continue;

            const items = node.matches(selector) ? [node, ...node.querySelectorAll(selector)] : [...node.querySelectorAll(selector)];

            for (const item of items) {
                const key = itemKey(item, attributes);
                if (key && seen.has(key)) markAsEntered(item);
            }
        }
    }
}

/** What one person saw is not the next one's, so a change of owner takes it along */
export function forgetSeenItems() {
    seen?.clear();
}

export interface EntranceOptions {
    /** The attributes that name an item by its id, the default is data-card-id, data-item-id and data-kpi */
    itemAttributes?: readonly string[];
}

/**
 * An entrance plays once per node, whatever happens to its class afterwards, and once per item for the whole tab.
 * An item the person already saw is drawn in place on F5, on a revisit and on every refresh. Call it once at boot.
 */
export function playEntrancesOnce(root: Document = document, options: EntranceOptions = {}) {
    attributes = options.itemAttributes ?? DEFAULT_ITEM_ATTRIBUTES;
    selector = itemSelector(attributes);

    root.addEventListener('animationend', markEntered, true);
    // Cut short counts as entered too, a pulse arriving mid cascade cancels it and would hand it back later
    root.addEventListener('animationcancel', markEntered, true);

    seen = createSeenItems(sessionStore());
    root.addEventListener('animationstart', rememberAppeared, true);
    // Mutation callbacks run before the next frame, which lets the mark land before anything is painted
    new MutationObserver(skipSeenEntrances).observe(root.documentElement, { childList: true, subtree: true });
    window.addEventListener('pagehide', () => seen?.flush());
}

/** Screens never bind this by hand, they use vEnter or useEntranceQueue */
export function staggeredEntrance(index: number, variant: EntranceVariant = 'default'): { class: string; style: Record<string, string> } {
    const tail = index >= STAGGER_CAP;

    return {
        class: tail ? TAIL_CLASS : ENTRANCE_CLASS[variant],
        style: {
            '--mov-i': String(tail ? STAGGER_CAP - 1 : index),
            ...VARIANT_TOKENS[variant],
        },
    };
}

const applyEntrance = (el: HTMLElement, entrance: ReturnType<typeof staggeredEntrance>) => {
    el.classList.add(entrance.class);
    for (const [name, value] of Object.entries(entrance.style)) el.style.setProperty(name, value);
};

export type EnterBinding = number | { place?: number; variant?: EntranceVariant };

/** The queue slot is written once at mount, so a poll never makes it dance */
export const vEnter = {
    mounted(el: HTMLElement, binding: { value?: EnterBinding }) {
        const value = binding.value;
        const place = typeof value === 'number' ? value : (value?.place ?? 0);
        const variant = typeof value === 'number' ? 'default' : (value?.variant ?? 'default');

        applyEntrance(el, staggeredEntrance(place, variant));

        // A row born inside a branch that is opening arrives with the fold, a second motion of its own was the flash
        if (el.closest('[data-tree-fold].gaveta-enter-active')) el.setAttribute('data-entered', '');
    },
};

/** A count running in JavaScript has no media query to switch off, and the setting can flip with the tab open */
export function reducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// One layout read per token, and never inside the frame loop
const readTokens = new Map<string, number>();

/** A duration token in milliseconds, read from the stylesheet so a number is never copied into script */
export function sheetDuration(name: string, fallback: number): number {
    const kept = readTokens.get(name);
    if (kept !== undefined) return kept;

    if (typeof document === 'undefined') return fallback;

    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(raw);
    const ms = Number.isFinite(parsed) ? (raw.endsWith('ms') ? parsed : parsed * 1000) : fallback;

    readTokens.set(name, ms);

    return ms;
}

/** A token read as written, for a curve or a plain number */
export function sheetToken(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback;

    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function sheetNumber(name: string, fallback: number): number {
    const parsed = Number.parseFloat(sheetToken(name, ''));

    return Number.isFinite(parsed) ? parsed : fallback;
}

/** The rail's clock for what moves beside its clip in script, the twin of .nav-rail in motion.css */
export function railClock(opening: boolean): { duration: number; easing: string } {
    return {
        duration: sheetDuration('--mov-longo', 420),
        easing: opening ? sheetToken('--mov-chegada', 'ease-out') : sheetToken('--mov-volta', 'ease-in-out'),
    };
}

/** CSS never lends a cubic-bezier to a requestAnimationFrame, so this twins the --mov-chegada token */
export function arrivalEasing(t: number): number {
    return 1 - Math.pow(1 - t, 4);
}

/** A number eases out more gently than a path, so the last values stay readable */
export function countEasing(t: number): number {
    return 1 - Math.pow(1 - t, 2);
}

// Zero fires on a sliver of pixel, and much more wakes the section after it is already being read
const ON_VIEW = { threshold: 0.15 };

// One observer for the whole page because one per element costs for nothing
let observer: IntersectionObserver | null = null;

function watcher(): IntersectionObserver {
    observer ??= new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            (entry.target as HTMLElement).style.animationPlayState = '';
            obs.unobserve(entry.target);
        }
    }, ON_VIEW);

    return observer;
}

/** The entrance waits for the element to scroll into view, the index counts inside the group and not the page */
export const vEnterOnView = {
    mounted(el: HTMLElement, binding: { value?: number }) {
        // A browser without the observer loses the animation and never the content
        if (typeof IntersectionObserver === 'undefined') return;

        applyEntrance(el, staggeredEntrance(binding.value ?? 0));
        el.style.animationPlayState = 'paused';

        watcher().observe(el);
    },

    unmounted(el: HTMLElement) {
        observer?.unobserve(el);
    },
};
