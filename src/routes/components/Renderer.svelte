<script lang="ts">
	import parse from '../lib/parser';
	import docx from '../lib/docx';
	import download from '../lib/download';

	let files: FileList;
	let status = '';
	let busy = false;

	async function createDocx(file: File) {
		busy = true;
		status = '';
		try {
			const parsedData = await parse(file);
			if (parsedData.length === 0) {
				status = `No cards found in ${file.name}. Make sure you saved the Quizlet study set page itself (Ctrl/Cmd+S, "Webpage, HTML Only") while the set was open.`;
				return;
			}
			const fileBlob = await docx(parsedData);
			download(fileBlob, file.name.replace(/\.x?html?$/i, '.docx'));
			status = `Exported ${parsedData.length} card${
				parsedData.length === 1 ? '' : 's'
			} from ${file.name}.`;
		} catch (error) {
			status = `Failed to export ${file.name}: ${error}`;
		} finally {
			busy = false;
		}
	}

	function onFileChange() {
		if (files && files.length > 0) {
			for (const file of Array.from(files)) createDocx(file);
		}
	}
</script>

<div class="container">
	<div class="leftSide">
		<h1>Quizlet to DOCX</h1>
		<p>Easily save a Quizlet study set as a Word document.</p>
		<label for="html">Upload HTML file:</label>
		<input accept=".html,.htm" bind:files name="html" type="file" on:change={onFileChange} />

		<div>
			{#if busy}
				<p>Loading...</p>
			{:else if status}
				<pre>{status}</pre>
			{/if}
		</div>
	</div>
	<div class="rightSide">
		<h3>How to use:</h3>
		<ol>
			<li>Go to the Quizlet study set.</li>
			<li>Press <kbd>ctrl/cmd + s</kbd> and save the page as "Webpage, HTML Only."</li>
			<li>Upload the HTML file to the website.</li>
			<li>Enjoy your newly created Word document!</li>
		</ol>
	</div>
</div>

<style>
	input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 6px 12px;
		display: block;
		margin-bottom: 20px;
	}

	pre {
		background: #eee;
		padding: 10px;
		border-radius: 4px;
	}

	label {
		display: block;
		margin-bottom: 10px;
	}

	.container {
		display: flex;
		justify-content: space-between;
		margin: 0 auto;
		max-width: 800px;
	}

	.leftSide {
		width: 50%;
	}

	.rightSide {
		width: 50%;
	}

	kbd {
		background: #eee;
		border-radius: 4px;
		padding: 2px 4px;
		font-size: 0.8em;
	}
</style>
