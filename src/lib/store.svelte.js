import { browser } from '$app/environment';

/**
 * @typedef {{ id: string, name: string }} Player
 * @typedef {{ date: string, pods: Player[][] }} HistoryRound
 */

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function load(key, fallback) {
    if (!browser) return fallback;
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) ?? fallback;
    } catch {
        return fallback;
    }
}

/**
 * @param {string} key
 * @param {unknown} val
 */
function save(key, val) {
    if (browser) localStorage.setItem(key, JSON.stringify(val));
}

export const players = $state(load('players', /** @type {Player[]} */ ([])));
export const lockedGroups = $state(load('lockedGroups', /** @type {string[][]} */ ([])));
export const currentPods = $state(load('currentPods', /** @type {Player[][]} */ ([])));
export const history = $state(load('history', /** @type {HistoryRound[]} */ ([])));
export const podSize = $state({ value: load('podSize', 4) });

// Auto-persist whenever state mutates
$effect.root(() => {
    $effect(() => { save('players', players); });
    $effect(() => { save('lockedGroups', lockedGroups); });
    $effect(() => { save('currentPods', currentPods); });
    $effect(() => { save('history', history); });
    $effect(() => { save('podSize', podSize.value); });
});