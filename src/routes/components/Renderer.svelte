<script lang="ts">
	import parse from '../lib/parser';
	import docx from '../lib/docx';
	import download from '../lib/download';
	async function createDocx(file: File) {
		//const parsedData = await parse(file);
		//const fileBlob = await docx(parsedData);
		// TODO better way to do
		//download(fileBlob, file.name.replace('.html', '.docx'));
	}

	let files: FileList;
</script>

<div class="container">
    <div class="leftSide">
        <h1>Quizlet to DOCX</h1>
        <p>Easily save a Quizlet study set as a Word document.</p>
        <label for="html">Upload HTML file:</label>
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
    </div>
    <div class="rightSide">
        <h3>How to use:</h3>
        <ol>
            <li>Go to the Quizlet study set.</li>
            <li>Do Ctrl/Cmd + S and save the page as "Webpage, HTML Only"</li>
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
</style>
