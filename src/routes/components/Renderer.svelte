<script lang="ts">
	import parse from '../lib/parser';
	import docx from '../lib/docx';
	import download from '../lib/download';
	import { onMount } from 'svelte';

	type Entry = { id: number; name: string; state: 'busy' | 'ok' | 'error'; message: string };

	let files: FileList;
	let entries: Entry[] = [];
	let dragging = false;
	let nextId = 1;
	let stars: number | null = null;

	const REPO_URL = 'https://github.com/willuhmjs/Quizlet-Exporter';

	onMount(async () => {
		try {
			const res = await fetch('https://api.github.com/repos/willuhmjs/Quizlet-Exporter');
			if (!res.ok) return;
			const data = await res.json();
			if (typeof data?.stargazers_count === 'number') stars = data.stargazers_count;
		} catch {
			// offline or rate limited; the button works without the count
		}
	});

	const isHtml = (f: File) => /\.x?html?$/i.test(f.name) || f.type === 'text/html';

	function update(entryId: number, state: Entry['state'], message: string) {
		entries = entries.map((e) => (e.id === entryId ? { ...e, state, message } : e));
	}

	async function createDocx(file: File) {
		const entry: Entry = { id: nextId++, name: file.name, state: 'busy', message: 'Exporting…' };
		entries = [entry, ...entries];
		try {
			if (!isHtml(file)) throw new Error('not an HTML file');
			const parsedData = await parse(file);
			if (parsedData.length === 0) {
				throw new Error(
					'no cards found. Save the Quizlet study set page itself (Ctrl/Cmd+S, "Webpage, HTML Only") while the set is open.'
				);
			}
			const fileBlob = await docx(parsedData);
			download(fileBlob, file.name.replace(/\.x?html?$/i, '.docx'));
			update(
				entry.id,
				'ok',
				`exported ${parsedData.length} card${parsedData.length === 1 ? '' : 's'}`
			);
		} catch (error) {
			update(entry.id, 'error', `failed: ${error}`);
		}
	}

	function handleFiles(list: FileList | File[]) {
		for (const file of Array.from(list)) createDocx(file);
	}

	function onFileChange() {
		if (files && files.length > 0) handleFiles(files);
	}

	function onDrop(event: DragEvent) {
		dragging = false;
		if (event.dataTransfer?.files.length) handleFiles(event.dataTransfer.files);
	}
	function openPicker(e: MouseEvent) {
		const target = e.target as HTMLElement | null;
		if (target && target.tagName === 'INPUT') return;
		(e.currentTarget as HTMLElement).querySelector('input')?.click();
	}

	function openPickerFromKey(e: KeyboardEvent) {
		if (e.key === 'Enter')
			(e.currentTarget as HTMLElement).querySelector('input')?.click();
	}
</script>

<div class="page">
	<header>
		<div class="brand">
			<span class="brand-dot" aria-hidden="true"></span>
			<span class="brand-name">Quizlet Exporter</span>
		</div>
		<a
			class="gh-link"
			href={REPO_URL}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Star Quizlet-Exporter on GitHub"
		>
			<svg class="star-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.4 1.15 6.8L12 17.25 6.1 20.5l1.15-6.8L2.5 9.3l6.6-1.04L12 2z" />
			</svg>
			Star{#if stars !== null}<span class="star-count">{stars}</span>{/if}
		</a>
	</header>

	<main>
		<h1>Quizlet to Word, in one drop.</h1>
		<p class="sub">
			Save a Quizlet study set page, drop the HTML file here, and get a clean DOCX table of every
			term and definition. Nothing is uploaded anywhere. It all happens in your browser.
		</p>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="dropzone"
			class:dragging
			role="button"
			tabindex="0"
			aria-label="Upload Quizlet HTML file"
			on:click={openPicker}
			on:keydown={openPickerFromKey}
			on:dragover|preventDefault={() => (dragging = true)}
			on:dragleave={() => (dragging = false)}
			on:drop|preventDefault={onDrop}
		>
			<input
				accept=".html,.htm,.xhtml"
				bind:files
				name="html"
				type="file"
				multiple
				on:change={onFileChange}
			/>
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke-linecap="round" />
			</svg>
			<span class="drop-title">Drop your saved Quizlet page</span>
			<span class="drop-hint">or click to browse · .html, .htm · multiple files welcome</span>
		</div>

		{#if entries.length > 0}
			<ul class="results" aria-live="polite">
				{#each entries as entry (entry.id)}
					<li class={entry.state}>
						<span class="dot" aria-hidden="true"></span>
						<span class="file">{entry.name}</span>
						<span class="msg">{entry.message}</span>
					</li>
				{/each}
			</ul>
		{/if}

		<ol class="steps">
			<li>
				<span class="step-num">01</span>
				<h3>Open the study set</h3>
				<p>Go to the Quizlet page with the flashcards you want.</p>
			</li>
			<li>
				<span class="step-num">02</span>
				<h3>Save the page</h3>
				<p>Press <kbd>Ctrl/Cmd + S</kbd> and choose "Webpage, HTML Only".</p>
			</li>
			<li>
				<span class="step-num">03</span>
				<h3>Drop it above</h3>
				<p>Your <kbd>.docx</kbd> downloads instantly. Every card, one tidy table.</p>
			</li>
		</ol>

		<div class="cta">
			<p>Useful? A star helps other students stumble onto this instead of another paywalled exporter.</p>
			<a
				class="star-btn"
				href={REPO_URL}
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg class="star-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.4 1.15 6.8L12 17.25 6.1 20.5l1.15-6.8L2.5 9.3l6.6-1.04L12 2z" />
				</svg>
				Star on GitHub{#if stars !== null}<span class="star-count">{stars}</span>{/if}
			</a>
		</div>
	</main>

	<footer>
		<span>Free and open source · MIT · runs entirely client-side</span>
		<a href="https://github.com/willuhmjs/Quizlet-Exporter/issues" rel="noopener">Found a bug?</a>
	</footer>
</div>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: 0 24px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.brand-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #5e6ad2;
		box-shadow: 0 0 12px rgba(113, 112, 255, 0.8);
	}

	.brand-name {
		font-size: 14px;
		font-weight: 510;
		color: #f7f8f8;
		letter-spacing: -0.13px;
	}

	.gh-link {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 13px;
		font-weight: 510;
		color: #8a8f98;
		text-decoration: none;
		padding: 5px 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.02);
		transition: color 0.15s, background 0.15s;
	}

	.gh-link:hover {
		color: #f7f8f8;
		background: rgba(255, 255, 255, 0.05);
	}

	.gh-link:hover .star-icon {
		color: #828fff;
	}

	.star-icon {
		color: #5e6ad2;
		flex-shrink: 0;
	}

	.star-count {
		font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12px;
		padding: 0 6px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.06);
	}

	.cta {
		margin-top: 48px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
	}

	.cta p {
		font-size: 14px;
		color: #8a8f98;
		max-width: 420px;
		line-height: 1.55;
	}

	.star-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 510;
		color: #828fff;
		text-decoration: none;
		padding: 9px 18px;
		border-radius: 6px;
		background: rgba(94, 106, 210, 0.08);
		border: 1px solid rgba(130, 143, 255, 0.35);
		transition: background 0.15s, box-shadow 0.15s, color 0.15s;
	}

	.star-btn:hover {
		background: rgba(94, 106, 210, 0.22);
		color: #f7f8f8;
		box-shadow: 0 0 20px rgba(113, 112, 255, 0.25);
	}

	.star-btn .star-icon {
		color: currentColor;
	}

	.star-btn .star-count {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #d0d6e0;
	}

	main {
		flex: 1;
		padding: 72px 0 48px;
	}

	h1 {
		font-size: clamp(34px, 6vw, 52px);
		font-weight: 510;
		line-height: 1.02;
		letter-spacing: -1.2px;
		text-align: center;
	}

	.sub {
		margin: 18px auto 44px;
		max-width: 520px;
		font-size: 16px;
		line-height: 1.6;
		letter-spacing: -0.165px;
		color: #8a8f98;
		text-align: center;
	}

	.dropzone {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 56px 24px;
		border: 1px dashed rgba(130, 143, 255, 0.3);
		border-radius: 12px;
		background: rgba(94, 106, 210, 0.04);
		color: #8a8f98;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
		outline: none;
	}

	.dropzone:hover,
	.dropzone:focus-visible,
	.dropzone.dragging {
		border-color: rgba(130, 143, 255, 0.55);
		background: rgba(94, 106, 210, 0.06);
		box-shadow: 0 0 0 4px rgba(94, 106, 210, 0.08);
	}

	.dropzone.dragging svg {
		color: #828fff;
		transform: translateY(-3px);
	}

	.dropzone svg {
		color: #5e6ad2;
		transition: transform 0.15s, color 0.15s;
	}

	.dropzone input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.drop-title {
		font-size: 16px;
		font-weight: 510;
		color: #d0d6e0;
		letter-spacing: -0.165px;
		pointer-events: none;
	}

	.drop-hint {
		font-size: 13px;
		color: #62666d;
		pointer-events: none;
	}

	.results {
		list-style: none;
		margin-top: 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.results li {
		display: grid;
		grid-template-columns: 7px minmax(0, 38%) minmax(0, 1fr);
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.02);
		font-size: 14px;
	}

	.results .dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #62666d;
	}

	.results .ok .dot {
		background: #10b981;
		box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
	}

	.results .error .dot {
		background: #f2555a;
		box-shadow: 0 0 8px rgba(242, 85, 90, 0.5);
	}

	.results .busy .dot {
		animation: pulse 1s ease-in-out infinite;
	}

	.results .file {
		font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13px;
		color: #f7f8f8;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.results .msg {
		color: #8a8f98;
		overflow-wrap: anywhere;
	}

	.results .ok .msg {
		color: #10b981;
	}

	.results .error .msg {
		color: #f2555a;
	}

	@keyframes pulse {
		50% {
			opacity: 0.3;
		}
	}

	.steps {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-top: 56px;
	}

	.steps li {
		padding: 20px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.02);
		overflow-wrap: anywhere;
	}

	.step-num {
		display: block;
		font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 12px;
		color: #5e6ad2;
		margin-bottom: 10px;
	}

	.steps h3 {
		font-size: 15px;
		font-weight: 590;
		letter-spacing: -0.165px;
		color: #f7f8f8;
		margin-bottom: 6px;
	}

	.steps p {
		font-size: 14px;
		line-height: 1.55;
		color: #8a8f98;
	}

	kbd {
		font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85em;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		padding: 1px 5px;
		color: #d0d6e0;
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
	}

	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		padding: 20px 0 28px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		font-size: 13px;
		color: #62666d;
	}

	footer a {
		color: #8a8f98;
		text-decoration: none;
	}

	footer a:hover {
		color: #828fff;
	}

	@media (max-width: 640px) {
		main {
			padding-top: 48px;
		}

		.steps {
			grid-template-columns: 1fr;
		}

		.dropzone {
			padding: 40px 16px;
		}

		footer {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
