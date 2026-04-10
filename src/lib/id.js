/**
 * Prefer crypto.randomUUID(); on http://LAN (non–secure contexts) it throws,
 * so we fall back — otherwise Add player silently fails on phones hitting the dev URL.
 */
export function newPlayerId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		try {
			return crypto.randomUUID();
		} catch {
			/* insecure origin */
		}
	}
	return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
}
