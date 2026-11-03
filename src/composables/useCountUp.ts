import { computed, getCurrentInstance, onUnmounted, ref, watch, type ComputedRef, type Ref } from 'vue';
import { countEasing, reducedMotion, sheetDuration } from '../lib/motion';

// Counting is script and not a CSS class because CSS cannot interpolate an element's content

/** The eye does not read a hundred numbers, and the cap is what holds the price on a weak machine */
const STEPS_PER_SECOND = 30;

export interface CountUpOptions {
    /** Zero for counts and two for money, or the cents would only appear on the last frame */
    decimals?: number;
    /** Turn it off where a zero would lie for an instant, like a balance being checked against paper */
    fromZero?: boolean;
    /** Without this, text is the raw number */
    format?: (value: number) => string;
}

const round = (n: number, decimals: number) => {
    const factor = 10 ** decimals;

    return Math.round(n * factor) / factor;
};

/** Holds the one frame in flight, since starting a new count has to cancel the old */
function frameSlot() {
    let frame: number | null = null;

    return {
        next: (step: (now: number) => void) => (frame = requestAnimationFrame(step)),
        done: () => (frame = null),
        clear: () => {
            if (frame === null) return;
            cancelAnimationFrame(frame);
            frame = null;
        },
    };
}

type FrameSlot = ReturnType<typeof frameSlot>;

/** Walks from start to target, handing each painted value to emit */
function countFrames(slot: FrameSlot, start: number, target: number, emit: (value: number) => void) {
    const duration = sheetDuration('--mov-conta', 1100);
    const began = performance.now();
    let lastSlice = -1;

    const step = (now: number) => {
        const t = Math.min((now - began) / duration, 1);

        if (t >= 1) {
            slot.done();
            emit(target);

            return;
        }

        // Paint only when the slice changed, which is what cuts the work for Vue and the browser
        const slice = Math.floor((t * duration * STEPS_PER_SECOND) / 1000);

        if (slice !== lastSlice) {
            lastSlice = slice;
            emit(start + (target - start) * countEasing(t));
        }

        slot.next(step);
    };

    slot.next(step);
}

/** The two ways a number can reach the screen, being there at once or counting up to it */
function makeCounter(value: Ref<number>, decimals: number) {
    const slot = frameSlot();
    const emit = (n: number) => (value.value = round(n, decimals));

    const jump = (target: number) => {
        slot.clear();
        emit(target);
    };

    const count = (target: number) => {
        slot.clear();
        if (target === value.value) return;

        countFrames(slot, value.value, target, emit);
    };

    return { jump, count, stop: slot.clear };
}

/** Reduced motion, or a hidden tab that composes no frames, both mean the number simply has to be there */
const noFrames = () => reducedMotion() || (typeof document !== 'undefined' && document.hidden) || typeof requestAnimationFrame === 'undefined';

export function useCountUp(source: () => number | null | undefined, options: CountUpOptions = {}): { value: Ref<number>; text: ComputedRef<string> } {
    const { decimals = 0, fromZero = true, format } = options;

    const value = ref(0);
    const counter = makeCounter(value, decimals);

    /** False until the first read, which is the only one allowed to rise from zero */
    let read = false;

    watch(
        source,
        (next) => {
            const target = typeof next === 'number' && Number.isFinite(next) ? next : 0;
            const first = !read && !fromZero;
            read = true;

            if (first || noFrames()) counter.jump(target);
            else counter.count(target);
        },
        { immediate: true },
    );

    if (getCurrentInstance()) onUnmounted(counter.stop);

    const text = computed(() => (format ? format(value.value) : String(value.value)));

    return { value, text };
}
