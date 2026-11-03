<script setup lang="ts">
import { watch } from 'vue';
import { useNavDrawer } from '../composables/useNavDrawer';
import { useNavRail } from '../composables/useNavRail';
import { useUi } from '../lib/config';
import type { ShellNav } from '../lib/nav';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../ui/sheet';
import NavList from './NavList.vue';

// The list over the content, opened from the top bar between md and lg where the rail does not pin
const props = defineProps<{
    nav: ShellNav;
    currentPath: string;
    pending?: Record<string, number>;
    collapseKey?: string;
    currentHref?: string | null;
}>();

const { labels } = useUi();
const drawer = useNavDrawer();
const rail = useNavRail();

// Navigating closes it, whether the click came from here or from anywhere else
watch(
    () => props.currentPath,
    () => drawer.close(),
);

// Widening the window hands the list to the rail
watch(rail.docks, (docks) => {
    if (docks) drawer.close();
});
</script>

<template>
    <Sheet v-model:open="drawer.open.value">
        <SheetContent side="left" data-nav-drawer class="flex w-[min(20rem,86vw)] flex-col gap-0 bg-card p-0 sm:max-w-none">
            <SheetTitle class="sr-only">{{ labels.menuTitle }}</SheetTitle>
            <SheetDescription class="sr-only">{{ labels.menuDescription }}</SheetDescription>

            <NavList
                :nav="nav"
                :current-path="currentPath"
                :current-href="currentHref"
                :pending="pending"
                :collapse-key="collapseKey"
                variant="drawer"
                @navigate="drawer.close()"
            >
                <template #mark><slot name="mark" /></template>
                <template #brand><slot name="brand" /></template>
                <template v-if="$slots.footer" #footer><slot name="footer" /></template>
            </NavList>
        </SheetContent>
    </Sheet>
</template>
