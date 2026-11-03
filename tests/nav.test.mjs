/** The lit item and the lit hub follow the longest path that claims the screen. Runs via `npm test`. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { covers, normalizePath, phoneNavAt, toggleCollapsed } from '../src/lib/nav.ts';

const item = (href, claims = [href], extra = {}) => ({ title: href, href, claims, ...extra });

describe('paths', () => {
    it('drops the host, the query, the hash and the trailing slash', () => {
        assert.equal(normalizePath('https://life.test/tasks/?q=1#top'), '/tasks');
        assert.equal(normalizePath(''), '/');
    });

    it('lets the home match only itself', () => {
        assert.equal(covers('/', '/tasks'), false);
        assert.equal(covers('/tasks', '/tasks/7'), true);
        assert.equal(covers('/task', '/tasks'), false);
    });
});

describe('phoneNavAt', () => {
    const hubs = [
        { key: 'home', title: 'Home', icon: 'svg', items: [item('/', ['/'], { exact: true })] },
        { key: 'work', title: 'Work', icon: 'svg', items: [item('/tasks'), item('/tasks/archive')] },
        { key: 'account', title: 'Account', icon: 'svg', items: [item('/settings', ['/settings', '/company/plan'])] },
    ];

    it('lights the hub whose claim is the longest', () => {
        assert.equal(phoneNavAt(hubs, '/tasks/archive/3').currentHref, '/tasks/archive');
        assert.equal(phoneNavAt(hubs, '/company/plan').active.key, 'account');
    });

    it('lights nothing for a screen no hub claims, and the home only on itself', () => {
        assert.equal(phoneNavAt(hubs, '/wall').active, null);
        assert.equal(phoneNavAt(hubs, '/').active.key, 'home');
    });
});

describe('folded groups', () => {
    it('toggles a group and keeps going when storage is blocked', () => {
        const blocked = {
            getItem: () => null,
            setItem: () => {
                throw new Error('blocked');
            },
            removeItem: () => {},
        };

        const folded = toggleCollapsed(blocked, 'key', new Set(), 'work');
        assert.deepEqual([...folded], ['work']);
        assert.deepEqual([...toggleCollapsed(blocked, 'key', folded, 'work')], []);
    });
});
