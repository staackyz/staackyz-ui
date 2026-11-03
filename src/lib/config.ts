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
    /** How a pick in the phone sheet leaves for a screen, router.visit in an Inertia app */
    navigate?: (href: string) => void;
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

export interface ResolvedUi {
    labels: ComputedRef<UiLabels>;
    link: Component | string;
    navigate: (href: string) => void;
}

export function useUi(): ResolvedUi {
    const config = inject(KEY, {});

    return {
        labels: computed(() => ({ ...FALLBACK, ...toValue(config.labels ?? {}) })),
        link: config.link ?? 'a',
        navigate: config.navigate ?? ((href) => window.location.assign(href)),
    };
}
