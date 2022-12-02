<script lang="ts">
	import parse from './parser';
	import docx from './docx';

	async function createDocx(file: File) {
		const parsedData = await parse(file);
	}

	let files: FileList;
</script>

<label for="avatar">Upload an HTML file:</label>
<input accept=".html,.htm,.mhtml" bind:files name="html" type="file" />

{#if files}
	{#each Array.from(files) as file}
		${#await createDocx(file)}
			<p>Loading...</p>
		{:then buffer}
			<pre>{buffer}</pre>
		{:catch error}
			<pre>{error}</pre>
		{/await}
	{/each}
{/if}
