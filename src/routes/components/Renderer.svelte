<script lang="ts">
	import parse from '../lib/parser';
	import docx from '../lib/docx';
	import download from '../lib/download';
	async function createDocx(file: File) {
		const parsedData = await parse(file);
		const fileBlob = await docx(parsedData);
		// TODO better way to do
		download(fileBlob,  file.name.replace('.html', '.docx'));
	}

	let files: FileList;
</script>

<label for="avatar">Upload an HTML file:</label>
<input accept=".html" bind:files name="html" type="file" />

<div>    
    {#if files}
    {#each Array.from(files) as file}
        {#await createDocx(file)}
            <p>Loading...</p>
        {:then}
            <pre>File has been downloaded successfully.</pre>
        {:catch error}
            <pre>{error}</pre>
        {/await}
    {/each}
    {/if}
</div>