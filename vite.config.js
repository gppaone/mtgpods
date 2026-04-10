import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		// Listen on LAN so phones/tablets on the same Wi‑Fi can hit the dev server
		host: true
	},
	preview: {
		host: true
	}
});
