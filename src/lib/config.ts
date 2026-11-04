import { computed, inject, provide, toValue, type Component, type ComputedRef, type InjectionKey, type MaybeRefOrGetter } from 'vue';

/** Every word the components say on their own, the app hands them from its translation files */
export interface UiLabels {
    close: string;
    skipToContent: string;
    mainNavigation: string;
    openMenu: string;
    menuTitle: string;
    menuDescription: string;
    railExpand: string;
    railPin: string;
    railCollapse: string;
    pending: (count: number) => string;
    hubScreens: (hub: string) => string;
    expected: (value: string) => string;
}

export interface UiConfig {
    labels?: MaybeRefOrGetter<Partial<UiLabels>>;
    /** The link the navigation draws, the Inertia Link in an Inertia app, a plain anchor otherwise */
    link?: Component | string;
    /** The link the rail and the drawer draw for their items, the plain link when left out, for an app that prefetches on hover */
    navLink?: Component | string;
    /** How a pick in the phone sheet leaves for a screen, router.visit in an Inertia app */
    navigate?: (href: string) => void;
    /** How a plain number reads in a chart, the locale number when left out */
    formatNumber?: (value: number, decimals?: number) => string;
}

// Plain English so a missing label is never an empty accessible name, an app always passes its own
const FALLBACK: UiLabels = {
    close: 'Close',
    skipToContent: 'Skip to content',
    mainNavigation: 'Main navigation',
    openMenu: 'Open menu',
    menuTitle: 'Menu',
    menuDescription: 'The screens of the app',
    railExpand: 'Expand the menu',
    railPin: 'Keep the menu open',
    railCollapse: 'Collapse the menu',
    pending: (count) => `${count} waiting`,
    hubScreens: (hub) => hub,
    expected: (value) => `expected ${value}`,
};

const KEY: InjectionKey<UiConfig> = Symbol('staackyz-ui');

/** Called once in the root component, so every component below reads the same words and link */
export function provideUi(config: UiConfig) {
    provide(KEY, config);
}

/** Changes part of the config for one subtree and keeps the rest of what the root provided */
export function extendUi(overrides: UiConfig) {
    provide(KEY, { ...inject(KEY, {}), ...overrides });
}

export interface ResolvedUi {
    labels: ComputedRef<UiLabels>;
    link: Component | string;
    navLink: Component | string;
    navigate: (href: string) => void;
    formatNumber: ((value: number, decimals?: number) => string) | undefined;
}

export function useUi(): ResolvedUi {
    const config = inject(KEY, {});

    return {
        labels: computed(() => ({ ...FALLBACK, ...toValue(config.labels ?? {}) })),
        link: config.link ?? 'a',
        navLink: config.navLink ?? config.link ?? 'a',
        navigate: config.navigate ?? ((href) => window.location.assign(href)),
        formatNumber: config.formatNumber,
    };
}
