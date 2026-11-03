// A button, link or field inside a row or card answers for itself and never for the item around it

const CONTROL =
    'a[href], button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="menuitem"], [contenteditable="true"]';

/** The control inside the item the target belongs to, null when the press landed on the item itself or on a control that opens it */
export function innerControl(target: EventTarget | null, item: Element): HTMLElement | null {
    const control = target instanceof Element ? target.closest<HTMLElement>(CONTROL) : null;
    if (!control || control === item || !item.contains(control) || control.hasAttribute('data-opens-item')) return null;

    return control;
}

/** True when the click started on a control of its own inside the item, so the item must not open */
export const fromInnerControl = (event: Event): boolean =>
    event.currentTarget instanceof Element && innerControl(event.target, event.currentTarget) !== null;
