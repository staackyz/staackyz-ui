<script setup lang="ts">
import { PanelLeft } from 'lucide-vue-next';
import type { Component } from 'vue';
import { useNavDrawer } from '../composables/useNavDrawer';
import { useUi } from '../lib/config';

// The top bar beside the rail, the name of the screen on the left and the app's tools in the slot, the account last
const props = withDefaults(
    defineProps<{
        /** The screen the person is on, never the whole trail, and no screen repeats it in its own body */
        title?: string;
        icon?: Component;
        /** The menu button between md and lg, off for an app with no drawer */
        drawer?: boolean;
    }>(),
    { title: undefined, icon: undefined, drawer: true },
);

const { labels } = useUi();
const nav = useNavDrawer();
</script>

<template>
    <!-- The strip past its right edge is what shows while the content slides beside the rail, the shell clips it off the page -->
    <header
        data-topbar
        class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-card px-3 after:absolute after:-bottom-px after:left-full after:top-0 after:w-64 after:border-b after:bg-card after:content-[''] md:gap-3 md:px-4"
    >
        <!-- Between md and lg only, from lg up the rail's own foot pins it, and the phone navigates by the bottom bar -->
        <button
            v-if="props.drawer"
            type="button"
            data-nav-drawer-trigger
            class="mov-toque hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:flex lg:hidden"
            :aria-label="labels.openMenu"
            :aria-expanded="nav.open.value"
            aria-haspopup="dialog"
            @click="nav.show()"
        >
            <PanelLeft class="mov-icone h-5 w-5" />
        </button>

        <!-- The name steps in from the same side as the screen, keyed so a new name is a new line and the old one leaves at once -->
        <Transition name="mov-titulo" mode="out-in">
            <div :key="props.title" class="flex min-w-0 items-center gap-2">
                <component :is="props.icon" v-if="props.icon" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <h1 class="min-w-0 truncate text-base font-bold" data-topbar-title>{{ props.title }}</h1>
            </div>
        </Transition>
        <!-- Beside the title and not inside it, the title hook reads the screen name alone -->
        <div class="mr-auto flex min-w-0 items-center">
            <slot name="after-title" />
        </div>

        <div class="flex shrink-0 items-center gap-1 md:gap-1.5">
            <slot />
            <slot name="account" />
        </div>
    </header>
</template>
