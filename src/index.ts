export { provideUi, useUi, type ResolvedUi, type UiConfig, type UiLabels } from './lib/config';
export { fromInnerControl, innerControl } from './lib/innerControl';
export {
    STAGGER_CAP,
    arrivalEasing,
    countEasing,
    forgetSeenItems,
    playEntrancesOnce,
    railClock,
    reducedMotion,
    sheetDuration,
    sheetNumber,
    sheetToken,
    staggeredEntrance,
    vEnter,
    vEnterOnView,
    type EnterBinding,
    type EntranceOptions,
    type EntranceVariant,
} from './lib/motion';
export {
    covers,
    normalizePath,
    phoneNavAt,
    readCollapsed,
    toggleCollapsed,
    type NavGroup,
    type NavItem,
    type NavShortcut,
    type PhoneHub,
    type PhoneHubItem,
    type PhoneNav,
    type ShellNav,
} from './lib/nav';
export { DEFAULT_ITEM_ATTRIBUTES, createSeenItems, itemKey, type SeenItems } from './lib/seenItems';
export { cn } from './lib/utils';

export { useCountUp, type CountUpOptions } from './composables/useCountUp';
export { useEntranceQueue } from './composables/useEntranceQueue';
export { useJustChanged } from './composables/useJustChanged';
export { useNavDrawer } from './composables/useNavDrawer';
export { RAIL_FULL_PX, RAIL_PX, useNavRail } from './composables/useNavRail';
export { useStatValue, type StatValueProps } from './composables/useStatValue';

export * from './ui/avatar';
export * from './ui/button';
export * from './ui/card';
export * from './ui/checkbox';
export * from './ui/collapsible';
export * from './ui/dialog';
export * from './ui/dropdown-menu';
export * from './ui/input';
export * from './ui/label';
export { radixEnter, radixOverlay, radixPopIn, radixTooltipPopIn } from './ui/radixMotion';
export * from './ui/separator';
export * from './ui/sheet';
export * from './ui/skeleton';
export * from './ui/tabs';
export * from './ui/tooltip';

export { default as AppShell } from './components/AppShell.vue';
export { default as BottomNav } from './components/BottomNav.vue';
export { default as EmptyState } from './components/EmptyState.vue';
export { default as KpiFrame } from './components/KpiFrame.vue';
export { default as ListRow } from './components/ListRow.vue';
export { default as ListRowLink } from './components/ListRowLink.vue';
export { default as NavDrawer } from './components/NavDrawer.vue';
export { default as NavList } from './components/NavList.vue';
export { default as NavRail } from './components/NavRail.vue';
export { default as PageHeader } from './components/PageHeader.vue';
export { default as PeriodDelta, type DeltaDirection, type DeltaWords } from './components/PeriodDelta.vue';
export { default as PhoneHubSheet } from './components/PhoneHubSheet.vue';
export { default as ScreenFrame } from './components/ScreenFrame.vue';
export { default as ScreenSkeleton, type SkeletonShape } from './components/ScreenSkeleton.vue';
export { default as ShellTopbar } from './components/ShellTopbar.vue';
export { default as StatCard } from './components/StatCard.vue';
