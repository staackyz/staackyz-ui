/** Keyboard focus is seen as a fill or a stronger edge, never an outline or a ring, and the shell keeps its keyboard path. Runs via `npm test`. */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

const read = (path) => readFileSync(join(SRC, path), 'utf8');

const files = (folder = '.') =>
    readdirSync(join(SRC, folder), { withFileTypes: true }).flatMap((entry) => {
        const path = folder === '.' ? entry.name : `${folder}/${entry.name}`;
        if (entry.isDirectory()) return files(path);

        return /\.(vue|ts)$/.test(entry.name) ? [path] : [];
    });

// Every row of a floating list, which is where an invisible focus once lived
const FOCUSABLE_ROWS = [
    'ui/dropdown-menu/DropdownMenuItem.vue',
    'ui/dropdown-menu/DropdownMenuCheckboxItem.vue',
    'ui/dropdown-menu/DropdownMenuRadioItem.vue',
    'ui/dropdown-menu/DropdownMenuSubTrigger.vue',
];

describe('focus', () => {
    it('marks every menu row with a fill', () => {
        for (const path of FOCUSABLE_ROWS)
            assert.match(read(path), /(?:focus|focus-visible|data-\[highlighted\]):bg-accent/, `${path} marks focus with no fill`);
    });

    it('never draws focus with a ring or an outline', () => {
        const focusRing =
            /(?<![\w-])(?:[\w\-[\]=&./:()]*:)?[\w\-[\]]*focus[\w\-[\]]*:(?:[\w\-[\]=&./()]+:)*(?:ring(?:-[\w/[\].-]+)?|outline(?:-(?!none\b)[\w/[\].-]+)?)(?![\w-])/;
        const offset = /(?<![\w-])(?:[\w\-[\]=&:]+:)?ring-offset-[\w/[\].-]+/;
        const findings = files().flatMap((path) =>
            read(path)
                .split('\n')
                .flatMap((line, number) => (focusRing.test(line) || offset.test(line) ? [`${path}:${number + 1}`] : [])),
        );

        assert.deepEqual(findings, []);
    });

    it('removes the browser outline and puts a fill floor under every control', () => {
        const css = read('css/base.css');

        assert.match(css, /:focus,\s*:focus-visible\s*\{\s*outline:\s*none;/);
        assert.match(css, /\):focus-visible\s*\{\s*background-color:\s*hsl\(var\(--accent\)\)/);

        for (const [, body] of css.matchAll(/[^{}]*:focus(?:-visible|-within)?[^{}]*\{([^}]*)\}/g)) {
            assert.doesNotMatch(body, /outline:(?!\s*none\s*[;!])[^;]+;|outline-width|--tw-ring/);
        }
    });

    it('gives every theme the field focus edge and fill, light and dark', () => {
        for (const theme of ['blue', 'emerald']) {
            const css = read(`css/themes/${theme}.css`);

            assert.ok((css.match(/--input-focus:/g) ?? []).length >= 2, `${theme} lost a field focus edge`);
            assert.ok((css.match(/--field-focus:/g) ?? []).length >= 2, `${theme} lost a field focus fill`);
        }
    });

    it('keeps the field focus, its height and the focus it hands out on the shared input', () => {
        const input = read('ui/input/Input.vue');

        assert.ok(input.includes('focus-visible:border-input-focus'));
        // A select beside it in a form is h-10 too, a different height reads as a broken row
        assert.ok(input.includes('h-10'));
        // A refused submit moves the focus to the field at fault, which only works when a caller ref reaches the real input
        assert.ok(input.includes('defineExpose('));
        assert.ok(input.includes('focus:'));
        assert.ok(input.includes('ref="el"'));
    });

    it('names every close button with a hidden label from the app words', () => {
        for (const path of ['ui/sheet/SheetContent.vue', 'ui/dialog/DialogSurface.vue']) {
            const source = read(path);

            assert.ok(source.includes('labels.close'), `${path} closes with an icon and no name`);
            assert.ok(source.includes('sr-only'), `${path} has no hidden label`);
            assert.ok(!source.includes('>Close<'), `${path} hard-codes the English word`);
        }
    });
});

describe('the keyboard path of the shell', () => {
    it('opens with a skip link that comes before the bar and shows itself on focus', () => {
        const shell = read('components/AppShell.vue');
        const link = shell.indexOf('href="#main-content"');
        const topbar = shell.indexOf('<slot name="topbar"');

        assert.ok(link >= 0 && topbar >= 0 && link < topbar, 'the skip link stopped being the first focusable node');
        assert.ok(shell.includes('labels.skipToContent'));
        assert.match(shell, /\bsr-only\b/);
        assert.ok(shell.includes('focus:not-sr-only'));
        assert.ok(shell.includes('focus:bg-primary'));
    });

    it('names the navigation and says which item is the current page', () => {
        const list = read('components/NavList.vue');

        assert.ok(list.includes(':aria-label="labels.mainNavigation"'));
        assert.ok(list.includes(':aria-current="isCurrent(item) ? \'page\' : undefined"'));
        assert.ok(list.includes('itemClass(item)'), 'the colour and the announcement stopped reading the same source');
    });

    it('lets the rail button say what it controls and whether it is pinned', () => {
        const rail = read('components/NavRail.vue');

        for (const snippet of ['id="nav-rail"', 'aria-controls="nav-rail"', ':aria-expanded="rail.expanded.value"', ':aria-label="pinLabel"']) {
            assert.ok(rail.includes(snippet), snippet);
        }
    });

    it('lets the drawer button say whether the drawer is open', () => {
        const topbar = read('components/ShellTopbar.vue');

        assert.ok(topbar.includes(':aria-expanded="nav.open.value"'));
        assert.ok(topbar.includes('aria-haspopup="dialog"'));
    });

    it('keeps the list row reachable and activatable by keyboard, the grammar every board card copies', () => {
        const row = read('components/ListRow.vue');

        for (const snippet of ['role="button"', 'tabindex="0"', '@keydown.enter', '@keydown.space']) assert.ok(row.includes(snippet), snippet);

        for (const [handler] of row.matchAll(/@keydown\.(enter|space)[^=]*=/g))
            assert.ok(handler.includes('.self'), `${handler} fires from a control inside the row`);
    });
});
