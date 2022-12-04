<script lang="ts">
	import parse from './parser';
	import docx from './docx';
	import download from './download';
	async function createDocx(file: File) {
		const parsedData = await parse(file);
		const fileBlob = await docx(parsedData);
		// TODO better way to do
		download(fileBlob, "file.docx");
	}

	let files: FileList;
</script>

<label for="avatar">Upload an HTML file:</label>
<input accept=".html,.htm,.mhtml" bind:files name="html" type="file" />

{#if files}
	{#each Array.from(files) as file}
		${#await createDocx(file)}
			<p>Loading...</p>
		{:then}
			<pre>File has been downloaded successfully.</pre>
		{:catch error}
			<pre>{error}</pre>
		{/await}
	{/each}
{/if}
