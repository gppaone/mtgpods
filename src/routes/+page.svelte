<script>
    import { players, lockedGroups, currentPods, history, podSize } from '$lib/store.svelte.js';
    import { generatePods } from '$lib/podLogic.js';
    import { newPlayerId } from '$lib/id.js';

    let newName = $state('');
    let lockSelection = $state(/** @type {string[]} */ ([]));
    let activeTab = $state('players');

    function addPlayer() {
        const name = newName.trim();
        if (!name) return;
        players.push({ id: newPlayerId(), name });
        newName = '';
    }

    /** @param {string} id */
    function removePlayer(id) {
        const idx = players.findIndex(p => p.id === id);
        if (idx !== -1) players.splice(idx, 1);
        for (let i = lockedGroups.length - 1; i >= 0; i--) {
            lockedGroups[i] = lockedGroups[i].filter(lid => lid !== id);
            if (lockedGroups[i].length < 2) lockedGroups.splice(i, 1);
        }
    }

    function removeAllPlayers() {
        players.splice(0, players.length);
        lockedGroups.splice(0, lockedGroups.length);
        currentPods.splice(0, currentPods.length);
        history.splice(0, history.length);
    }

    function addLockGroup() {
        if (lockSelection.length < 2) return;
        for (let i = lockedGroups.length - 1; i >= 0; i--) {
            if (lockSelection.some(id => lockedGroups[i].includes(id)))
            lockedGroups.splice(i, 1);
        }
        lockedGroups.push([...lockSelection]);
        lockSelection = [];
    }

    /** @param {number} i */
    function removeLockGroup(i) {
        lockedGroups.splice(i, 1);
    }

    function rollPods() {
        if (players.length < 2) return;
        const pods = generatePods(players, lockedGroups, podSize.value);
        if (currentPods.length > 0) {
            history.unshift({ date: new Date().toLocaleString(), pods: [...currentPods] });
            if (history.length > 20) history.pop();
        }
        currentPods.splice(0, currentPods.length, ...pods);
        activeTab = 'pods';
    }

    /** @param {string} id */
    function toggleLockSelect(id) {
        const i = lockSelection.indexOf(id);
        lockSelection = i === -1 ? [...lockSelection, id] : lockSelection.filter(x => x !== id);
    }

    const podColors = [
        'bg-violet-100 border-violet-300 dark:bg-violet-950/50 dark:border-violet-700',
        'bg-emerald-100 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-700',
        'bg-orange-100 border-orange-300 dark:bg-orange-950/50 dark:border-orange-700',
        'bg-pink-100 border-pink-300 dark:bg-pink-950/50 dark:border-pink-700',
        'bg-sky-100 border-sky-300 dark:bg-sky-950/50 dark:border-sky-700',
        'bg-amber-100 border-amber-300 dark:bg-amber-950/50 dark:border-amber-700',
    ];
</script>

<main class="max-w-xl mx-auto px-4 py-8 font-sans">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">MTG Pod Manager</h1>
        <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Pod size</span>
            {#each [2, 3, 4] as n}
            <button
                onclick={() => podSize.value = n}
                class="w-9 h-9 rounded-lg border text-sm font-medium transition-colors
                {podSize.value === n
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-violet-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-violet-500'}"
            >{n}</button>
            {/each}
        </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
        {#each ['players', 'locks', 'pods', 'history'] as tab}
            <button
            onclick={() => activeTab = tab}
            class="px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors
                {activeTab === tab
                ? 'border-violet-600 text-violet-700 dark:text-violet-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
            >
            {tab}{tab === 'players' ? ` (${players.length})` : tab === 'pods' && currentPods.length ? ` (${currentPods.length})` : ''}
            </button>
        {/each}
    </div>
    <!-- Players tab -->
    {#if activeTab === 'players'}
        <div class="flex gap-2 mb-4">
            <input
                bind:value={newName}
                onkeydown={e => e.key === 'Enter' && addPlayer()}
                placeholder="Player name"
                class="min-w-0 flex-1 px-3 py-3 border border-gray-300 rounded-lg text-[16px] bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            <button
                type="button"
                onclick={addPlayer}
                class="shrink-0 touch-manipulation px-5 py-3 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 active:bg-violet-800 transition-colors"
            >Add</button>
        </div>

        <ul class="divide-y divide-gray-100 dark:divide-gray-800">
            {#each players as p}
            <li class="flex items-center py-2.5">
                <span class="flex-1 text-sm text-gray-800 dark:text-gray-200">{p.name}</span>
                <button
                onclick={() => removePlayer(p.id)}
                class="text-xs text-orange-600 hover:text-orange-500 border border-orange-200 hover:border-orange-400 px-2.5 py-1 rounded-md transition-colors dark:border-red-800 dark:text-white dark:bg-red-900 dark:hover:border-orange-600"
                >Remove</button>
            </li>
            {/each}
        </ul>

        {#if players.length >= 2}
            <button
            onclick={rollPods}
            class="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
            >Roll pods →</button>
        {/if}
        {#if players.length > 0}
        <div class="flex justify-end mb-3 border-t border-gray-200 dark:border-gray-700 mt-3">
            <button
            onclick={removeAllPlayers}
            class="mt-3 w-full py-3 bg-gray-300 hover:bg-gray-400 text-slate-700 hover:text-white font-semibold rounded-xl transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >Remove all players</button>
        </div>
        {/if}
    <!-- Locks tab -->
    {:else if activeTab === 'locks'}
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Select 2–3 players who should always share a pod.</p>
    
        <ul class="divide-y divide-gray-100 dark:divide-gray-800 mb-4">
            {#each players as p}
            <li class="py-1.5">
                <button type="button" onclick={() => toggleLockSelect(p.id)} class="flex w-full text-left py-2.5 cursor-pointer rounded-lg px-2 transition-colors
                {lockSelection.includes(p.id) ? 'bg-violet-50 dark:bg-violet-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800/80'}">
                    <span class="flex-1 text-sm text-gray-800 dark:text-gray-200">{p.name}</span>
                    {#if lockSelection.includes(p.id)}
                    <span class="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">selected</span>
                    {/if}
                </button>
            </li>
            {/each}
        </ul>
    
        {#if lockSelection.length >= 2}
            <button
            onclick={addLockGroup}
            class="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
            >Lock these {lockSelection.length} together</button>
        {/if}

        {#if lockedGroups.length > 0}
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-2">Locked groups</h3>
            <ul class="space-y-2">
            {#each lockedGroups as group, i}
                <li class="flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    {group.map(id => players.find(p => p.id === id)?.name ?? '?').join(' + ')}
                </span>
                <button
                    onclick={() => removeLockGroup(i)}
                    class="text-xs text-orange-600 hover:text-orange-500 border border-orange-200 hover:border-orange-400 px-2.5 py-1 rounded-md transition-colors dark:border-orange-800 dark:text-orange-400 dark:hover:border-orange-600"
                >Remove</button>
                </li>
            {/each}
            </ul>
        {/if}

    <!-- Pods tab -->
    {:else if activeTab === 'pods'}
        {#if currentPods.length === 0}
            <p class="text-sm text-gray-400 dark:text-gray-500">No pods yet — add players and click "Roll pods".</p>
        {:else}
        <div>
            {#each currentPods as pod, i}
                <div class="rounded-xl border-2 p-4 mb-3 {podColors[i % podColors.length]}">
                <p class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Pod {i + 1}</p>
                {#each pod as player}
                    <p class="text-sm text-gray-800 dark:text-gray-100 py-0.5">{player.name}</p>
                {/each}
                </div>
            {/each}
        </div>
        <button
            onclick={rollPods}
            class="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
        >New round →</button>
    {/if}

    <!-- History tab -->
    {:else if activeTab === 'history'}
    {#if history.length === 0}
        <p class="text-sm text-gray-400 dark:text-gray-500">No history yet.</p>
    {:else}
        <div class="flex justify-end mb-3">
            <button
            onclick={() => history.splice(0, history.length)}
                class="text-xs text-orange-600 hover:text-orange-500 border border-orange-200 hover:border-orange-400 px-2.5 py-1 rounded-md transition-colors dark:border-red-800 dark:text-white dark:bg-red-900 dark:hover:border-orange-600"
            >Clear history</button>
        </div>
        <div class="space-y-3">
            {#each history as round, r}
                <details class="group">
                <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 py-2 list-none flex justify-between items-center">
                    <span>Round {history.length - r} — {round.date}</span>
                    <span class="text-gray-400 dark:text-gray-500 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    {#each round.pods as pod, i}
                    <div class="rounded-lg border p-3 {podColors[i % podColors.length]}">
                        <p class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Pod {i + 1}</p>
                        {#each pod as player}
                        <p class="text-sm text-gray-700 dark:text-gray-200">{player.name}</p>
                        {/each}
                    </div>
                    {/each}
                </div>
                </details>
            {/each}
            </div>
        {/if}
    {/if}

</main>