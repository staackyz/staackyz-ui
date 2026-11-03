<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import { useUi } from '../lib/config';
import { Card, CardContent } from '../ui/card';

/**
 * The one anatomy of a number card, a small caps label on top, the number and an optional note under it.
 * Money is mono and a count is Manrope tabular, so the eye tells the two apart before reading the label
 */
const props = withDefaults(
    defineProps<{
        label: string;
        href?: string;
        /** Size and tone of the number, the screen decides both */
        valueClass?: string;
        money?: boolean;
        /** Only what does not count up swaps, since counting up to a dash is not counting */
        swapKey?: string;
        /** The full value for a tooltip when the number truncates */
        title?: string;
    }>(),
    { href: undefined, valueClass: 'text-2xl', money: false, swapKey: '', title: undefined },
);

const { link } = useUi();
</script>

<template>
    <component :is="props.href ? link : 'div'" :href="props.href" class="group block h-full rounded-lg" data-kpi-frame>
        <!-- mov-cartao only where the card leads somewhere, a number that sinks promises a click that does not exist -->
        <Card class="h-full" :class="props.href ? 'mov-cartao group-hover:border-primary group-focus-visible:border-primary' : ''">
            <CardContent class="flex h-full flex-col px-5 py-4">
                <div class="flex items-center justify-between gap-2">
                    <p class="ui-label min-w-0 truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground" data-kpi-label>
                        {{ props.label }}
                    </p>
                    <!-- The arrow is the only sign the card leads somewhere, and the phone is where nothing else says so -->
                    <ChevronRight v-if="props.href" class="mov-icone h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
                <div class="mt-1 flex items-end justify-between gap-3">
                    <Transition name="mov-troca" mode="out-in">
                        <p
                            :key="props.swapKey"
                            class="min-w-0 truncate font-extrabold tabular-nums leading-tight"
                            :class="[props.valueClass, props.money ? 'font-mono' : '']"
                            :title="props.title"
                            data-kpi-value
                        >
                            <slot />
                        </p>
                    </Transition>
                    <slot name="aside" />
                </div>
                <slot name="note" />
            </CardContent>
        </Card>
    </component>
</template>
