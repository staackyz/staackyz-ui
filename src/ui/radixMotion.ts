// The reka boxes need animations and not transitions, and they slide instead of growing so the text lands sharp

export const radixEnter =
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:[animation-duration:var(--mov-medio)] data-[state=closed]:[animation-duration:var(--mov-curto)] [animation-timing-function:var(--mov-chegada)] motion-reduce:!animate-none';

/** Fades only, since the overlay has no shape to grow from */
export const radixOverlay = `${radixEnter} data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0`;

/** Away from the side it opened on, so the box comes out of its trigger */
const slideFromTrigger =
    'data-[side=bottom]:[--tw-enter-translate-y:calc(var(--mov-desliza)*-1)] data-[side=top]:[--tw-enter-translate-y:var(--mov-desliza)] data-[side=right]:[--tw-enter-translate-x:calc(var(--mov-desliza)*-1)] data-[side=left]:[--tw-enter-translate-x:var(--mov-desliza)]';

/** The layer stays on the GPU after it lands, so the last frame and the resting one are painted the same way */
export const radixPopIn = `${radixOverlay} ${slideFromTrigger} will-change-transform`;

/** Radix marks tooltips delayed-open or instant-open, so data-[state=open] never fires */
export const radixTooltipPopIn = `animate-in fade-in-0 [animation-duration:var(--mov-medio)] [animation-timing-function:var(--mov-chegada)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:[animation-duration:var(--mov-curto)] motion-reduce:!animate-none ${slideFromTrigger} will-change-transform`;
