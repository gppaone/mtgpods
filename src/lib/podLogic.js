/**
 * @typedef {{ id: string, name: string }} Player
 */

/**
 * @param {Player[]} players
 * @param {string[][]} lockedGroups
 * @param {number} podSize
 * @returns {Player[][]}
 */
export function generatePods(players, lockedGroups, podSize) {
    const lockedIds = new Set(lockedGroups.flat());
    const freePlayers = players.filter(p => !lockedIds.has(p.id));

    const shuffled = [...freePlayers].sort(() => Math.random() - 0.5);
    const shuffledGroups = [...lockedGroups].sort(() => Math.random() - 0.5);

    // Build units: locked groups first, then solo free players
    const units = [
        ...shuffledGroups.map(ids => ids.map(id => players.find(p => p.id === id))),
        ...shuffled.map(p => [p])
    ].sort(() => Math.random() - 0.5);

    // Flatten units into a single ordered player list (drop missing IDs from stale lock data)
    const ordered = units.flat().filter((p) => p !== undefined);
    const total = ordered.length;

    if (total === 0) return [];

    // Use enough pods that everyone is seated: ceil(total / podSize). Then split
    // counts as evenly as possible (e.g. 11 @ target 4 → 4+4+3). The old
    // floor(total/podSize) + spread (total % podSize) broke when remainder
    // exceeded pod count (e.g. two pods of 5 = 10, dropping one player).
    const numPods = Math.ceil(total / podSize);
    const baseSize = Math.floor(total / numPods);
    const extra = total % numPods;
    const sizes = Array.from({ length: numPods }, (_, i) => baseSize + (i < extra ? 1 : 0));

    // Slice ordered players into pods of the computed sizes
    const pods = [];
    let cursor = 0;
    for (const size of sizes) {
        pods.push(ordered.slice(cursor, cursor + size));
        cursor += size;
    }

    return pods;
}